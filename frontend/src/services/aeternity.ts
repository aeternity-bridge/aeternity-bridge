import {
    AeSdkAepp,
    BrowserWindowMessageConnection,
    Node,
    SUBSCRIPTION_TYPES,
    walletDetector,
    isAddressValid,
} from '@aeternity/aepp-sdk';

import Constants from 'src/constants';

export const Sdk = new AeSdkAepp({
    name: 'Bridge demo',
    nodes: [{ name: 'testnet', instance: new Node(Constants.aeternity.rpc) }],
    onNetworkChange: async ({ networkId }) => {
        const [{ name }] = (await Sdk.getNodesInPool()).filter((node) => node.nodeNetworkId === networkId);
        Sdk.selectNode(name);
        console.log('setNetworkId', networkId);
    },
    onAddressChange: ({ current }) => console.log(Object.keys(current)[0]),
    onDisconnect: () => console.log('Aepp is disconnected'),
});

export const connect = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        const handleWallets = async ({ wallets, newWallet }: any) => {
            newWallet ||= Object.values(wallets)[0];
            if (newWallet) {
                const walletInfo = await Sdk.connectToWallet(newWallet.getConnection());
                const {
                    address: { current },
                } = await Sdk.subscribeAddress(SUBSCRIPTION_TYPES.subscribe, 'connected');
                const address = Object.keys(current)[0];
                console.log(walletInfo, current);
                resolve(address);
            }
            stopScan();
            reject();
        };

        const scannerConnection = new BrowserWindowMessageConnection();
        const stopScan = walletDetector(scannerConnection, handleWallets);
    });
};

export { isAddressValid };
