import { aeChangeAllowance, aeCreateAllowance, aeResetAllowance, aeBridgeOut, aeOutAction } from './bridge-functions'

(async () => {
    const destination = "0x0D9649EF2b751D94f6dBb1370F1EE052f33107d4";
    const asset = "0x3257E6889F36eCCaA3a153D6C059FB2FcD33b116";
    const amount = BigInt(1000);
    const actionType = 0;
    // await aeResetAllowance('ct_2AbNjLGNhzq92uTUSL7MBdne6YJejbsSx2egAtERDy1wgb9Fp1');
    // await aeCreateAllowance('ct_2AbNjLGNhzq92uTUSL7MBdne6YJejbsSx2egAtERDy1wgb9Fp1', amount);
    // await aeChangeAllowance('ct_2AbNjLGNhzq92uTUSL7MBdne6YJejbsSx2egAtERDy1wgb9Fp1', amount);
    await aeBridgeOut(asset, destination, amount, actionType);
    await aeOutAction('ak_2ALwgjYDQeEjWJ34iXdYTcNQmbC13DJHVZBt5woAf9ieaTGdne', BigInt(1));
})();