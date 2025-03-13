// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./WrappedAeternity.sol";

using SafeERC20 for IERC20;

struct OutAction {
    IERC20 asset;
    address sender;
    string destination;
    uint256 amount;
    uint8 actionType; // asset, native eth, wrapped ae.
    uint256 nonce;
}

library ActionType {
    uint8 constant BridgeAsset = 0;
    uint8 constant BridgeETH = 1;
    uint8 constant BridgeWAE = 2;
}

struct InAction {
    address[] signers;
    uint8 status; // 0 - InProgress, 1 - Processed, 2 - Failed
}

library Status {
    uint8 constant InProgress = 0;
    uint8 constant Processed = 1;
    uint8 constant Failed = 2;
}

/**
* @notice Helper method for checking if a given list contains a given address.
*/
function isInList(address addr, address[] memory list) pure returns (bool) {
    for (uint i=0; i < list.length; i++) {
        if (list[i] == addr) {
            return true;
        }
    }
    return false;
}

contract BridgeV2 is Initializable {
    mapping(address => mapping(uint256 => OutAction)) public outActions;
    mapping(bytes32 => mapping(uint256 => InAction)) public inActions;
    mapping(address => uint256) public nonces;
    address public owner;
    address public pendingOwner;
    bool public enabled;
    uint16 public threshold;
    address[] public signers;

    WrappedAeternity public wae;
    IERC20 public ethPlaceholder;

    function initialize() public initializer {
        threshold = 1;
        enabled = true;
        owner = msg.sender;
    }

    event BridgeOut(IERC20 asset, address sender, string destination, uint amount, uint actionType, uint outNonce);
    event BridgeIn(IERC20 asset, address destination, uint amount, uint actionType, uint inNonce);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    function setThreshold(uint16 _threshold) public onlyOwner {
        threshold = _threshold;
    }

    function addSigner(address signer) public onlyOwner {
        require(!isInList(signer, signers), "ALREADY_A_SIGNER");
        signers.push(signer);
    }

    function removeSigner(address signer) public onlyOwner {
        address[] memory newList;
        for (uint i=0; i < signers.length; i++) {
            if (signers[i] != signer) {
                newList[newList.length] = signers[i];
            }
        }
        signers = newList;
    }

    function setWAE(WrappedAeternity _wae) public onlyOwner {
        wae = _wae;
    }
    
    function setEthPlaceholder(IERC20 placeholder) public onlyOwner {
        ethPlaceholder = placeholder;
    }

    function changeOwner(address newOwner) public onlyOwner {
        pendingOwner = newOwner;
    }

    function confirmNewOwner() public {
        require(address(0) != pendingOwner, "NULL_OWNER_NOT_ALLOWED");
        require(msg.sender == pendingOwner, "NOT_PENDING_OWNER");
        owner = pendingOwner;
        pendingOwner = address(0);
    }

    function disable() public onlyOwner() {
        enabled = false;
    }

    function enable() public onlyOwner() {
        enabled = true;
    }
    
    function bridgeOut(IERC20 asset, string memory destination, uint256 amount, uint8 actionType) public payable {
        // The amount must not be zero
        require(enabled, "BRIDGING_DISABLED");
        require(amount != 0, "ZERO_AMOUNT");
        require(actionType <= 2, "INVALID_ACTION");

        IERC20 wrappedAsset = asset;
        uint256 nonce = nonces[msg.sender];
        if (actionType == ActionType.BridgeAsset) {
            // Transfer allowance to the contract
            asset.safeTransferFrom(msg.sender, address(this), amount);
            emit BridgeOut(asset, msg.sender, destination, amount, actionType, nonce);
        } else if (actionType == ActionType.BridgeETH) {
            wrappedAsset = ethPlaceholder;
            require(msg.value == amount, "INVALID_AMOUNT");
            emit BridgeOut(ethPlaceholder, msg.sender, destination, amount, actionType, nonce);
        } else {
            wrappedAsset = wae;
            wae.burn(msg.sender, amount);
            emit BridgeOut(wae, msg.sender, destination, amount, actionType, nonce);
        }

        // Add outgoing action (Ethereum to Aeternity)
        outActions[msg.sender][nonce] = OutAction(wrappedAsset, msg.sender, destination, amount, actionType, nonce);

        // Increment nonce
        nonces[msg.sender] += 1;
    }

    function bridgeIn(string memory sender, uint256 nonce, IERC20 asset, address destination, uint256 amount, uint8 actionType, bytes[] memory signatures) public {
        require(actionType <= 2, "INVALID_ACTION");

        // Hash action data and store submission
        bytes32 actionHash = keccak256(abi.encode(sender, nonce, asset, destination, amount, actionType));
        bytes32 senderHash = keccak256(abi.encode(sender));
        // verify signatures
        for (uint256 i = 0; i < signatures.length; ++i) {
            bytes memory signature = signatures[i];
            address signer = recoverSigner(actionHash, signature);
            require(isInList(signer, signers), "NOT_A_SIGNER");
            // Each signer can only sign once
            require(!isInList(signer, inActions[senderHash][nonce].signers), "ALREADY_SIGNED");
            inActions[senderHash][nonce].signers.push(signer);
        }

        // Transfer tokens and set action as processed
        // The action must be in progress
        bool inProgress = inActions[senderHash][nonce].status == Status.InProgress;
        if (inProgress && inActions[senderHash][nonce].signers.length >= threshold) {
            IERC20 wrappedAsset = asset;
            if (actionType == ActionType.BridgeAsset) {
                asset.safeTransfer(destination, amount);
            } else if (actionType == ActionType.BridgeETH) {
                require(asset == ethPlaceholder, "INVALID_ASSET");
                wrappedAsset = ethPlaceholder;

                address payable dst = payable(destination);
                (bool sent, ) = dst.call{value: amount}("");
                require(sent, "FAILED_ETH_TRANSFER");
            } else {
                wrappedAsset = wae;
                wae.mint(destination, amount);
            }
            emit BridgeIn(wrappedAsset, destination, amount, actionType, nonce);
            inActions[senderHash][nonce].status = Status.Processed;
        }
    }

    function recoverSigner(bytes32 messageHash, bytes memory signature) private pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);

        return ecrecover(messageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) private pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "INVALID_SIGNATURE_LENGTH");

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }

    function outAction(address sender, uint256 nonce) public view returns(OutAction memory) {
        return outActions[sender][nonce];
    }

    function inActionStatus(string memory sender, uint256 nonce) public view returns(uint8) {
        bytes32 senderHash = keccak256(abi.encode(sender));
        return inActions[senderHash][nonce].status;
    }

    function getAddress() public view returns(address) {
        return address(this);
    }

    function isEnabled() public view returns(bool) {
        return enabled;
    }
}
