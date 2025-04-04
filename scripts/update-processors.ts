import { ethers, network } from 'hardhat';
import fs from 'fs';
import '@nomicfoundation/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades'

import * as aeternity from './aeternity';
import { AeSdk } from '@aeternity/aepp-sdk';

async function updateProcessors(aeSdk: AeSdk) {
    const bridgeAddresses: { ethereum: string, aeternity: string } = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, { encoding: "utf-8" }));
  
    const BridgeV2 = await ethers.getContractFactory("BridgeV2");
    const bridge = await BridgeV2.attach(bridgeAddresses.ethereum);

    console.log("Configure ethereum processors...");
    const processors = JSON.parse(fs.readFileSync(`${__dirname}/../configs/processors.json`, { encoding: "utf-8" }));
    for (let processor of processors.ethereum) {
        await bridge.addSigner(processor);
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