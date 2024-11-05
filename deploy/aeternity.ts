
import fs from 'fs';
import { AeSdk, MemoryAccount, Node, CompilerHttpNode } from '@aeternity/aepp-sdk';

export const AE_TESTNET_RPC = 'https://testnet.aeternity.io';
export const AE_MAINNET_RPC = 'https://mainnet.aeternity.io';

export function getAeSdk(nodeRpc: string): AeSdk {
    const compiler = new CompilerHttpNode('https://v7.compiler.aepps.com')
    const node = new Node(nodeRpc);
    const account = new MemoryAccount((process.env as any)["AE_SECRET_KEY"]);

    return new AeSdk({
      nodes: [{ name: 'bridge', instance: node }],
      accounts: [account],
      onCompiler: compiler
    });
}


export async function deployAeternityAssets(sdk: AeSdk, tokens: {contract: string, name: string, decimals: number, symbol: string}[]) {
    console.log("Deploying aeternity assets...");

    const assets: any = {}
    for (let token of tokens) {
        const sourceCode = `// ${token.symbol}\n` + fs.readFileSync(`${__dirname}/../contracts/FungibleTokenFull.aes`, { encoding: "utf-8" });
        const contract = await sdk.initializeContract({ sourceCode });

        const tx: any = await contract.init(token.name, token.decimals, token.symbol, undefined);
        console.log(token.symbol, tx.address);
        assets[token.symbol] = {
            aeternity: tx.address,
            ethereum: token.contract,
        }
    }

    return assets
}

export async function deployAeternityBridge(sdk: AeSdk, assets: { [symbol:string] : { aeternity: string, ethereum: string }}): Promise<string> {
    console.log("Deploying aeternity bridge...");

    const sourceCode = `// nonce: ${Date.now()} \n` + fs.readFileSync(`${__dirname}/../contracts/Bridge.aes`, { encoding: "utf-8" });
    const bridge = await sdk.initializeContract({ sourceCode });
    let native_ae = assets['WAE']
    let native_eth = assets['ETH'] 
    for (let key in assets) {
        if (key === 'WAE' || key === 'ETH') {
            delete assets[key];
        }
    }
    // UPDATE ABI
    fs.writeFileSync(`${__dirname}/../__SNAPSHOT__/bridge.aci`, JSON.stringify(bridge._aci, null, 4), { encoding: "utf-8" });

    const arg = Object.values(assets).reduce((s, { ethereum, aeternity }) => ({...s, [ethereum]: aeternity}), {});
    const arg_native_eth = {
        eth_addr : native_eth.ethereum,
        underlying_token : native_eth.aeternity,
    };
    const arg_native_ae = {
        eth_addr : native_ae.ethereum,
        underlying_token : native_ae.aeternity,
    };
    const tx: any = await bridge.init(arg, arg_native_ae, arg_native_eth);
    const bridgeAddress = tx.address;

    console.log("...");
    console.log("Setting aeETH and AE placeholder ...");
    await bridge.update_native_ae([native_ae.ethereum, native_ae.aeternity]);
    await bridge.update_native_eth([native_eth.ethereum, native_eth.aeternity]);

    // Set processors
    console.log("Configure aeternity processors...");
    const processors = JSON.parse(fs.readFileSync(`${__dirname}/processors.json`, { encoding: "utf-8" }));
    for (let processor of processors.aeternity) {
        (await bridge.add_processor(processor));
    }

    // Set bridge as assets owner
    const assetSourceCode = fs.readFileSync(`${__dirname}/../contracts/FungibleTokenFull.aes`, { encoding: "utf-8" });
    assets['ETH'] = native_eth;
    for (let token of Object.values(assets)) {
        const asset = await sdk.initializeContract({ sourceCode: assetSourceCode, address: token.aeternity as any });

        // UPDATE ACI
        fs.writeFileSync(`${__dirname}/../__SNAPSHOT__/asset.aci`, JSON.stringify(asset._aci, null, 4), { encoding: "utf-8" });

        console.log(`Setting ${bridgeAddress} as asset ${token.aeternity} owner`);
        await asset.change_owner(bridgeAddress.replace("ct_", "ak_"));
        await bridge.confirm_asset_owner(token.ethereum);
    }

    return bridgeAddress;
}

export async function updateProcessors(sdk: AeSdk, bridgeAddress: string): Promise<void> {
    const sourceCode = `// nonce: ${Date.now()} \n` + fs.readFileSync(`${__dirname}/../contracts/Bridge.aes`, { encoding: "utf-8" });
    const bridge = await sdk.initializeContract({ sourceCode, address: bridgeAddress as any });

    // Set processors
    console.log("Configure aeternity processors...");
    const processors = JSON.parse(fs.readFileSync(`${__dirname}/processors.json`, { encoding: "utf-8" }));
    for (let processor of processors.aeternity) {
        (await bridge.add_processor(processor));
    }
}
