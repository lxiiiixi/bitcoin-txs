import * as bitcoin from "bitcoinjs-lib";
import { broadcastTransaction, fetchUTXOs, UTXO } from "./blockcypher";
import * as dotenv from "dotenv";
import { root } from "./hd_wallets";
import { broadcastTransactionWithAlchemy, fetchUTXOsWithAlchemy } from "./alchemy";

dotenv.config();

const network = bitcoin.networks.testnet;

// 根据 index 获取 keyPair
async function getKeyPair(index: number) {
    const path = `m/84'/1'/0'/0/${index}`;
    const child = root.derivePath(path);
    return child;
}

export function selectUTXOs(
    utxos: UTXO[],
    targetPlusFee: bigint
): { chosen: UTXO[]; sum: bigint } | null {
    // 简单贪心选币（从大到小），生产环境用更好策略
    utxos.sort((a, b) => {
        if (a.value > b.value) return -1;
        if (a.value < b.value) return 1;
        return 0;
    });
    const chosen: UTXO[] = [];
    let sum: bigint = BigInt(0);
    for (const u of utxos) {
        chosen.push(u);
        sum += BigInt(u.value);
        if (sum >= targetPlusFee) break;
    }
    if (sum < targetPlusFee) return null;
    return { chosen, sum };
}

async function transferByBlockcypher(
    account: { index: number; address: string },
    amountSat: bigint,
    feeSat: bigint,
    toAddress: string
) {
    const utxos = await fetchUTXOs(account.address);
    console.log("utxos:", utxos);

    if (!utxos.length) throw new Error("没有可用 UTXO");

    const need: bigint = amountSat + feeSat;
    const pick = selectUTXOs(utxos, need);

    console.log("pick:", pick);

    if (!pick) throw new Error("UTXO 不足");

    const psbt = new bitcoin.Psbt({ network });
    for (const utxo of pick.chosen) {
        psbt.addInput({
            hash: utxo.tx_hash,
            index: utxo.tx_output_n,
            //  witnessUtxo 只能用于 SegWit 类输入。
            witnessUtxo: {
                script: Buffer.from(utxo.script, "hex"),
                value: BigInt(utxo.value),
            },
        });
    }

    // 输出：主接收方
    psbt.addOutput({
        address: toAddress,
        value: amountSat,
    });

    // 找零回到 FROM_ADDRESS（如果有多余）
    // 不找零的话会造成财产丢失
    const change: bigint = pick.sum - amountSat - feeSat;
    if (change > BigInt(0)) {
        psbt.addOutput({
            address: account.address,
            value: change,
        });
    }

    const keyPair = await getKeyPair(account.index);
    for (let i = 0; i < pick.chosen.length; i++) {
        // 这里的顺序的确有可能是不对的
        // 要根据 utxo 所属的地址的 index 来确定 keyPair
        psbt.signInput(i, keyPair);
    }

    psbt.finalizeAllInputs();

    const rawTx = psbt.extractTransaction().toHex();
    console.log("\n📦 原始交易 hex:");
    console.log(rawTx);

    // 广播交易
    console.log("\n📡 广播交易中...");
    const response = await broadcastTransaction(rawTx);

    console.log("\n🚀 广播成功！");
    console.log("🔗 交易详情:", JSON.stringify(response, null, 2));
}

async function transferByScript(
    account: { index: number; address: string },
    amountSat: bigint,
    feeSat: bigint,
    toAddress: string
) {
    const need: bigint = amountSat + feeSat;
    const psbt = new bitcoin.Psbt({ network });

    // https://mempool.space/testnet/tx/a1032e96c8c636dad6b7eaddf9d4137d37af97fcc5effea6a49b71d951059820
    psbt.addInput({
        hash: "a1032e96c8c636dad6b7eaddf9d4137d37af97fcc5effea6a49b71d951059820",
        index: 1,
        witnessUtxo: {
            script: Buffer.from("00145dab7d25529296944dd6ab70037edbf23af966f3", "hex"),
            value: BigInt(142448),
        },
    });

    // 输出：主接收方
    psbt.addOutput({
        address: toAddress,
        value: amountSat,
    });

    // 找零回到 FROM_ADDRESS（如果有多余）
    // 不找零的话会造成财产丢失
    const change: bigint = need - amountSat - feeSat;
    if (change > BigInt(0)) {
        psbt.addOutput({
            address: account.address,
            value: change,
        });
    }

    const keyPair = await getKeyPair(account.index);
    psbt.signInput(0, keyPair);

    psbt.finalizeAllInputs();

    const rawTx = psbt.extractTransaction().toHex();
    console.log("\n📦 原始交易 hex:");
    console.log(rawTx);

    // 广播交易
    console.log("\n📡 广播交易中...");
    const response = await broadcastTransaction(rawTx);

    console.log("\n🚀 广播成功！");
    console.log("🔗 交易详情:", JSON.stringify(response, null, 2));
}

const toAcconut = "tb1qsgu43zvs52vwpucsj0eka9xy5ka0y6pr25jrjl";
const account0 = { index: 0, address: "tb1qtk4h6f2jj2tfgnwk4dcqxlkm7ga0jehn4kg2dh" };

// transferByScript(
//     account0,
//     BigInt(300), // 转账金额（必须大于手续费）
//     BigInt(200), // 手续费
//     toAcconut
// );

async function transferByAlchemy(
    senderAccount: {
        index: number;
        address: string;
    },
    amountSatToSend: bigint,
    feeSat: bigint,
    toAddress: string
) {
    const input_hash = "a1032e96c8c636dad6b7eaddf9d4137d37af97fcc5effea6a49b71d951059820";
    const input_index = 1;
    const inputUtxo = await fetchUTXOsWithAlchemy(input_hash, input_index);
    console.log("inputUtxo:", inputUtxo);
    if (!inputUtxo) throw new Error("UTXO 不存在");
    const utxoBalance = BigInt(inputUtxo.value * 1e8);
    const changeSatAmount = utxoBalance - amountSatToSend - feeSat;

    console.log("   余额:", utxoBalance);
    console.log("   发送金额:", amountSatToSend);
    console.log("   手续费:", feeSat);
    console.log("   找零:", changeSatAmount);
    if (changeSatAmount <= BigInt(0)) {
        throw new Error("UTXO 不足");
    }

    const psbt = new bitcoin.Psbt({ network });
    psbt.addInput({
        hash: input_hash,
        index: input_index,
        witnessUtxo: {
            script: Buffer.from(inputUtxo.scriptPubKey.hex, "hex"),
            value: utxoBalance,
        },
    });
    psbt.addOutput({
        address: toAddress,
        value: amountSatToSend,
    });
    psbt.addOutput({
        address: senderAccount.address,
        value: changeSatAmount,
    });
    // sign
    const keyPair = await getKeyPair(senderAccount.index);
    psbt.signInput(senderAccount.index, keyPair);
    psbt.finalizeAllInputs();

    const rawTx = psbt.extractTransaction().toHex();
    console.log("\n📦 原始交易 hex:");
    console.log(rawTx);
    const response = await broadcastTransactionWithAlchemy(rawTx);
    console.log("\n🚀 广播成功！");
    console.log("🔗 交易详情:", JSON.stringify(response, null, 2));
}

transferByAlchemy(account0, BigInt(300), BigInt(200), toAcconut);
