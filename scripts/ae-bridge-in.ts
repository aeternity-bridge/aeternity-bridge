import { aeBridgeIn, aeInActionStatus } from './bridge-functions'

(async () => {
    const sender = "0x0D9649EF2b751D94f6dBb1370F1EE052f33107d4";
    const nonce = BigInt(1);
    const asset = "0x3257E6889F36eCCaA3a153D6C059FB2FcD33b116";
    const destination = "ak_2ALwgjYDQeEjWJ34iXdYTcNQmbC13DJHVZBt5woAf9ieaTGdne";
    const amount = BigInt(1000);
    const actionType = 0;
    const signatures = ["0x1ce392d4da844fef01d8f42cb7d9291d8d504a83b489d5727f4b5d80d443923f224c060c7aea44e44a2143c9cf91565b98dd03a4facea59aba05e33bc121cf4365"];
    await aeBridgeIn(sender, nonce, asset, destination, amount, actionType, signatures);
    await aeInActionStatus(sender, nonce);
})();