import {
    PROTOCOL_MESSAGE_PING,
    PROTOCOL_MESSAGE_SIGN,
    RELAYS,
} from "./constants";
import { onRequest } from "./message-handler";
import { Message } from "./types";

declare let _STD_: any;

function main() {
    _STD_.p2p.start(
        {
            messageProtocols: [PROTOCOL_MESSAGE_SIGN, PROTOCOL_MESSAGE_PING],
            streamProtocols: [],
            relays: [...RELAYS],
            idleConnectionTimeout: 300_000, // 5 min
        },
        () => {
            _STD_.p2p.onMessage((message: Message) => {
                switch (message.type) {
                    case "request":
                        onRequest(message);
                        break;
                    case "response":
                        console.log(
                            "Unexpected response:",
                            JSON.stringify(message, null, 2),
                        );
                        break;
                }
            });
        },
        (err: string) => {
            throw err;
        },
    );
}

main();