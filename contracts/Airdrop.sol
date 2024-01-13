// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ClaimBasedAirdrop {
  IERC20 public token;
  mapping(address => uint256) public airdrops;

  event AirdropSet(address indexed beneficiary, uint256 amount);
  event Claimed(address indexed claimant, uint256 amount);

  error LengthMismatch();
  error NoAirdropAmount();
  error TokenTransferFailed();
  error InsufficientBalance();
  error AmountMismatch();

  constructor(IERC20 _token) {
    token = _token;
  }

  function setAirdrops(
    address[] calldata recipients,
    uint256[] calldata amounts
  ) external {
    if (recipients.length != amounts.length) revert LengthMismatch();

    uint256 totalAmount = 0;

    for (uint256 i = 0; i < amounts.length; i++) {
      totalAmount += amounts[i];
    }

    if (token.balanceOf(msg.sender) < totalAmount) revert InsufficientBalance();
    if (token.allowance(msg.sender, address(this)) < totalAmount)
      revert AmountMismatch();

    token.transferFrom(msg.sender, address(this), totalAmount);

    for (uint256 i = 0; i < recipients.length; i++) {
      airdrops[recipients[i]] += amounts[i]; // Adjust to add to existing airdrop amounts
      emit AirdropSet(recipients[i], amounts[i]);
    }
  }

  function claim() external {
    uint256 amount = airdrops[msg.sender];
    if (amount == 0) revert NoAirdropAmount();

    airdrops[msg.sender] = 0;
    if (!token.transfer(msg.sender, amount)) revert TokenTransferFailed();

    emit Claimed(msg.sender, amount);
  }
}
