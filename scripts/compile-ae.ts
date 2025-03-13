import * as aeternity from './aeternity';

(async () => {
    const aeSdk = aeternity.getAeSdk(aeternity.AE_TESTNET_RPC);
    await aeternity.compileAeternityBridge(aeSdk);
})();