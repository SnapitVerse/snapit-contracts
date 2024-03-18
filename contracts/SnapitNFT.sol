// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract SnapitNFT is ERC721Royalty, Ownable {
    constructor() ERC721('SnapitNFT', 'SNPTNFT') Ownable(msg.sender) {}

    function mint(address account, uint256 id) public onlyOwner {
        _safeMint(account, id, '');
    }
    function mint(
        address account,
        uint256 id,
        bytes memory data
    ) public onlyOwner {
        _safeMint(account, id, data);
    }

    function contractURI() public pure returns (string memory) {
        return 'https://test-api.snapit.world/api/token/contract-metadata.json';
    }

    function baseTokenURI() public pure virtual returns (string memory) {
        return 'https://test-api.snapit.world/api/token/';
    }

    function tokenURI(
        uint256 _tokenId
    ) public pure override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    baseTokenURI(),
                    Strings.toString(_tokenId),
                    '.json'
                )
            );
    }

    function setDefaultRoyalty(
        address receiver,
        uint96 feeNumerator
    ) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function deleteDefaultRoyalty() public onlyOwner {
        _deleteDefaultRoyalty();
    }

    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    ) public onlyOwner {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }
}
