import { deriveFromMnemonic, deriveFromXpub } from "./hd_wallets";

function deriveAddresses() {
    console.log("\n======== 从帐户层直接派生出地址 =========");
    deriveFromXpub();
    console.log("\n======== 从助记词派 => 子私钥 => 公钥 => 地址 ================");
    deriveFromMnemonic();
}

deriveAddresses();

// New generated mnemonic: crouch wool feel maximum estate adjust aerobic dumb salt fan unusual utility

// ======== 从帐户层直接派生出地址 =========
// Account XPUB: tpubDCq5CvqawQ94Z9jZ4VfP6FAuAA7RS3K5RHQssT8p4ZTDguCzHXwFctY3XNKPa4tw7d3QRRmynQDTTS3fBz6d6jCJ585F3vhzke7MnJ2qLTg
// index=0 地址=tb1qtk4h6f2jj2tfgnwk4dcqxlkm7ga0jehn4kg2dh
// index=1 地址=tb1qsgu43zvs52vwpucsj0eka9xy5ka0y6pr25jrjl
// index=2 地址=tb1qlxtetd4a3zrmmxlsh2zwv52pdmensf4zjd7szj
// index=3 地址=tb1q92he5cp35wnlgzdljmeq4vduxvv6nw8cu44r9f
// index=4 地址=tb1q3sdk553v6kwruy0njhpwhw48cmmyu0s0a7r2nm

// ======== 从助记词派 => 子私钥 => 公钥 => 地址 ================
// index=0 地址=tb1qtk4h6f2jj2tfgnwk4dcqxlkm7ga0jehn4kg2dh 私钥=cVJRUEhTovwDoYGw8T86XPFmUrgpdU1tMqPwJqGSErgFSRhSL9LC
// index=1 地址=tb1qsgu43zvs52vwpucsj0eka9xy5ka0y6pr25jrjl 私钥=cRJZcZWDS7dcojVxBcz4SUEfdoksr34Uqg4YCRc4xMr17CWG8iiE
// index=2 地址=tb1qlxtetd4a3zrmmxlsh2zwv52pdmensf4zjd7szj 私钥=cNRDFA2NLsQira3V3Zm7ZD2CBbRWtKaQSo9uQpXSZWCVZPUEj28U
// index=3 地址=tb1q92he5cp35wnlgzdljmeq4vduxvv6nw8cu44r9f 私钥=cVYS79PvuZHJPx6rvCGXAzwDZcDUmFuvTm1XDW3n3WnVbv3Nvg19
// index=4 地址=tb1q3sdk553v6kwruy0njhpwhw48cmmyu0s0a7r2nm 私钥=cSXf8yXWAMDBb7beAwkLPEBFwbHFvBMbfX1Rh3sW2w1t8dH2TGa9
