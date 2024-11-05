import { ethers, upgrades, network } from 'hardhat';
import fs from 'fs';
import dotenv from 'dotenv';
import '@nomicfoundation/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades'

import * as aeternity from './aeternity';
import * as ethereum from './ethereum';
import { wrapped } from '@aeternity/aepp-sdk/es/tx/builder/field-types';

// Load env
dotenv.config();

async function testnetDeployment() {
  const aeSdk = aeternity.getAeSdk(aeternity.AE_TESTNET_RPC)
  
  // Deploy ERC20 tokens
  let tokens = await ethereum.deployMockAssets();

  // Deploy Wrapped AE and native_eth_placeholder
  let native_tokens = await ethereum.deployNativeAssets();
  tokens.push(...native_tokens);

  const tokenAddresses = tokens.map(({ contract }: any) => contract);
  // tokenAddresses.push(wrapped_ae)

  console.log("Deploying bridge...");
  const BridgeV1 = await ethers.getContractFactory("BridgeV1");
  const bridge = await upgrades.deployProxy(BridgeV1);

  await bridge.waitForDeployment();
  const bridgeAddress = await bridge.getAddress();

  const wrapped_ae = tokens.filter((val) => val.symbol === 'WAE')[0];
  const eth = tokens.filter((val) => val.symbol === 'ETH')[0];
  
  console.log("Setting WAE and ETH placeholder ...");
  await bridge.set_wrapped_ae(wrapped_ae.contract);
  await bridge.set_native_eth_placeholder(eth.contract);

  const token = await (await ethers.getContractFactory("WrappedAeternity")).attach(wrapped_ae.contract);
  console.log(`Transfer ownership of ${wrapped_ae.contract} to ${bridgeAddress}`);
  const tx = await token.transferOwnership(bridgeAddress);
  await tx.wait();

  // Set processors
  const processors = JSON.parse(fs.readFileSync(`${__dirname}/processors.json`, { encoding: "utf-8" }));
  for (let processor of processors.ethereum) {
      await bridge.add_processor(processor);
  }

  const assets = await aeternity.deployAeternityAssets(aeSdk, tokens);
  // Snapshot assets
  fs.writeFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_assets.json`, JSON.stringify(assets, null, 4), { encoding: "utf-8" });

  const aeBridgeAddress = await aeternity.deployAeternityBridge(aeSdk, assets);

  const bridgeInfo = {
    ethereum: await bridge.getAddress(),
    aeternity: aeBridgeAddress
  };

  fs.writeFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, JSON.stringify(bridgeInfo, null, 4), { encoding: "utf8" });

  console.log("Ethereum bridge: ", bridgeInfo.ethereum);
  console.log("Aeternity bridge: ", bridgeInfo.aeternity);

  // UPDATE ABI
  fs.writeFileSync(`${__dirname}/../__SNAPSHOT__/bridge.abi`, bridge.interface.formatJson(), { encoding: "utf-8" });
}

async function mainnetDeployment() {
  const aeSdk = aeternity.getAeSdk(aeternity.AE_MAINNET_RPC)

  const tokens = JSON.parse(fs.readFileSync(`${__dirname}/tokens.json`, { encoding: "utf-8" }));
  const tokenAddresses = tokens.map(({ contract }: any) => contract);

  console.log("Deploying bridge...");
  const BridgeV1 = await ethers.getContractFactory("BridgeV1");
  const bridge = await upgrades.deployProxy(BridgeV1);

  await bridge.waitForDeployment();

  let bridgeInfo = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, { encoding: "utf-8" }));

  bridgeInfo.ethereum = await bridge.getAddress();

  fs.writeFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, JSON.stringify(bridgeInfo, null, 4), { encoding: "utf8" });

  // // Set processors
  // const processors = JSON.parse(fs.readFileSync(`${__dirname}/processors.json`, { encoding: "utf-8" }));
  // for (let processor of processors.ethereum) {
  //     await bridge.add_processor(processor);
  // }

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