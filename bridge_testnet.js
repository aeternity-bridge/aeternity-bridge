const MAX_ATTEMPTS = 3;

const EVM = {
    RPC: "https://ethereum-sepolia-rpc.publicnode.com",
    BRIDGE_ADDRESS: "0xa2E1f5E1f2721Ae935ac7b0799BC108963276dBA",
}

const AETERNITY = {
    RPC: "https://testnet.aeternity.io",
    BRIDGE_ADDRESS: "ct_2C5nHYyzUMiqU9HE32XNLN47pFEDL2bNpVTAsG5XmZNigvM4Fv",
}

const aeternity = {
    isInActionProcessed: async (id) => {
        const processed = await aeternity.isInActionSubmitted(id);
        return new Promise((resolve, rejecpayload_amount) => {
            _STD_.chains.aeternity.staticCall(
                AETERNITY.RPC,
                AETERNITY.BRIDGE_ADDRESS,
                [_STD_.chains.aeternity.data.int(id)],
                {
                    functionName: "in_action_status",
                },
                (response, _certificate) => {
                    console.log(JSON.stringify(response))
                    resolve(response.tag == "1" || processed)
                },
                (errorMessage) => {
                    console.log(JSON.stringify(errorMessage))
                    resolve(false);
                }
            )
        })
    },
    isInActionSubmitted: async (id) => {
        return new Promise((resolve, reject) => {
            _STD_.chains.aeternity.staticCall(
                AETERNITY.RPC,
                AETERNITY.BRIDGE_ADDRESS,
                [_STD_.chains.aeternity.data.int(id)],
                {
                    functionName: "in_action_submitted",
                },
                (response, _certificate) => {
                    console.log(JSON.stringify(response))
                    resolve(response.value == true)
                },
                (errorMessage) => {
                    console.log(JSON.stringify(errorMessage))
                    resolve(false);
                }
            )
        })
    },
    getOutActionAsset: async (id) => {
        return new Promise((resolve, reject) => {
            _STD_.chains.aeternity.staticCall(
                AETERNITY.RPC,
                AETERNITY.BRIDGE_ADDRESS,
                [_STD_.chains.aeternity.data.int(id)],
                {
                    functionName: "movement_asset",
                },
                (response, _certificate) => {
                    console.log(JSON.stringify(response))
                    resolve(response.value)
                },
                (errorMessage) => {
                    reject(errorMessage);
                }
            )
        })
    },
    getOutActionDestination: async (id) => {
        return new Promise((resolve, reject) => {
            _STD_.chains.aeternity.staticCall(
                AETERNITY.RPC,
                AETERNITY.BRIDGE_ADDRESS,
                [_STD_.chains.aeternity.data.int(id)],
                {
                    functionName: "movement_destination",
                },
                (response, _certificate) => {
                    console.log(JSON.stringify(response))
                    resolve(response.value)
                },
                (errorMessage) => {
                    reject(errorMessage);
                }
            )
        })
    },
    getOutActionAmount: async (id) => {
        return new Promise((resolve, reject) => {
            _STD_.chains.aeternity.staticCall(
                AETERNITY.RPC,
                AETERNITY.BRIDGE_ADDRESS,
                [_STD_.chains.aeternity.data.int(id)],
                {
                    functionName: "movement_amount",
                },
                (response, _certificate) => {
                    console.log(JSON.stringify(response))
                    resolve(Number(response.value))
                },
                (errorMessage) => {
                    reject(errorMessage);
                }
            )
        })
    },
    getOutActionType: async (id) => {
        return new Promise((resolve, reject) => {
            _STD_.chains.aeternity.staticCall(
                AETERNITY.RPC,
                AETERNITY.BRIDGE_ADDRESS,
                [_STD_.chains.aeternity.data.int(id)],
                {
                    functionName: "movement_action_type",
                },
                (response, _certificate) => {
                    console.log(JSON.stringify(response))
                    resolve(Number(response.value))
                },
                (errorMessage) => {
                    reject(errorMessage);
                }
            )
        })
    },
    getOutActionStatus: async (id) => {
        return new Promise((resolve, reject) => {
            _STD_.chains.aeternity.staticCall(
                AETERNITY.RPC,
                AETERNITY.BRIDGE_ADDRESS,
                [_STD_.chains.aeternity.data.int(id)],
                {
                    functionName: "movement_status",
                },
                (response, _certificate) => {
                    console.log(JSON.stringify(response))
                    resolve(Number(response.value))
                },
                (errorMessage) => {
                    reject(errorMessage);
                }
            )
        })
    }
}

