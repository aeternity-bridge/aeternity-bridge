import React from 'react';
import Button from '@mui/material/Button';
import useWalletContext from 'src/hooks/useWalletContext';

export enum RequiredWallet {
    Ethereum,
    Aeternity,
}

const WalletConnection: React.FC<{ requiredWallet: RequiredWallet; children: React.ReactNode }> = ({
    requiredWallet,
    children,
}) => {
    const { connectAeternityWallet, connectEthereumWallet, aeternityAddress, ethereumAddress } = useWalletContext();

    if (requiredWallet == RequiredWallet.Ethereum && !ethereumAddress) {
        return (
            <Button fullWidth variant="contained" onClick={connectEthereumWallet}>
                Connect Wallet
            </Button>
        );
    }

    if (requiredWallet == RequiredWallet.Aeternity && !aeternityAddress) {
        return (
            <Button fullWidth variant="contained" onClick={connectAeternityWallet}>
                Connect Wallet
            </Button>
        );
    }

    return <>{children}</>;
};
export default WalletConnection;
