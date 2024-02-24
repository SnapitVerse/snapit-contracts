// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './ISnapitNft.sol';

import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/interfaces/IERC1155Receiver.sol';
import '@openzeppelin/contracts/utils/introspection/ERC165.sol';

/// @title StartonERC1155AuctionSale
/// @author Starton
/// @notice Sell ERC1155 tokens through an auction
contract SnapitAuction is IERC1155Receiver, ERC165, ReentrancyGuard {
    address private _feeReceiver;

    ISnapitNft public immutable snapitNft;
    IERC20 public immutable snapitToken;

    error AuctionHasNotFinished();
    error TokenAlreadyClaimed();
    error AuctionHasNotBeenClaimed();
    error StartTimeMustBeBeforeEndTime();
    error SenderMustOwnNFT();
    error StartPriceMustBeLessThanBuyoutPrice();
    error TokenAndNFTAddressCanNotBeSame();
    error BiddingHasNotStarted();
    error BiddingHasFinished();
    error BidPriceTooLow();
    error StartPricePlusPriceDifferenceCanNotBeMoreThanBuyoutPrice();

    struct Auction {
        address auctionOwner;
        uint256 minPriceDifference;
        uint256 startTime;
        uint256 endTime;
        uint256 buyoutPrice;
        address bidOwner;
        uint256 bidPrice;
        bool claimed;
    }

    // key is tokenId
    mapping(uint256 => Auction) public auctions;

    /** @notice Event emitted when an auction started */
    event AuctionStarted(uint256 tokenId, uint256 startTime, uint256 endTime);

    /** @notice Event emitted when an auction winner has claimed his prize */
    event AuctionClaimed(
        uint256 tokenId,
        address indexed winner,
        uint256 price
    );

    /** @notice Event emitted when an account bided on an auction */
    event Bid(uint256 tokenId, address indexed bidder, uint256 price);

    constructor(address tokenAddress, address nftAddress) {
        if (tokenAddress == nftAddress) revert TokenAndNFTAddressCanNotBeSame();
        snapitToken = IERC20(tokenAddress);
        snapitNft = ISnapitNft(nftAddress);
    }

    /**
     * @notice Bid for the current auction
     */
    function bid(uint256 tokenId, uint256 price) public nonReentrant {
        Auction storage auction = auctions[tokenId];
        if (auction.startTime > block.timestamp) revert BiddingHasNotStarted();
        if (auction.endTime < block.timestamp) revert BiddingHasFinished();
        if (auction.bidPrice + auction.minPriceDifference > price)
            revert BidPriceTooLow();

        uint256 bidPrice = price;

        if (auction.buyoutPrice != 0 && price >= auction.buyoutPrice) {
            bidPrice = auction.buyoutPrice;
            auction.endTime = block.timestamp;
        }

        // Store the old auction winner and price
        address oldAuctionWinner = auction.bidOwner;
        uint256 oldPrice = auction.bidPrice;

        auction.bidOwner = msg.sender;
        auction.bidPrice = bidPrice;

        snapitToken.transferFrom(msg.sender, address(this), bidPrice);

        emit Bid(tokenId, msg.sender, bidPrice);

        // If there is a current winner, send back the money or add the money to claimable amount
        if (oldAuctionWinner != address(0)) {
            snapitToken.transfer(oldAuctionWinner, oldPrice);
        }
    }

    /**
     * @notice Claim the prize of the current auction
     */
    function claim(uint256 tokenId) public {
        Auction storage auction = auctions[tokenId];

        if (auction.endTime >= block.timestamp) revert AuctionHasNotFinished();
        if (auction.claimed) revert TokenAlreadyClaimed();

        auction.claimed = true;

        snapitToken.transfer(auction.auctionOwner, auction.bidPrice);
        snapitNft.safeTransferFrom(
            address(this),
            auction.bidOwner,
            tokenId,
            1,
            '0x'
        );

        emit AuctionClaimed(tokenId, auction.bidOwner, auction.bidPrice);
    }

    /**
     * @notice Start a new auction for a new NFT
     * @param tokenId starting mtrating
     * @param newStartingPrice the starting price of the new auction
     * @param newStartTime the time when the auction starts
     * @param newEndTime the time when the auction ends
     */
    function createAuction(
        uint256 tokenId,
        uint256 newStartingPrice,
        uint256 newMinPriceDifference,
        uint256 newBuyoutPrice,
        uint256 newStartTime,
        uint256 newEndTime
    ) public {
        Auction storage auction = auctions[tokenId];

        if (auction.auctionOwner != address(0) && !auction.claimed)
            revert AuctionHasNotBeenClaimed();
        if (newStartTime >= newEndTime) revert StartTimeMustBeBeforeEndTime();
        if (snapitNft.balanceOf(msg.sender, tokenId) != 1)
            revert SenderMustOwnNFT();
        if (
            newBuyoutPrice != 0 &&
            newStartingPrice + newMinPriceDifference > newBuyoutPrice
        ) revert StartPricePlusPriceDifferenceCanNotBeMoreThanBuyoutPrice();

        // Reset the state variables for a new auction to begin
        auction.auctionOwner = msg.sender;
        auction.claimed = false;
        auction.minPriceDifference = newMinPriceDifference;
        auction.buyoutPrice = newBuyoutPrice;
        auction.bidPrice = newStartingPrice;
        auction.startTime = newStartTime;
        auction.endTime = newEndTime;

        snapitNft.safeTransferFrom(msg.sender, address(this), tokenId, 1, '0x');

        emit AuctionStarted(tokenId, newStartTime, newEndTime);
    }

    /**
     * @notice Withdraw the olds bids amount of the sender
     */
    // function withdrawOldBids(uint256 token_id) public {

    // }

    function onERC1155Received(
        address /* _operator */,
        address /* _from */,
        uint256 /* _id */,
        uint256 /* _value */,
        bytes calldata /* _data */
    ) external pure override returns (bytes4) {
        // Implement your logic here, e.g., updating auction state, verifying the token, etc.

        // Return this to indicate receipt was successful
        return IERC1155Receiver.onERC1155Received.selector;
    }

    /**
     * @dev See {IERC1155Receiver-onERC1155BatchReceived}.
     * Always returns `IERC1155Receiver.onERC1155BatchReceived.selector` to accept the tokens.
     */
    function onERC1155BatchReceived(
        address /* _operator */,
        address /* _from */,
        uint256[] calldata /* _ids */,
        uint256[] calldata /* _values */,
        bytes calldata /* _data */
    ) external pure override returns (bytes4) {
        // Implement your logic for batch transfer here, if necessary

        // Return this to indicate receipt was successful
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC1155Receiver).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