const ethereum = {
    isInActionProcessed: async (id) => {
        const processed = await ethereum.isInActionSubmitted(id);
        const query = {
            "id":1,
            "jsonrpc":"2.0",
            "method": "eth_call",
            "params":[
                {
                    "to": EVM.BRIDGE_ADDRESS,
                    "data": "0x804ad6ce" + _STD_.chains.ethereum.abi.encodeNumeric(id, 256, true), // method hash "in_action_status(uint256)" + id
                },
                "latest"
            ]
        };
        return new Promise((resolve, reject) => {
            httpPOST(
                EVM.RPC,
                JSON.stringify(query),
                {
                    "content-type": "application/json"
                },
                (response, _certificate) => {
                    console.log("isInActionProcessed", response);
                    const { result } = JSON.parse(response);
                    resolve(result == "0x0000000000000000000000000000000000000000000000000000000000000001" || processed);
                },
                (errorMessage) => {
                    console.log(JSON.stringify(errorMessage))
                    resolve(false);
                }
            );
        });
    },
    isInActionSubmitted: async (id) => {
        const query = {
            "id":1,
            "jsonrpc":"2.0",
            "method": "eth_call",
            "params":[
                {
                    "from": "0x" + _STD_.chains.ethereum.getAddress(),
                    "to": EVM.BRIDGE_ADDRESS,
                    "data": "0x6bf107e2" + _STD_.chains.ethereum.abi.encodeNumeric(id, 256, true), // method hash "in_action_submitted(uint256)" + id
                },
                "latest"
            ]
        };
        return new Promise((resolve, reject) => {
            httpPOST(
                EVM.RPC,
                JSON.stringify(query),
                {
                    "content-type": "application/json"
                },
                (response, _certificate) => {
                    console.log(response);
                    const { result } = JSON.parse(response);
                    resolve(result == "0x0000000000000000000000000000000000000000000000000000000000000001");
                },
                (errorMessage) => {
                    console.log(JSON.stringify(errorMessage))
                    resolve(false);
                }
            );
        });
    },
    getOutActionAsset: async (movement_id) => {
        const query = {
            "id":1,
            "jsonrpc":"2.0",
            "method": "eth_call",
            "params":[
                {
                    "to": EVM.BRIDGE_ADDRESS,
                    "data": "0x6e9e6da8" + _STD_.chains.ethereum.abi.encodeNumeric(movement_id, 256, true), // method hash "movement_asset(uint256)" + encoded_movement_id
                },
                "latest"
            ]
        };
        return new Promise((resolve, reject) => {
            httpPOST(
                EVM.RPC,
                JSON.stringify(query),
                {
                    "content-type": "application/json"
                },
                (response, _certificate) => {
                    print(response);
                    const { result } = JSON.parse(response);
                    resolve("0x" + result.slice(26));
                },
                (errorMessage) => {
                    reject(errorMessage);
                }
            );
        });
    },
    getOutActionDestination: async (movement_id) => {
        const query = {
            "id":1,
            "jsonrpc":"2.0",
            "method": "eth_call",
            "params":[
                {
                    "to": EVM.BRIDGE_ADDRESS,
                    "data": "0x22ce7f96" + _STD_.chains.ethereum.abi.encodeNumeric(movement_id, 256, true), // method hash "movement_destination(uint256)" + encoded_movement_id
                },
                "latest"
            ]
        };
        return new Promise((resolve, reject) => {
            httpPOST(
                EVM.RPC,
                JSON.stringify(query),
                {
                    "content-type": "application/json"
                },
                (response, _certificate) => {
                    print("getOutActionDestination", response);
                    const { result } = JSON.parse(response);
                    const addressSize = Number("0x" + result.slice(128, 130));
                    resolve(hexToUtf8(result.slice(130, 130+(addressSize*2))));
                },
                (errorMessage) => {
                    reject(errorMessage);
                }
            );
        });
    },
    getOutActionAmount: async (movement_id) => {
        const query = {
            "id":1,
            "jsonrpc":"2.0",
            "method": "eth_call",
            "params":[
                {
                    "to": EVM.BRIDGE_ADDRESS,
                    "data": "0x51edd4b4" + _STD_.chains.ethereum.abi.encodeNumeric(movement_id, 256, true), // method hash "movement_amount(uint256)" + encoded_movement_id
                },
                "latest"
            ]
        };
        return new Promise((resolve, reject) => {
            httpPOST(
                EVM.RPC,
                JSON.stringify(query),
                {
                    "content-type": "application/json"
                },
                (response, _certificate) => {
                    print(response);
                    const { result } = JSON.parse(response);
                    resolve(Number(result));
                },
                (errorMessage) => {
                    reject(errorMessage);
                }
            );
        });
    },
    getOutActionType: async (movement_id) => {
        const query = {
            "id":1,
            "jsonrpc":"2.0",
            "method": "eth_call",
            "params":[
                {
                    "to": EVM.BRIDGE_ADDRESS,
                    "data": "0x4dcd20a9" + _STD_.chains.ethereum.abi.encodeNumeric(movement_id, 256, true), // method hash "movement_action_type(uint256)" + encoded_movement_id
                },
                "latest"
            ]
        };
        return new Promise((resolve, reject) => {
            httpPOST(
                EVM.RPC,
                JSON.stringify(query),
                {
                    "content-type": "application/json"
                },
                (response, _certificate) => {
                    print(response);
                    const { result } = JSON.parse(response);
                    resolve(Number(result));
                },
                (errorMessage) => {
                    reject(errorMessage);
                }
            );
        });
    },
}

