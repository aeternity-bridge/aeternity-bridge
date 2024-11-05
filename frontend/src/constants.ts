import deployment from './deployment.json';

export interface Asset {
    token_rank?: number;
    link: string;
    ethAddress: string;
    aeAddress: string;
    nameandsymbol: string;
    name: string;
    symbol: string;
    decimals: number;
    icon: string;
}

const Constants = {
    assets: deployment.assets,
    ethereum: {
        bridge_address: deployment.ethereum.bridge_address,
        bridge_abi: deployment.ethereum.bridge_abi,
        asset_abi: deployment.ethereum.asset_abi,
        wrapped_ae_abi: deployment.ethereum.wrapped_ae_abi,
        ethChainId: deployment.ethereum.chainId,
        etherscan: deployment.ethereum.explorer,
        wae: deployment.ethereum.wae,
        default_eth: deployment.ethereum.default_eth
    },
    aeternity: {
        explorer: deployment.aeternity.explorer,
        rpc: deployment.aeternity.rpc,
        bridge_address: deployment.aeternity.bridge_address as `ct_${string}`,
        bridge_aci: deployment.aeternity.bridge_aci,
        asset_aci: deployment.aeternity.asset_aci,
        aeeth: deployment.aeternity.aeeth,
        default_ae: deployment.aeternity.default_ae,
    },
};

export default Constants;
