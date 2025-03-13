import { ethers, network } from 'hardhat';
import fs from 'fs';
import '@nomicfoundation/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades'

import * as aeternity from './aeternity';

export async function ethBridgeOut(asset: string, destination: string, amount: BigInt, actionType: number) {
    const bridgeAddresses: { ethereum: string, aeternity: string } = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, { encoding: "utf-8" }));
    const BridgeV2 = await ethers.getContractFactory("BridgeV2");
    const bridge = await BridgeV2.attach(bridgeAddresses.ethereum);
    await bridge.bridgeOut(asset, destination, amount, actionType);
}

export async function ethBridgeIn(sender: string, nonce: BigInt, asset: string, destination: string, amount: BigInt, actionType: number, signatures: string[]) {
    const bridgeAddresses: { ethereum: string, aeternity: string } = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, { encoding: "utf-8" }));
    const BridgeV2 = await ethers.getContractFactory("BridgeV2");
    const bridge = await BridgeV2.attach(bridgeAddresses.ethereum);
    await bridge.bridgeIn(sender, nonce, asset, destination, amount, actionType, signatures);
}

export async function ethApprove(asset: string, amount: BigInt) {
    const bridgeAddresses: { ethereum: string, aeternity: string } = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, { encoding: "utf-8" }));
    const mockErc20 = await ethers.getContractFactory("MockedERC20");
    const erc20 = await mockErc20.attach(asset);
    await erc20.approve(bridgeAddresses.ethereum, amount);
}

export async function aeBridgeOut(asset: string, destination: string, amount: BigInt, actionType: number) {
    const bridgeAddresses: { ethereum: string, aeternity: string } = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, { encoding: "utf-8" }));
    let sdk = aeternity.getAeSdk(aeternity.AE_TESTNET_RPC);
    const sourceCode = `// nonce: ${Date.now()} \n` + fs.readFileSync(`${__dirname}/../contracts/BridgeV2.aes`, { encoding: "utf-8" });
    const bridge = await sdk.initializeContract({ sourceCode, address: bridgeAddresses.aeternity as any });
    await bridge.bridge_out(asset, destination, amount, actionType, { omitUnknown: true });
}

export async function aeBridgeIn(sender: string, nonce: BigInt, asset: string, destination: string, amount: BigInt, actionType: number, signatures: string[]) {
    const bridgeAddresses: { ethereum: string, aeternity: string } = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, { encoding: "utf-8" }));
    let sdk = aeternity.getAeSdk(aeternity.AE_TESTNET_RPC);
    const sourceCode = `// nonce: ${Date.now()} \n` + fs.readFileSync(`${__dirname}/../contracts/BridgeV2.aes`, { encoding: "utf-8" });
    const bridge = await sdk.initializeContract({ sourceCode, address: bridgeAddresses.aeternity as any });
    await bridge.bridge_in(sender, nonce, asset, destination, amount, actionType, signatures, { omitUnknown: true });
}

export async function aeInActionStatus(sender: string, nonce: BigInt) {
    const bridgeAddresses: { ethereum: string, aeternity: string } = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, { encoding: "utf-8" }));
    let sdk = aeternity.getAeSdk(aeternity.AE_TESTNET_RPC);
    const sourceCode = `// nonce: ${Date.now()} \n` + fs.readFileSync(`${__dirname}/../contracts/BridgeV2.aes`, { encoding: "utf-8" });
    const bridge = await sdk.initializeContract({ sourceCode, address: bridgeAddresses.aeternity as any });
    const result = await bridge.in_action_status(sender, nonce);
    console.log(`IN ACTION STATUS: ${JSON.stringify(result.decodedResult)}`)
}

BigInt.prototype.toJSON = function() {
    return this.toString();
}

export async function aeOutAction(sender: string, nonce: BigInt) {
    const bridgeAddresses: { ethereum: string, aeternity: string } = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, { encoding: "utf-8" }));
    let sdk = aeternity.getAeSdk(aeternity.AE_TESTNET_RPC);
    const sourceCode = `// nonce: ${Date.now()} \n` + fs.readFileSync(`${__dirname}/../contracts/BridgeV2.aes`, { encoding: "utf-8" });
    const bridge = await sdk.initializeContract({ sourceCode, address: bridgeAddresses.aeternity as any });
    const result = await bridge.out_action(sender, nonce);
    console.log(`OUT ACTION: ${JSON.stringify(result.decodedResult)}`)
}

export async function aeCreateAllowance(asset: string, amount: BigInt) {
    const bridgeAddresses: { ethereum: string, aeternity: string } = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, { encoding: "utf-8" }));
    let sdk = aeternity.getAeSdk(aeternity.AE_TESTNET_RPC);
    const sourceCode = `// nonce: ${Date.now()} \n` + fs.readFileSync(`${__dirname}/../contracts/FungibleTokenFull.aes`, { encoding: "utf-8" });
    const token = await sdk.initializeContract({ sourceCode, address: asset as any });
    await token.create_allowance(bridgeAddresses.aeternity.replace('ct_', 'ak_'), amount);
}

export async function aeChangeAllowance(asset: string, amount: BigInt) {
    const bridgeAddresses: { ethereum: string, aeternity: string } = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, { encoding: "utf-8" }));
    let sdk = aeternity.getAeSdk(aeternity.AE_TESTNET_RPC);
    const sourceCode = `// nonce: ${Date.now()} \n` + fs.readFileSync(`${__dirname}/../contracts/FungibleTokenFull.aes`, { encoding: "utf-8" });
    const token = await sdk.initializeContract({ sourceCode, address: asset as any });
    await token.change_allowance(bridgeAddresses.aeternity.replace('ct_', 'ak_'), amount);
}

export async function aeResetAllowance(asset: string) {
    const bridgeAddresses: { ethereum: string, aeternity: string } = JSON.parse(fs.readFileSync(`${__dirname}/../__SNAPSHOT__/${network.name }_bridge.json`, { encoding: "utf-8" }));
    let sdk = aeternity.getAeSdk(aeternity.AE_TESTNET_RPC);
    const sourceCode = `// nonce: ${Date.now()} \n` + fs.readFileSync(`${__dirname}/../contracts/FungibleTokenFull.aes`, { encoding: "utf-8" });
    const token = await sdk.initializeContract({ sourceCode, address: asset as any });
    await token.reset_allowance(bridgeAddresses.aeternity.replace('ct_', 'ak_'));
}