import { createContext } from 'react';
import type { BigNumber } from 'bignumber.js';
import { Asset } from 'src/constants';

export interface AssetInfo {
    address: string;
    balance: string;
}

export interface AeternityBridgeInfo {
    asset?: AssetInfo;
}

export interface EVMBridgeInfo {
    asset?: AssetInfo;
}

export interface FundEvent {
    funder: string;
    amount: BigNumber;
    nonce: BigNumber;
}

export interface IAppContext {
    asset: Asset;
    assets: Asset[];
    updateAsset: (symbol: Asset) => void;
    aeternity: {
        bridgeInfo?: AeternityBridgeInfo;
    };
    ethereum: {
        bridgeInfo?: EVMBridgeInfo;
    };
}

const contextStub = {
    asset: {} as any,
    assets: [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    updateAsset: () => {},
    aeternity: {},
    ethereum: {},
};

const AppContext = createContext<IAppContext>(contextStub);

export default AppContext;
