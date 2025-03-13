import { ethBridgeIn } from './bridge-functions'

(async () => {
    const sender = "ak_2ALwgjYDQeEjWJ34iXdYTcNQmbC13DJHVZBt5woAf9ieaTGdne";
    const nonce = BigInt(1);
    const asset = "0x3257E6889F36eCCaA3a153D6C059FB2FcD33b116";
    const destination = "0x0D9649EF2b751D94f6dBb1370F1EE052f33107d4";
    const amount = BigInt(1000);
    const actionType = 0;
    const signatures = ["0x6f381e56c6ef24b1e67e2c6ca9d60334a3057142aea35150cbd18830cb874e5a4119809d39d258689b0651bf6d86d976cb0369bf7a2cd44d5fce992a44e02f1a1c"];
    await ethBridgeIn(sender, nonce, asset, destination, amount, actionType, signatures);
})();