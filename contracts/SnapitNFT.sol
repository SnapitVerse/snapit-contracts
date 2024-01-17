pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';

contract SnapitNFT is ERC1155 {
    // Mapping to keep track of minted token IDs
    mapping(uint256 => bool) private _mintedTokens;

    constructor() ERC1155('https://myapi.com/api/token/{id}.json') {}

    function mintUniqueToken(
        address account,
        uint256 id,
        bytes memory data
    ) public {
        require(!_mintedTokens[id], 'Token already minted');
        _mintedTokens[id] = true;
        _mint(account, id, 1, data);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override {
        require(amount == 1, 'Can only transfer 1 token at a time');
        super.safeTransferFrom(from, to, id, amount, data);
    }
}
