// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract SnapitNFT1155 is ERC1155, Ownable {
    // Mapping to keep track of minted token IDs
    mapping(uint256 => bytes) public mintedTokens;

    constructor()
        ERC1155('http://localhost:3030/api/token/{id}.json')
        Ownable(msg.sender)
    {}

    function mintUniqueToken(
        address account,
        uint256 id,
        bytes memory data
    ) public onlyOwner {
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

    function uri(uint256 tokenId) public pure override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    'https://test-api.snapit.world/api/token/',
                    Strings.toString(tokenId),
                    '.json'
                )
            );
    }

    function contractURI() public pure returns (string memory) {
        return 'https://test-api.snapit.world/api/token/contract-metadata.json';
    }
}
