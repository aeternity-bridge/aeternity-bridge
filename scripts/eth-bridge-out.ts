import { ethApprove, ethBridgeOut } from './bridge-functions'

(async () => {
    const destination = 'ak_2ALwgjYDQeEjWJ34iXdYTcNQmbC13DJHVZBt5woAf9ieaTGdne';
    const asset ='0x3257E6889F36eCCaA3a153D6C059FB2FcD33b116';
    const amount = BigInt(1000);
    const actionType = 0;
    // await ethApprove(asset, amount);
    await ethBridgeOut(asset, destination, amount, actionType);
})();