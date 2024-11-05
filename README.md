Bridge between Aeternity and EVM chains

Hyperdrive script: [bridge.js](bridge.js)

## Setup environment

Create a file named `.env` in the root of the project and add the following variables:

```sh
AE_SECRET_KEY="<64 bytes secret key>" # https://docs.aeternity.com/aepp-sdk-js/v13.2.2/api/functions/generateKeyPair.html
ETH_SECRET_KEY="<32 bytes secret key>"
```

When deploying the contracts, the addresses will be stored at [__SNAPSHOT__](./__SNAPSHOT__) folder, prefixed with the network type.

### Deploy to production
```
yarn deploy:prod
```

### Deploy to testnet
```
yarn deploy:dev
```

## Update bridge script for Acurast

Update the `RPC` and `BRIDGE_ADDRESS` variables accordingly to the respective deployment in file [bridge.js](./bridge.js).

When registering the job ob Acurast, you are required to specify `1000` in the storage limit.

## Update processors used in the deployment

Modify file [deploy/processors.json](./deploy/processors.json) to add new processors.

## Start frontend

```
cd frontend
yarn
yarn prepare-deployment <sepolia|mainnet>
yarn start
```

## Aeternity

Mintable fungible token ([standard](https://github.com/aeternity/AEXs/blob/master/AEXS/aex-9.md)): [FungibleTokenFull.aes](FungibleTokenFull.aes)

Simple bridge contract: [Bridge.aes](Bridge.aes)

## EVM

Mintable ERC20: [MintableERC20.sol](MintableERC20.sol)

Simple bridge contract: [Bridge.sol](Bridge.sol)
