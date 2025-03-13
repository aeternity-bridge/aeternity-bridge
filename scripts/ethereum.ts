import { ethers } from "hardhat";
import fs from 'fs';

const NUM_OF_MOCK_ASSETS = 2;

export async function deployMockAssets() {
    const assets = JSON.parse(fs.readFileSync(`${__dirname}/../configs/mocked_tokens.json`, { encoding: "utf-8" })).slice(0, NUM_OF_MOCK_ASSETS);
    
    const deployed = [];

    console.log("Deploying mocked assets...");
    for (let asset of assets) {
        console.log(`Deploying asset ${asset.symbol}`);
        const token = await ethers.deployContract("MockedERC20", [asset.name, asset.symbol, asset.decimals]);

        // UPDATE ABI
        fs.writeFileSync(`${__dirname}/../__SNAPSHOT__/asset.abi`, token.interface.formatJson(), { encoding: "utf-8" });

        await token.waitForDeployment();

        // Mint some test tokens
        const recipient = (await ethers.getSigners())[0].address;
        let amount = `100000${'0'.repeat(asset.decimals)}`
        console.log(`Minting 100000 test tokens for ${recipient}`);
        await (await token.mint(recipient, amount)).wait(1);

        deployed[asset.symbol] = await token.getAddress();
        deployed.push({
            ...asset,
            contract: await token.getAddress()
        })
    }
    return deployed;
}

export async function deployNativeAssets() {
    const deployed = [];

    console.log("Deploying native assets and placeholders...");
    let wrapped_ae = {
        "token_rank": NUM_OF_MOCK_ASSETS+1,
        "link": "",
        "contract": "",
        "nameandsymbol": "Wrapped AE (WAE)",
        "name": "Wrapped Aeternity",
        "symbol": "WAE",
        "decimals": 18,
        "icon": ""
    };
    console.log(`Deploying asset ${wrapped_ae.symbol}`);
    const wae_token = await ethers.deployContract("WrappedAeternity", [wrapped_ae.name,wrapped_ae.symbol])

    // UPDATE ABI
    fs.writeFileSync(`${__dirname}/../__SNAPSHOT__/wrapped_ae.abi`, wae_token.interface.formatJson(), { encoding: "utf-8" });
    await wae_token.waitForDeployment();

    deployed[wrapped_ae.symbol] = await wae_token.getAddress();
    deployed.push({
        ...wrapped_ae,
        contract: await wae_token.getAddress()
    })

    let native_eth_placeholder = {
        "token_rank": NUM_OF_MOCK_ASSETS+2,
        "link": "",
        "contract": "",
        "nameandsymbol": "aeterinity Ethereum (ETH)",
        "name": "Native Ethereum Placeholder",
        "symbol": "ETH",
        "decimals": 18,
        "icon": ""
    };
    console.log(`Deploying asset ${native_eth_placeholder.symbol}`);
    const eth_placeholder_token = await ethers.deployContract("MockedERC20", [native_eth_placeholder.name, native_eth_placeholder.symbol, native_eth_placeholder.decimals]);
    await eth_placeholder_token.waitForDeployment();

    deployed[native_eth_placeholder.symbol] = await eth_placeholder_token.getAddress();
    deployed.push({
        ...native_eth_placeholder,
        contract: await eth_placeholder_token.getAddress()
    })
    return deployed;
}