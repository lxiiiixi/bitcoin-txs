import { deriveFromMnemonic, deriveFromXpub } from "./hd_wallets";

function deriveAddresses() {
    console.log("\n======== 从帐户层直接派生出地址 =========");
    deriveFromXpub();
    console.log("\n======== 从助记词派 => 子私钥 => 公钥 => 地址 ================");
    deriveFromMnemonic();
}

deriveAddresses();

// ======== 从帐户层直接派生出地址 =========
// Account XPUB: tpubDCopmJKbKHvLLyuduCJs4Zrj1n4CL44VU5tgkU7iai5MP13Z1H1ByGH6AsEKXgDZsvVm6gG3udFSU1Y5dGhKxLt1iidXC95c6Beap9LfBYp
// index=0 地址=tb1qhtp56txkkc8vzcla9e4pmgfgqgp5nawthyx98w
// index=1 地址=tb1qjwpv4f76kktk252w7xnf4dv635ate804z9mtn7
// index=2 地址=tb1qv457sfesvwz32c25re7fz6lwr56qv3chlps0a3
// index=3 地址=tb1qwzyf62ew0cc09aly597ky0weyqz6e4qx46hh0n
// index=4 地址=tb1q6zw9s3thff8lgt6cz9t9whjdqlk82awkddpug4

// ======== 从助记词派 => 子私钥 => 公钥 => 地址 ================
// index=0 地址=tb1qhtp56txkkc8vzcla9e4pmgfgqgp5nawthyx98w 私钥=cTVJzC9ZL32LxBDPcnW5ExQwojoT1g14vWRyiruNoBgzebuKr
// index=1 地址=tb1qjwpv4f76kktk252w7xnf4dv635ate804z9mtn7 私钥=cThvtR6depJT1k4kjprNkekeqZFXuVTV66AkyRXLnqcJNJYfC
// index=2 地址=tb1qv457sfesvwz32c25re7fz6lwr56qv3chlps0a3 私钥=cQuGXRhaGFTezvWGM6i7PnnLRnGJNAiDXvWRynCaYVKf5VJwZ
// index=3 地址=tb1qwzyf62ew0cc09aly597ky0weyqz6e4qx46hh0n 私钥=cNXaG9Uk39DKbYXZSYLAEiSa7FKWHHoppNuwjtyxT3bhWZqZf
// index=4 地址=tb1q6zw9s3thff8lgt6cz9t9whjdqlk82awkddpug4 私钥=cW1zm2234L3jHu2ouUybMt3z86RhFsAc3Y8zYSi6wv28tuV3k
