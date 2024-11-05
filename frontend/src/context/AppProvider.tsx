import React from 'react';
import AppContext, { AeternityBridgeInfo, EVMBridgeInfo } from './AppContext';
import * as Aeternity from 'src/services/aeternity';
import Constants, { Asset } from 'src/constants';
import Logger from 'src/services/logger';
import * as Ethereum from 'src/services/ethereum';
import useWalletContext from 'src/hooks/useWalletContext';
import BigNumber from 'bignumber.js';

async function fetchAeternityBridgeInfo(asset: Asset, aeternityAddress?: string): Promise<AeternityBridgeInfo> {
    const bridge_contract = await Aeternity.Sdk.initializeContract({
        aci: Constants.aeternity.bridge_aci,
        address: Constants.aeternity.bridge_address,
        omitUnknown: true,
    })

    let { decodedResult: asset_address } = await bridge_contract.native_ae();
    let asset_balance = BigInt(0);

    if (asset.aeAddress === Constants.aeternity.default_ae) {
        if (aeternityAddress) {
            const balance = await Aeternity.Sdk.getBalance(aeternityAddress as `ak_${string}`);
            asset_balance = BigInt(balance);
        }
    } else {
        let { decodedResult: asset_addr } = 
            asset.aeAddress === Constants.aeternity.aeeth 
            ? await bridge_contract.native_eth() 
            : await bridge_contract.asset(asset.ethAddress);

        asset_address = asset_addr;
        const asset_contract = await Aeternity.Sdk.initializeContract({
            aci: Constants.aeternity.asset_aci,
            address: asset_addr,
            omitUnknown: true,
        });
        if (aeternityAddress) {
            const { decodedResult } = await asset_contract.balance(aeternityAddress);
            asset_balance = decodedResult;
        }
    }

    return {
        asset: {
            address: asset_address,
            balance: asset_balance?.toString() || '0',
        },
    };
}

async function fetchEvmBridgeInfo(assetAddress: string, ethereumAddress?: string): Promise<EVMBridgeInfo> {

    let balance = '';
    if (assetAddress === Constants.ethereum.default_eth) {
        if (ethereumAddress) {
            balance = (await Ethereum.Provider.getBalance(ethereumAddress)).toString();
        }
    } else {
        const asset = new Ethereum.Contract(
            assetAddress,
            [
                {
                    inputs: [
                        {
                            internalType: 'address',
                            name: 'account',
                            type: 'address',
                        },
                    ],
                    name: 'balanceOf',
                    outputs: [
                        {
                            internalType: 'uint256',
                            name: '',
                            type: 'uint256',
                        },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                },
            ],
            Ethereum.Provider,
        );
        balance = (await asset.balanceOf(ethereumAddress).catch(() => 0)).toString();
    }

    return {
        asset: {
            address: assetAddress,
            balance: balance,
        },
    };
}

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isMounter = React.useRef(false);
    const { aeternityAddress, ethereumAddress } = useWalletContext();
    const [asset, updateAsset] = React.useState<Asset>(Constants.assets[0]);
    const [evmBridgeInfo, setEvmBridgeInfo] = React.useState<EVMBridgeInfo>();
    const [aeternityBridgeInfo, setAeternityBridgeInfo] = React.useState<AeternityBridgeInfo>();

    React.useEffect(() => {
        isMounter.current = true;

        const fetch = () => {
            // Ethereum
            fetchEvmBridgeInfo(asset.ethAddress, ethereumAddress)
                .then((info) => {
                    if (isMounter.current) {
                        setEvmBridgeInfo(info);
                    }
                })
                .catch(Logger.error);
            // Aeternity
            fetchAeternityBridgeInfo(asset, aeternityAddress)
                .then((info) => {
                    if (isMounter.current) {
                        setAeternityBridgeInfo(info);
                    }
                })
                .catch(Logger.error);
        };
        fetch(); // First fetch

        const cron = setInterval(fetch, 10000 /* 10 seconds */);
        return () => {
            isMounter.current = false;
            clearInterval(cron);
        };
    }, [ethereumAddress, asset, aeternityAddress]);

    return (
        <AppContext.Provider
            value={{
                asset,
                assets: Constants.assets,
                updateAsset: (asset: Asset) => {
                    updateAsset(asset);
                    setAeternityBridgeInfo({});
                    setEvmBridgeInfo({});
                },
                aeternity: {
                    bridgeInfo: aeternityBridgeInfo,
                },
                ethereum: {
                    bridgeInfo: evmBridgeInfo,
                },
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export default AppProvider;
