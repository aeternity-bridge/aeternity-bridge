import React from 'react';
import * as Aeternity from 'src/services/aeternity';
import * as Ethereum from 'src/services/ethereum';
import Logger from '../services/logger';
import WalletContext from './WalletContext';

const WalletProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    const [connecting, setConnecting] = React.useState(true);
    const [aeternityAddress, setAeternityAddress] = React.useState<string>();
    const [ethereumAddress, setEthereumAddress] = React.useState<string>();

    React.useEffect(() => {
        Ethereum.Provider.listAccounts().then((accounts) => {
            if (accounts.length > 0) {
                setEthereumAddress(accounts[0]);
            }
        });
    }, []);

    const connectAeternityWallet = React.useCallback(async () => {
        try {
            setConnecting(true);
            const address = await Aeternity.connect();
            setAeternityAddress(address);
        } catch (e) {
            Logger.error(e);
        } finally {
            setConnecting(false);
        }
    }, []);

    const connectEthereumWallet = React.useCallback(async () => {
        try {
            setConnecting(true);
            const address = await Ethereum.connect();
            setEthereumAddress(address);
        } catch (e) {
            Logger.error(e);
        } finally {
            setConnecting(false);
        }
    }, []);

    return (
        <WalletContext.Provider
            value={{
                connecting,
                aeternityAddress: aeternityAddress,
                ethereumAddress: ethereumAddress,
                connectAeternityWallet,
                connectEthereumWallet,
            }}
        >
            {props.children}
        </WalletContext.Provider>
    );
};

export default WalletProvider;
