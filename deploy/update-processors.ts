import { ethers, network } from 'hardhat';
import fs from 'fs';
import '@nomicfoundation/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades'

import * as aeternity from './aeternity';
import { AeSdk } from '@aeternity/aepp-sdk';

async function updateProcessors(aeSdk: AeSdk) {
    const bridgeAddresses: { ethereum: string, aeternity: string } = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, { encoding: "utf-8" }));
  
    const BridgeV1 = await ethers.getContractFactory("BridgeV1");
    const bridge = await BridgeV1.attach(bridgeAddresses.ethereum);
  
    // Set processors
    console.log("Configure ethereum processors...");
    const processors = JSON.parse(fs.readFileSync(`${__dirname}/processors.json`, { encoding: "utf-8" }));
    for (let processor of processors.ethereum) {
        await bridge.add_processor(processor);
    }
  
    await aeternity.updateProcessors(aeSdk, bridgeAddresses.aeternity);
}

if (network.name == "mainnet") {
    updateProcessors(aeternity.getAeSdk(aeternity.AE_MAINNET_RPC)).catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
  } else {
    updateProcessors(aeternity.getAeSdk(aeternity.AE_TESTNET_RPC)).catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}