// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';

interface ISnapitNft is IERC1155 {
    function mintUniqueToken(
        address account,
        uint256 id,
        bytes memory data
    ) external;
}
