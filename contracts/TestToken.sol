// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20("SnapIt", "SNPT") {
  constructor() {
    _mint(msg.sender, 1_000_000_000);
  }
}
