import { ethers, upgrades, network } from 'hardhat';
import fs from 'fs';
import dotenv from 'dotenv';
import '@nomicfoundation/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades'

import * as aeternity from './aeternity';
import * as ethereum from './ethereum';
import { keccak256 } from 'ethers';

// Load env
dotenv.config();

async function testnetDeployment(reuseEthAssets: boolean = false, onlyAE: boolean = false) {
  const aeSdk = aeternity.getAeSdk(aeternity.AE_TESTNET_RPC)
  
  let tokens: any[];

  if (!reuseEthAssets) {
    // Deploy ERC20 tokens
    tokens = await ethereum.deployMockAssets();

    // Deploy Wrapped AE and native_eth_placeholder
    let native_tokens = await ethereum.deployNativeAssets();
    tokens.push(...native_tokens);
  } else {
    tokens = deployedEthAssets();
  }

  let ethBridgeAddress: string;

  if (!onlyAE) {
    console.log("Deploying bridge...");
    const BridgeV2 = await ethers.getContractFactory("BridgeV2");
    const bridge = await upgrades.deployProxy(BridgeV2);

    await bridge.waitForDeployment();
    const bridgeAddress = await bridge.getAddress();

    const wrapped_ae = tokens.filter((val) => val.symbol === 'WAE')[0];
    const eth = tokens.filter((val) => val.symbol === 'ETH')[0];

    console.log("Setting WAE and ETH placeholder ...");
    await bridge.setWAE(wrapped_ae.contract);
    await bridge.setEthPlaceholder(eth.contract);

    const token = await (await ethers.getContractFactory("WrappedAeternity")).attach(wrapped_ae.contract);
    console.log(`Transfer ownership of ${wrapped_ae.contract} to ${bridgeAddress}`);
    const tx = await token.grantRole(keccak256(Buffer.from('MANAGER_ROLE', 'utf8')), bridgeAddress);
    await tx.wait();

    // Set processors
    const processors = JSON.parse(fs.readFileSync(`${__dirname}/../configs/processors.json`, { encoding: "utf-8" }));
    for (let processor of processors.ethereum) {
      await bridge.addSigner(processor);
    }

    ethBridgeAddress = await bridge.getAddress();

    // UPDATE ABI
    fs.writeFileSync(`${__dirname}/../__SNAPSHOT__/bridge.abi`, bridge.interface.formatJson(), { encoding: "utf-8" });
  } else {
    let bridgeInfo = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, { encoding: "utf-8" }));
    ethBridgeAddress = bridgeInfo.ethereum;
  }

  const assets = await aeternity.deployAeternityAssets(aeSdk, tokens);
  // Snapshot assets
  fs.writeFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_assets.json`, JSON.stringify(assets, null, 4), { encoding: "utf-8" });

  const aeBridgeAddress = await aeternity.deployAeternityBridge(aeSdk, assets);

  const bridgeInfo = {
    ethereum: ethBridgeAddress,
    aeternity: aeBridgeAddress
  };

  fs.writeFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, JSON.stringify(bridgeInfo, null, 4), { encoding: "utf8" });

  console.log("Ethereum bridge: ", bridgeInfo.ethereum);
  console.log("Aeternity bridge: ", bridgeInfo.aeternity);
}

function deployedEthAssets(): any[] {
  const assets = JSON.parse(fs.readFileSync(`${__dirname}/../configs/mocked_tokens.json`, { encoding: "utf-8" }));
  const deployed = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/sepolia_assets.json`, { encoding: "utf-8" }));

  assets.push({
    "token_rank": 2,
    "link": "",
    "contract": "",
    "nameandsymbol": "Wrapped AE (WAE)",
    "name": "Wrapped Aeternity",
    "symbol": "WAE",
    "decimals": 18,
    "icon": ""
  });

  assets.push({
    "token_rank": 3,
    "link": "",
    "contract": "",
    "nameandsymbol": "aeterinity Ethereum (ETH)",
    "name": "Native Ethereum Placeholder",
    "symbol": "ETH",
    "decimals": 18,
    "icon": ""
  });

  return assets.map((asset: any) => ({
    ...asset,
    contract: deployed[asset.symbol].ethereum
  }));
}

async function mainnetDeployment() {
  const aeSdk = aeternity.getAeSdk(aeternity.AE_MAINNET_RPC)

  const tokens = JSON.parse(fs.readFileSync(`${__dirname}/../configs/tokens.json`, { encoding: "utf-8" }));

  console.log("Deploying bridge...");
  const BridgeV2 = await ethers.getContractFactory("BridgeV2");
  const bridge = await upgrades.deployProxy(BridgeV2);

  await bridge.waitForDeployment();

  let bridgeInfo = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, { encoding: "utf-8" }));

  bridgeInfo.ethereum = await bridge.getAddress();

  fs.writeFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, JSON.stringify(bridgeInfo, null, 4), { encoding: "utf8" });

  const assets = await aeternity.deployAeternityAssets(aeSdk, tokens);
  // Snapshot assets
  fs.writeFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_assets.json`, JSON.stringify(assets, null, 4), { encoding: "utf-8" });

  bridgeInfo.aeternity = await aeternity.deployAeternityBridge(aeSdk, assets);

  fs.writeFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, JSON.stringify(bridgeInfo, null, 4), { encoding: "utf8" });

  console.log("Ethereum bridge: ", bridgeInfo.ethereum);
  console.log("Aeternity bridge: ", bridgeInfo.aeternity);

  // UPDATE ABI
  fs.writeFileSync(`${__dirname}/../__SNAPSHOT__/bridge.abi`, bridge.interface.formatJson(), { encoding: "utf-8" });
}

if (network.name == "mainnet") {
  mainnetDeployment().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
} else {
  testnetDeployment().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}