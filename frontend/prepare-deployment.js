const fs = require('fs');

const network = process.argv[2];

if (!['sepolia', 'mainnet'].includes(network)) {
    throw new Error(`Unexpected network: ${network}`);
}

const assets = JSON.parse(
    fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network}_assets.json`, { encoding: 'utf-8' }),
);
const bridge = JSON.parse(
    fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network}_bridge.json`, { encoding: 'utf-8' }),
);
const tokenInfo = JSON.parse(fs.readFileSync(`${__dirname}/../deploy/tokens.json`, { encoding: 'utf-8' }));

const bridge_aci = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/bridge.aci`, { encoding: 'utf-8' }));
const asset_aci = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/asset.aci`, { encoding: 'utf-8' }));

const bridge_abi = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/bridge.abi`, { encoding: 'utf-8' }));
const asset_abi = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/asset.abi`, { encoding: 'utf-8' }));
const wrapped_ae_abi = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/wrapped_ae.abi`, { encoding: 'utf-8' }));

const deployment = {
    ethereum: {
        bridge_address: bridge.ethereum,
        chainId: '0xaa36a7',
        explorer: 'https://sepolia.etherscan.io',
        bridge_abi,
        asset_abi,
        wrapped_ae_abi,
        wae: assets['WAE'].ethereum,
        default_eth: assets['ETH'].ethereum
    },
    aeternity: {
        bridge_address: bridge.aeternity,
        explorer: 'https://testnet.aescan.io',
        rpc: 'https://testnet.aeternity.io',
        bridge_aci,
        asset_aci,
        aeeth: assets['ETH'].aeternity,
        default_ae: assets['WAE'].aeternity,
    },
    assets: [],
};

if (network == 'mainnet') {
    deployment.ethereum.chainId = '0x1';
    deployment.ethereum.explorer = 'https://etherscan.io';
    deployment.aeternity.explorer = 'https://aescan.io';
    deployment.aeternity.rpc = 'https://mainnet.aeternity.io';
}

let rank = 1;
native_tokens = [
    {
      "token_rank": 1,
      "link": "https://etherscan.io/token/0xAbaE76F98A84D1DC3E0af8ed68465631165d33B2",
      "contract": "0xAbaE76F98A84D1DC3E0af8ed68465631165d33B2",
      "nameandsymbol": "Wrapped Ethereum (ETH)",
      "name": "Wrapped Ethereum",
      "symbol": "ETH",
      "decimals": 18,
      "icon": "https://cryptologos.cc/logos/ethereum-eth-logo.png"
    },
    {
      "token_rank": 2,
      "link": "https://etherscan.io/token/0xCa781A1779c8f363f7F82BF6f4B406e5d54bAE1F",
      "contract": "0xCa781A1779c8f363f7F82BF6f4B406e5d54bAE1F",
      "nameandsymbol": "Wrapped AE (WAE)",
      "name": "Wrapped AE",
      "symbol": "WAE",
      "decimals": 18,
      "icon": "https://cryptologos.cc/logos/aeternity-ae-logo.png",
    }
]

for (const token of native_tokens) {
    if (assets[token.symbol]) {
        token.token_rank = rank;
        rank += 1;
        deployment.assets.push({
            ...token,
            ethAddress: assets[token.symbol].ethereum,
            aeAddress: assets[token.symbol].aeternity,
        });

    }
}

for (let token of tokenInfo) {
    if (assets[token.symbol]) {
        token.token_rank = rank;
        rank += 1;
        deployment.assets.push({
            ...token,
            ethAddress: assets[token.symbol].ethereum,
            aeAddress: assets[token.symbol].aeternity,
        });
    }
}

fs.writeFileSync(`${__dirname}/src/deployment.json`, JSON.stringify(deployment, null, 4), { encoding: 'utf-8' });
