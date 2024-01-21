pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';

contract SnapitNFT is ERC1155 {
    // Mapping to keep track of minted token IDs
    mapping(uint256 => bytes) public mintedTokens;

    constructor() ERC1155('https://myapi.com/api/token/{id}.json') {}

    function mintUniqueToken(
        address account,
        uint256 id,
        bytes memory data
    ) public {
        require((mintedTokens[id].length == 0), 'Token already minted');
        mintedTokens[id] = data;
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

    // getTokenMetadata
}