function hexToUtf8(s) {
  return decodeURIComponent(
     s.replace(/\s+/g, '') // remove spaces
      .replace(/[0-9a-f]{2}/g, '%$&') // add '%' before each 2 characters
  );
}

const storage = {
    number: {
        get: (key) => {
            const v = _STD_.preferences.getSync(key);
            return !v ? null : Number("0x"+v);
        },
        set: (key, value) => {
            const v = value.toString(16);
            _STD_.preferences.setSync(key, v.padStart(v.length + (v.length%2), "0"))
        }
    },
    ethereum_bridge_out_counter: {
        key: "ethereum_bridge_out_counter" + EVM.BRIDGE_ADDRESS,
        get: () => storage.number.get(storage.ethereum_bridge_out_counter.key) || 1,
        set: (counter) => storage.number.set(storage.ethereum_bridge_out_counter.key, counter),
    },
    ethereum_to_aeternity_try_counter: {
        key: "ethereum_to_aeternity_try_counter" + EVM.BRIDGE_ADDRESS,
        get: () => storage.number.get(storage.ethereum_to_aeternity_try_counter.key) || 0,
        set: (counter) => storage.number.set(storage.ethereum_to_aeternity_try_counter.key, counter),
    },
    aeternity_bridge_out_counter: {
        key: "aeternity_bridge_out_counter" + AETERNITY.BRIDGE_ADDRESS,
        get: () => storage.number.get(storage.aeternity_bridge_out_counter.key) || 1,
        set: (counter) => storage.number.set(storage.aeternity_bridge_out_counter.key, counter),
    },
    aeternity_to_ethereum_try_counter: {
        key: "aeternity_to_ethereum_try_counter" + AETERNITY.BRIDGE_ADDRESS,
        get: () => storage.number.get(storage.aeternity_to_ethereum_try_counter.key) || 0,
        set: (counter) => storage.number.set(storage.aeternity_to_ethereum_try_counter.key, counter),
    },
}


async function run_ethereum_to_aeternity() {
    const ethereumBridgeOut = storage.ethereum_bridge_out_counter.get();
    const isAeternityActionProcessed = await aeternity.isInActionProcessed(ethereumBridgeOut);

    const ethOutActionAsset = await ethereum.getOutActionAsset(ethereumBridgeOut);

    console.log(ethereumBridgeOut, isAeternityActionProcessed, ethOutActionAsset);

    if ("0x0000000000000000000000000000000000000000" != ethOutActionAsset) {
        const ethOutActionDestination = await ethereum.getOutActionDestination(ethereumBridgeOut);
        const ethOutActionAmount = await ethereum.getOutActionAmount(ethereumBridgeOut);
        const ethOutActionType = await ethereum.getOutActionType(ethereumBridgeOut);
        const ethereumBridgeOutTryCounter = storage.ethereum_to_aeternity_try_counter.get();

        console.log(ethereumBridgeOutTryCounter, ethOutActionAmount, ethOutActionDestination, ethOutActionType);

        if (isAeternityActionProcessed || ethereumBridgeOutTryCounter > MAX_ATTEMPTS) {
            // Action already processed or reached the maximum number of attempts
            storage.ethereum_bridge_out_counter.set(ethereumBridgeOut + 1);
            storage.ethereum_to_aeternity_try_counter.set(0);
            return run_ethereum_to_aeternity();
        }
        storage.ethereum_to_aeternity_try_counter.set(ethereumBridgeOutTryCounter + 1);
        _STD_.chains.aeternity.fulfill(
            AETERNITY.RPC,
            AETERNITY.BRIDGE_ADDRESS,
            [
                _STD_.chains.aeternity.data.tuple(
                    _STD_.chains.aeternity.data.int(ethereumBridgeOut),
                    _STD_.chains.aeternity.data.string(ethOutActionAsset),
                    _STD_.chains.aeternity.data.account_pubkey(ethOutActionDestination),
                    _STD_.chains.aeternity.data.int(ethOutActionAmount.toString()),
                    _STD_.chains.aeternity.data.int(ethOutActionType),
                )
            ],
            {
                functionName: "bridge_in",
                gasLimit: "50000"
            },
            (opHash) => {
                console.log("Succeeded: " + opHash)
            },
            (err) => {
                console.log("Failed: " + err)
            },
        )
    }
}

