import * as bitcoin from "bitcoinjs-lib"; // 处理比特币交易的库
import * as bip39 from "bip39"; // 负责生成助记词
import * as ecc from "tiny-secp256k1"; // 椭圆曲线算法
import BIP32Factory from "bip32"; // 负责 BIP32 HD 派生路径
import * as dotenv from "dotenv";

dotenv.config();

bitcoin.initEccLib(ecc); // 告诉 bitcoinjs-lib 使用 tiny-secp256k1 椭圆曲线算法（绑定）
const bip32 = BIP32Factory(ecc); // BIP32Factory 表示用 ecc 作为底层加密模块，构造一个 BIP32 HD 钱包工厂
const network = bitcoin.networks.testnet;

// 1. 生成助记词
// const mnemonic = bip39.generateMnemonic();
// console.log("New generated mnemonic:", mnemonic);
const mnemonic = process.env.MNEMONIC as string; // 如果已经创建了

// 2. 助记词 -> seed
const seed = bip39.mnemonicToSeedSync(mnemonic);
// 什么是 seed？助记词（mnemonic） → 通过 PBKDF2 → 生成一串 512bit 的随机数据，这就是 seed，seed 就是整个钱包的根。

// 3. 种子 -> root (含私钥)
export const root = bip32.fromSeed(seed, network);
// BIP32 的 root node，包含一个私钥，包含一个可以用于派生子私钥的 chain code，可以 derivePath 派生子节点。是整个钱包的核心私钥。

// 方法 1：从 xpub 派生地址
export async function deriveFromXpub() {
    // 先用 root 派生到帐户层
    // 生成 BIP84 account: m/84'/1'/0'
    const account = root.derivePath("m/84'/1'/0'"); // 测试网路径
    // 路径解释：
    // m   =>  主私钥（master private key）
    // 84' =>  purpose，表示使用 BIP84 标准
    // 1'  =>  coin_type=1（测试网）主网是 0'
    // 0' =>  account，表示使用第一个账户

    // 从帐户层导出 xpub（可以保存到服务器端）
    const xpub = account.neutered().toBase58();
    // neutered() = 去掉私钥，变成扩展公钥（xpub）。
    // xpub 包含：公钥、chain code（用于派生子公钥）、网络参数、深度信息
    console.log("Account XPUB:", xpub);

    const accountNode = bip32.fromBase58(xpub, network);

    for (let i = 0; i < 5; i++) {
        const child = accountNode.derive(0).derive(i);

        const { address } = bitcoin.payments.p2wpkh({
            pubkey: child.publicKey,
            network,
        });
        // 通过 xpub 派生出来得不到私钥

        console.log(`index=${i} 地址=${address}`);
    }
}

// 方法 2：从助记词派 => 子私钥 => 公钥 => 地址
export async function deriveFromMnemonic() {
    for (let i = 0; i < 5; i++) {
        const path = `m/84'/1'/0'/0/${i}`; // 硬化路径只能从根节点派生
        // m             - master private key
        // 84'           - BIP84 (native segwit)
        // 1'            - testnet coin type
        // 0'            - account 0
        // 0             - external chain (收款地址)
        // i             - index

        // Q 什么是硬化路径？
        // 带 ' 的叫硬化路径，如 84'，只能从 私钥（xprv） 派生，保护私钥不被暴露。
        const child = root.derivePath(path);

        const { address } = bitcoin.payments.p2wpkh({
            pubkey: child.publicKey,
            network,
        });

        console.log(`index=${i} 地址=${address} 私钥=${child.toWIF()}`);
    }
}
