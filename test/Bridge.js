const { assert } = require('chai');
const { utils } = require('@aeternity/aeproject');
const fs = require("fs");

const ASSET_CONTRACT_SOURCE = './contracts/FungibleTokenFull.aes';
const BRIDGE_CONTRACT_SOURCE = './contracts/Bridge.aes';


async function deployAssets(aeSdk) {
  const tokens = JSON.parse(fs.readFileSync(`${__dirname}/../deploy/mocked_tokens.json`, { encoding: "utf-8" }));
  const result = {}
  for (let token of tokens) {
      const sourceCode = `// ${token.symbol}\n` + fs.readFileSync(`${__dirname}/../contracts/FungibleTokenFull.aes`, { encoding: "utf-8" });
      const contract = await aeSdk.initializeContract({ sourceCode });

      const tx = await contract.init(token.name, token.decimals, token.symbol, undefined);
      console.log(token.symbol, tx.address);
      result[token.symbol] = {
          aeternity: tx.address,
          ethereum: token.contract,
          contract,
      }
  }

  return result;
}

describe('Bridge', () => {
  let aeSdk;
  let bridge;

  let assets = {};

  before(async () => {
    aeSdk = utils.getSdk();

    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const fileSystem = utils.getFilesystem(BRIDGE_CONTRACT_SOURCE);

    // get content of contract
    const sourceCode = utils.getContractContent(BRIDGE_CONTRACT_SOURCE);

    assets = await deployAssets(aeSdk);

    const arg = Object.values(assets).reduce((s, { ethereum, aeternity }) => ({...s, [ethereum]: aeternity}), {});

    // initialize the contract instance
    bridge = await aeSdk.initializeContract({ sourceCode, fileSystem });
    const bridgeAddress = (await bridge.init(arg)).address.replace("ct_", "ak_");

    for (let asset of Object.values(assets)) {
      console.log(bridgeAddress)
      await asset.contract.change_owner(bridgeAddress);
      await asset.contract.confirm_new_owner({ callerId: bridgeAddress });
    }

    // create a snapshot of the blockchain state
    await utils.createSnapshot(aeSdk);
  });

  // after each test roll back to initial state
  afterEach(async () => {
    await utils.rollbackSnapshot(aeSdk);
  });

  it('Bridge: bridge_in', async () => {
    const { decodedResult } = await bridge.owner();
    assert.equal(decodedResult, utils.getDefaultAccounts()[0].address);

    // Add processor
    await bridge.add_processor(utils.getDefaultAccounts()[1].address);

    console.log([1, assets["USDT"].ethereum, utils.getDefaultAccounts()[1].address, 10])
    const res = await bridge.bridge_in([1, assets["USDT"].ethereum, utils.getDefaultAccounts()[1].address, 10], { onAccount: utils.getDefaultAccounts()[1] });
  });
});
