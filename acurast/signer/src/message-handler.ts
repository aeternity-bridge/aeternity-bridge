import { AeSdk, Contract, decode, Node, hash } from "@aeternity/aepp-sdk";
import { ContractByteArrayEncoder,  TypeResolver} from "@aeternity/aepp-calldata";
import { AETERNITY, ETH, PROTOCOL_MESSAGE_PING, PROTOCOL_MESSAGE_SIGN } from "./constants";
import { Message, SignRequest, Chain, OutAction, SignResponse } from "./types";
import { ec as EC } from 'elliptic';
import { JsonRpcProvider, Contract as EthContract, AbiCoder, keccak256, } from 'ethers';

declare let _STD_: any;

const SECP256K1 = new EC('secp256k1');

export async function onRequest(request: Message) {
    switch (request.protocol) {
        case PROTOCOL_MESSAGE_PING:
            _STD_.p2p.respond(request, '0x01', () => { console.log('success') }, () => { console.log('error') });
            break;
        case PROTOCOL_MESSAGE_SIGN:
            const jsonString = Buffer.from(request.bytes, "hex").toString('utf8');
            let signRequest: SignRequest = JSON.parse(jsonString);
            let response = await handleSignRequest(signRequest);
            _STD_.p2p.respond(request, response);
            break;
        default:
            console.log("Unknown protocol:", request.protocol);
    }
}

async function handleSignRequest(request: SignRequest): Promise<string> {
    switch (request.originChain) {
        case Chain.ETH:
            return handleEthSignRequest(request);
        case Chain.AE:
            return handleAeSignRequest(request);
    }
}

async function handleEthSignRequest(request: SignRequest): Promise<string> {
    const provider = new JsonRpcProvider(ETH.RPC);
    const contract = new EthContract(ETH.BRIDGE_ADDRESS, ETH.ABI, provider);
    const outAction: OutAction = await contract.outAction(request.sender, request.nonce);
    
    const typeResolver = new TypeResolver();
    const encoder = new ContractByteArrayEncoder();
    const encoded = decode(encoder.encodeWithType([outAction.sender, outAction.nonce, outAction.asset, outAction.destination, outAction.amount, outAction.actionType], typeResolver.resolveType({tuple: ['bytes', 'int', 'bytes', 'address', 'int', 'int']})));
    const hashed = hash(encoded);
    return sign(request, hashed);
}

async function handleAeSignRequest(request: SignRequest): Promise<string> {
    const aeSdk = new AeSdk({ nodes: [{ name: 'bridge', instance: new Node(AETERNITY.RPC) }] });
    const contract = await Contract.initialize({ ...aeSdk.getContext(), aci: AETERNITY.ACI, address: AETERNITY.BRIDGE_ADDRESS });
    const outAction = (await contract.out_action(request.sender, BigInt(request.nonce))).decodedResult;
    const abi = new AbiCoder();
    const encoded: string = abi.encode(['string', 'uint256', 'address', 'address', 'uint256', 'uint8'], [outAction.sender, outAction.nonce, Buffer.from(outAction.asset).toString('hex'), Buffer.from(outAction.destination).toString('hex'), outAction.amount, outAction.action_type]);
    const hashed = s2b(keccak256(encoded));
    return sign(request, hashed);
}

function sign(request: SignRequest, hash: Buffer): string {
    const signature = s2b(_STD_.signers.secp256k1.sign(hash.toString('hex')));
    const pubKey = _STD_.job.getPublicKeys()['secp256k1'];
    const recoveryId = findRecoveryId(hash, signature, pubKey) + 27;
    const recoverableSignature = request.originChain === Chain.ETH ? Buffer.concat([new Uint8Array([recoveryId]), signature]).toString('hex') : Buffer.concat([signature, new Uint8Array([recoveryId])]).toString('hex');
    const reponse: SignResponse = {
        originChain: request.originChain,
        sender: request.sender,
        nonce: request.nonce,
        signature: recoverableSignature,
    };
    const bytes = new TextEncoder().encode(JSON.stringify(reponse));
    return Buffer.from(bytes).toString('hex');
}

function findRecoveryId(hash: Uint8Array, signature: Uint8Array, originalPublicKey: string): number {
    const r = signature.subarray(0, 32);
    const s = signature.subarray(32);
    for (let recoveryId = 0; recoveryId < 4; recoveryId++) {
        try {
            const recoveredKey = SECP256K1.recoverPubKey(hash, { r, s }, recoveryId);
            const compressedKey = SECP256K1.keyFromPublic(recoveredKey).getPublic().encodeCompressed('hex');
            if (compressedKey === originalPublicKey) {
                return recoveryId; // Correct recoveryId found
            }
        } catch (error) {
            throw Error('Cannot find recovery ID');
        }
    }
    throw Error('Cannot find recovery ID');
}

function s2b(value: string): Buffer {
    let hexString = value;
    if (hexString.startsWith('0x')) {
        hexString = hexString.slice(2);
    }
    return Buffer.from(hexString, 'hex');
}