async function run_aeternity_to_ethereum() {
    const aeternityBridgeOut = storage.aeternity_bridge_out_counter.get();
    const isEthereumActionProcessed = await ethereum.isInActionProcessed(aeternityBridgeOut);

    console.log("aeternityBridgeOut ", aeternityBridgeOut)
    console.log("isEthereumActionProcessed", isEthereumActionProcessed)

    const aeternityBridgeOutTryCounter = storage.aeternity_to_ethereum_try_counter.get();
    console.log("aeternityBridgeOutTryCounter", aeternityBridgeOutTryCounter)
    if (isEthereumActionProcessed || aeternityBridgeOutTryCounter > MAX_ATTEMPTS) {
        // Action already processed or reached the maximum number of attempts
        storage.aeternity_bridge_out_counter.set(aeternityBridgeOut + 1);
        storage.aeternity_to_ethereum_try_counter.set(0);
        return run_aeternity_to_ethereum();
    }

    const aeOutActionAsset = await aeternity.getOutActionAsset(aeternityBridgeOut);
    if (aeOutActionAsset.startsWith("0x")) {
        storage.aeternity_to_ethereum_try_counter.set(aeternityBridgeOutTryCounter + 1);

        const aeOutActionDestination = await aeternity.getOutActionDestination(aeternityBridgeOut);
        const aeOutActionAmount = await aeternity.getOutActionAmount(aeternityBridgeOut);
        const aeOutActionType = await aeternity.getOutActionType(aeternityBridgeOut);

        console.log("aeOutActionAsset", aeOutActionAsset);
        console.log("aeOutActionDestination",aeOutActionDestination);
        console.log("aeOutActionAmount",aeOutActionAmount);
        console.log("aeOutActionType",aeOutActionType);
        
        const payload_nonce = _STD_.chains.ethereum.abi.encodeNumeric(aeternityBridgeOut + "", 256, true);
        const payload_asset = _STD_.chains.ethereum.abi.encode(aeOutActionAsset);
        const payload_destination = _STD_.chains.ethereum.abi.encode(aeOutActionDestination);
        const payload_amount = _STD_.chains.ethereum.abi.encodeNumeric(aeOutActionAmount + "", 256, true);
        const payload_action_type = _STD_.chains.ethereum.abi.encodeNumeric(aeOutActionType + "", 8, true);

      	const payload = "0x" + payload_nonce + payload_asset + payload_destination + payload_amount + payload_action_type;
        //const payload = "0x" + _STD_.chains.ethereum.abi.encodeStruct(
        //    {
        //        nonce: aeternityBridgeOut,
        //        asset: aeOutActionAsset,
        //        destination: aeOutActionDestination,
        //        amount: payload_amount,
        //        action_type: aeOutActionType,
        //    }
        //);
        console.log("payload", payload);
        console.log("EVM.RPC", EVM.RPC);
        console.log("EVM.BRIDGE_ADDRESS", EVM.BRIDGE_ADDRESS);
        _STD_.chains.ethereum.fulfill(
            EVM.RPC,
            EVM.BRIDGE_ADDRESS,
            payload,
            {
                methodSignature: "bridge_in(uint256,address,address,uint256,uint8)",
                gasLimit: "500000",
                maxFeePerGas: "190000000000",
                maxPriorityFeePerGas: "188500000000",
            },
            (opHash) => {
                console.log("Succeeded: " + opHash)
            },
            (err) => {
                console.log("Failed: " + err)
            },
        )
    }
}


run_ethereum_to_aeternity();
run_aeternity_to_ethereum();