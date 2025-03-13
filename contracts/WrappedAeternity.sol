// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MintableERC20 
 * @dev ERC20 minting logic
 */
contract WrappedAeternity is ERC20, AccessControl {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MANAGER_ROLE) {
        _mint(to, amount);
    }

    function burn(address to, uint256 amount) public onlyRole(MANAGER_ROLE) {
        _burn(to, amount);
    }
}
