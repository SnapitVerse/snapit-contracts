// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './ISnapitNft.sol';

import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/// @title StartonERC1155AuctionSale
/// @author Starton
/// @notice Sell ERC1155 tokens through an auction
contract SnapitAuction is Ownable, ReentrancyGuard {
    address private _feeReceiver;

    ISnapitNft public immutable token;

    struct Bid {
        address bidder;
        uint256 price;
        bool withdrawn;
    }

    struct Auction {
        uint256 currentPrice;
        uint256 minPriceDifference;
        uint256 startTime;
        uint256 endTime;
        uint256 latestBid;
        bool claimed;
        mapping(uint256 => Bid) bids;
    }

    function currentBid(uint256 tokenId) internal returns (Bid memory biddi) {
        uint256 latestBid = auctions[tokenId].latestBid;
        return auctions[tokenId].bids[latestBid];
    }

    function addBid(uint256 tokenId, address bidder, uint256 price) internal {
        auctions[tokenId].bids[auctions[tokenId].latestBid + 1].bidder = bidder;
        auctions[tokenId].bids[auctions[tokenId].latestBid + 1].price = price;
        auctions[tokenId]
            .bids[auctions[tokenId].latestBid + 1]
            .withdrawn = false;
        auctions[tokenId].latestBid = auctions[tokenId].latestBid + 1;
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
    event Bided(uint256 tokenId, address indexed bidder, uint256 price);

    constructor(address tokenAddress) Ownable(msg.sender) {
        token = ISnapitNft(tokenAddress);
    }

    /**
     * @notice Bid for the current auction
     */
    function bid(uint256 tokenId) public payable nonReentrant {
        require(
            auctions[tokenId].startTime <= block.timestamp,
            'Bidding not started'
        );
        require(
            auctions[tokenId].endTime >= block.timestamp,
            'Bidding finished'
        );
        require(
            currentBid(tokenId).price + auctions[tokenId].minPriceDifference <=
                msg.value,
            'Bid is too low'
        );

        // Store the old auction winner and price
        address oldAuctionWinner = currentBid(tokenId).bidder;
        uint256 oldPrice = currentBid(tokenId).price;

        addBid(tokenId, _msgSender(), msg.value);

        emit Bided(tokenId, _msgSender(), msg.value);

        // If there is a current winner, send back the money or add the money to claimable amount
        if (oldAuctionWinner != address(0)) {
            (bool success, ) = payable(oldAuctionWinner).call{value: oldPrice}(
                ''
            );
        }
    }

    /**
     * @notice Claim the prize of the current auction
     */
    function claim(uint256 tokenId) public {
        require(
            auctions[tokenId].endTime < block.timestamp,
            "Minting hasn't finished yet"
        );
        require(!auctions[tokenId].claimed, 'Token has already been claimed');

        auctions[tokenId].claimed = true;
        emit AuctionClaimed(
            tokenId,
            currentBid(tokenId).bidder,
            currentBid(tokenId).price
        );
        token.safeTransferFrom(
            address(this),
            currentBid(tokenId).bidder,
            tokenId,
            1,
            '0x'
        );
    }

    /**
     * @notice Start a new auction for a new NFT
     * @param tokenId starting mtrating
     * @param newStartingPrice the starting price of the new auction
     * @param newStartTime the time when the auction starts
     * @param newEndTime the time when the auction ends
     * @param newTokenAmount the amount of the token to be sold
     */
    function startNewAuction(
        uint256 tokenId,
        uint256 newStartingPrice,
        uint256 newMinPriceDifference,
        uint256 newStartTime,
        uint256 newEndTime,
        uint256 newTokenAmount
    ) public onlyOwner {
        require(
            auctions[tokenId].claimed,
            "The auction hasn't been claimed yet"
        );
        require(
            newStartTime < newEndTime,
            'Start time must be before end time'
        );

        // Reset the state variables for a new auction to begin
        auctions[tokenId].claimed = false;
        auctions[tokenId].minPriceDifference = newMinPriceDifference;
        auctions[tokenId].latestBid = 0;
        addBid(tokenId, address(0), newStartingPrice);
        auctions[tokenId].startTime = newStartTime;
        auctions[tokenId].endTime = newEndTime;

        emit AuctionStarted(tokenId, newStartTime, newEndTime);
    }

    /**
     * @notice Withdraw the olds bids amount of the sender
     */
    function withdrawOldBids(uint256 token_id) public {
        uint256 amount = 0;

        for (uint i = 1; i < auctions[token_id].latestBid; i++) {
            if (auctions[token_id].bids[i].bidder == _msgSender()) {
                if (auctions[token_id].bids[i].withdrawn == false) {
                    amount = amount + auctions[token_id].bids[i].price;
                    auctions[token_id].bids[i].withdrawn = true;
                }
            }
        }

        (bool success, ) = payable(_msgSender()).call{value: amount}('');
        require(success, 'Failed to withdraw');
    }
}
