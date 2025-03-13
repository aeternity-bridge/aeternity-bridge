interface Peer {
    type: "address" | "peerId";
    value: string;
}

export interface Message {
    type: "request" | "response";
    id: string;
    sender: Peer;
    protocol: string;
    bytes: string;
}

export interface SignRequest {
    originChain: Chain
    sender: string,
    nonce: number,
}

export enum Chain {
    ETH,
    AE
}

export interface SignResponse {
    originChain: Chain,
    sender: string,
    nonce: number,
    signature: string,
}

export interface OutAction {
    asset: string,
    sender: string,
    destination: string,
    amount: BigInt,
    actionType: number, 
    nonce: BigInt,
}