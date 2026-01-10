import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config();

export interface UTXO {
    tx_hash: string;
    tx_output_n: number;
    value: bigint;
    script: string;
}

export enum Network {
    TESTNET = "test3",
    MAINNET = "main",
}

export const BLOCKCYPHER_TOKEN = process.env.BC_TOKEN as string;

export async function fetchUTXOs(address: string) {
    const url = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}?unspentOnly=true&includeScript=true&token=${BLOCKCYPHER_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch utxo failed ${res.status}`);
    const j = await res.json();
    console.log(`[BlockCypher] fetchUTXOs response of ${address}:`, JSON.stringify(j, null, 2));
    // BlockCypher 返回：txrefs 数组（也可能是 empty），字段: tx_hash, tx_output_n, value, script
    return (j as any).txrefs || ([] as UTXO[]);
}

export async function broadcastTransaction(txHex: string, network: Network = Network.TESTNET) {
    const url = `https://api.blockcypher.com/v1/btc/${network}/txs/push?token=${BLOCKCYPHER_TOKEN}`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tx: txHex }),
    });
    if (!res.ok) throw new Error(`broadcast transaction failed ${res.status}(${await res.text()})`);
    const j = await res.json();
    return j;
}

export async function getBalance(address: string, network: Network = Network.TESTNET) {
    const url = `https://api.blockcypher.com/v1/btc/${network}/addrs/${address}/balance?token=${BLOCKCYPHER_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`get balance failed ${res.status}`);
    const j = await res.json();
    return j;
}

/**
 * 查询某个特定地址相关的所有信息
 * curl "https://api.blockcypher.com/v1/btc/test3/addrs/tb1qu63netywsfh7x6u56ka58wjua4d2qscdyj65xv"
 */
export async function getAddressInfo(address: string, network: Network = Network.TESTNET) {
    const url = `https://api.blockcypher.com/v1/btc/${network}/addrs/${address}?token=${BLOCKCYPHER_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`get address info failed ${res.status}`);
    const j = await res.json();
    return j;
}

/**
 * var webhook = {
  "event": "unconfirmed-tx", // unconfirmed-tx, new-block, confirmed-tx, tx-confirmation, double-spend-tx, tx-confidence.
  "address": "15qx9ug952GWGTNn7Uiv6vode4RcGrRemh",
  "url": "https://my.domain.com/callbacks/new-tx"
}
var url = 'https://api.blockcypher.com/v1/btc/main/hooks?token='+TOKEN;
$.post(url, JSON.stringify(webhook))
  .then(function(d) {console.log(d)});
{
"id": "399d0923-e920-48ee-8928-2051cbfbc369"
"event": "unconfirmed-tx",
"address": "15qx9ug952GWGTNn7Uiv6vode4RcGrRemh",
"token": "YOURTOKEN",
"url": "https://my.domain.com/callbacks/new-tx",
"callback_errors": 0
}
 */
export async function createWebhook(
    event:
        | "unconfirmed-tx"
        | "confirmed-tx"
        | "new-block"
        | "tx-confirmation"
        | "double-spend-tx"
        | "tx-confidence",
    webhookUrl: string,
    address: string = "",
    network: Network = Network.TESTNET
) {
    const requestUrl = `https://api.blockcypher.com/v1/btc/${network}/hooks?token=${BLOCKCYPHER_TOKEN}`;
    const res = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            event,
            address: address || undefined,
            url: webhookUrl,
        }),
    });
    if (!res.ok) throw new Error(`create webhook failed ${res.status}`);
    const j = await res.json();
    return j;
}
