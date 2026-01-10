import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config();

const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL as string;

export enum Network {
    TESTNET = "test3",
    MAINNET = "main",
}

//     curl -X POST https://bitcoin-testnet.g.alchemy.com/v2/docs-demo \
//      -H "Content-Type: application/json" \
//      -d '{
//   "jsonrpc": "2.0",
//   "method": "sendrawtransaction",
//   "params": [
//     "0200000000010153fc6712e0c6cbfd15e56743f2a16bba3c0b17837d4fd33d68d2d930739e2b130000000000ffffffff01c0c62d0000000000160014c24b61118d4a2b36257b65e1ea7f15f85e41ff0402483045022100ac32e935715a57ec1d642a5e178c37f74c013bf8e4edc4cb1c79f5352f136e87022020b0b3192347d1b84e9b89d00a2ecb290f18f9c39e514fa3ef2b7a889e7b6c1b012103ab0b56c7aa6254a80c124e04d2149f7fc376afedfe4623f3c59b87c279eaeb1400000000",
//     "0.1"
//   ],
//   "id": 1
// }'
export async function broadcastTransactionWithAlchemy(txHex: string) {
    const res = await fetch(ALCHEMY_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "sendrawtransaction",
            params: [txHex, 0.1],
            id: 1,
        }),
    });
    if (!res.ok) throw new Error(`broadcast transaction failed ${res.status}`);
    const j = await res.json();
    return j;
}

// curl -X POST https://bitcoin-testnet.g.alchemy.com/v2/docs-demo \
//      -H "Content-Type: application/json" \
//      -d '{
//   "jsonrpc": "2.0",
//   "method": "gettxout",
//   "params": [
//     "546263a196ce5cf674d5002afc0231ab417c2e971fd4ed1735c7a4c63f44720b",
//     0,
//     true
//   ],
//   "id": 1
// }'

// {
//     bestblock: '0000000085d19511a71fce474b98f82c444b567a0ca1061146a0c1bb6c53f1f1',
//     confirmations: 10,
//     value: 0.00193745,
//     scriptPubKey: {
//       asm: '0 bac34d2cd6b60ec163fd2e6a1da128020349f5cb',
//       desc: 'addr(tb1qhtp56txkkc8vzcla9e4pmgfgqgp5nawthyx98w)#xhsj3fmx',
//       hex: '0014bac34d2cd6b60ec163fd2e6a1da128020349f5cb',
//       address: 'tb1qhtp56txkkc8vzcla9e4pmgfgqgp5nawthyx98w',
//       type: 'witness_v0_keyhash'
//     },
//     coinbase: false
//   }
interface UTXOWithAlchemy {
    bestblock: string;
    confirmations: number;
    value: number;
    scriptPubKey: {
        asm: string;
        desc: string;
        hex: string;
        address: string;
        type: string;
    };
    coinbase: boolean;
}
export async function fetchUTXOsWithAlchemy(
    txHash: string,
    voutIndex: number
): Promise<UTXOWithAlchemy> {
    const res = await fetch(ALCHEMY_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "gettxout",
            params: [txHash, voutIndex, true],
            id: 1,
        }),
    });
    if (!res.ok) throw new Error(`fetch utxo failed ${res.status}`);
    const j = (await res.json()) as { result: UTXOWithAlchemy };
    return j.result as UTXOWithAlchemy;
}
