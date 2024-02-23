// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './ISnapitNft.sol';

import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

/// @title StartonERC1155AuctionSale
/// @author Starton
/// @notice Sell ERC1155 tokens through an auction
contract SnapitAuction is ReentrancyGuard {
    address private _feeReceiver;

    ISnapitNft public immutable snapitNft;
    IERC20 public immutable snapitToken;

    struct Bid {
        address bidder;
        uint256 price;
        bool withdrawn;
    }

    struct Auction {
        address auctionOwner;
        uint256 currentPrice;
        uint256 minPriceDifference;
        uint256 startTime;
        uint256 endTime;
        uint256 latestBid;
        uint256 buyoutPrice;
        bool claimed;
        mapping(uint256 => Bid) bids;
    }

    // key is tokenId
    mapping(uint256 => Auction) public auctions;

    function currentBid(uint256 tokenId) internal view returns (Bid memory) {
        Auction storage auction = auctions[tokenId];
        uint256 latestBid = auction.latestBid;
        return auction.bids[latestBid];
    }

    function addBid(uint256 tokenId, address bidder, uint256 price) internal {
        Auction storage auction = auctions[tokenId];
        auction.bids[auction.latestBid + 1].bidder = bidder;
        auction.bids[auction.latestBid + 1].price = price;
        auction.bids[auction.latestBid + 1].withdrawn = false;
        auction.latestBid = auction.latestBid + 1;
    }

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

    constructor(address tokenAddress, address nftAddress) {
        require(
            tokenAddress != nftAddress,
            'tokenAddress and nftAddress cannot be same.'
        );
        snapitToken = IERC20(tokenAddress);
        snapitNft = ISnapitNft(nftAddress);
    }

    /**
     * @notice Bid for the current auction
     */
    function bid(uint256 tokenId, uint256 price) public nonReentrant {
        Auction storage auction = auctions[tokenId];
        require(auction.startTime <= block.timestamp, 'Bidding not started');
        require(auction.endTime >= block.timestamp, 'Bidding finished');
        require(
            currentBid(tokenId).price + auction.minPriceDifference <= price,
            'Bid is too low'
        );

        // Store the old auction winner and price
        address oldAuctionWinner = currentBid(tokenId).bidder;
        uint256 oldPrice = currentBid(tokenId).price;

        if (price >= auction.buyoutPrice) {
            addBid(tokenId, msg.sender, auction.buyoutPrice);
            snapitToken.transferFrom(
                msg.sender,
                address(this),
                auction.buyoutPrice
            );
            auction.endTime = block.timestamp;
        } else {
            addBid(tokenId, msg.sender, price);
            snapitToken.transferFrom(msg.sender, address(this), price);
        }

        emit Bided(tokenId, msg.sender, price);

        // If there is a current winner, send back the money or add the money to claimable amount
        if (oldAuctionWinner != address(0)) {
            snapitToken.transferFrom(address(this), oldAuctionWinner, oldPrice);
        }
    }

    /**
     * @notice Claim the prize of the current auction
     */
    function claim(uint256 tokenId) public {
        Auction storage auction = auctions[tokenId];
        require(
            auction.endTime < block.timestamp,
            "Auction hasn't finished yet"
        );
        require(!auction.claimed, 'Token has already been claimed');

        auction.claimed = true;
        emit AuctionClaimed(
            tokenId,
            currentBid(tokenId).bidder,
            currentBid(tokenId).price
        );
        snapitToken.transferFrom(
            address(this),
            auction.auctionOwner,
            currentBid(tokenId).price
        );
        snapitNft.safeTransferFrom(
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
        if (auction.auctionOwner != address(0)) {
            require(auction.claimed, "The auction hasn't been claimed yet");
        }
        require(
            newStartTime < newEndTime,
            'Start time must be before end time'
        );
        require(
            snapitNft.balanceOf(msg.sender, tokenId) == 1,
            'Sender must own the token'
        );
        require(
            newBuyoutPrice == 0 || newStartingPrice < newBuyoutPrice,
            'Starting price cannot be more than buyout price'
        );

        // Reset the state variables for a new auction to begin
        auction.auctionOwner = msg.sender;
        auction.claimed = false;
        auction.minPriceDifference = newMinPriceDifference;
        auction.latestBid = 0;
        addBid(tokenId, address(0), newStartingPrice);
        auction.buyoutPrice = newBuyoutPrice;
        auction.startTime = newStartTime;
        auction.endTime = newEndTime;

        snapitNft.safeTransferFrom(msg.sender, address(this), tokenId, 1, '0x');

        emit AuctionStarted(tokenId, newStartTime, newEndTime);
    }

    /**
     * @notice Withdraw the olds bids amount of the sender
     */
    function withdrawOldBids(uint256 token_id) public {
        uint256 amount = 0;

        for (uint i = 1; i < auctions[token_id].latestBid; i++) {
            if (auctions[token_id].bids[i].bidder == msg.sender) {
                if (auctions[token_id].bids[i].withdrawn == false) {
                    amount = amount + auctions[token_id].bids[i].price;
                    auctions[token_id].bids[i].withdrawn = true;
                }
            }
        }

        (bool success, ) = payable(msg.sender).call{value: amount}('');
        require(success, 'Failed to withdraw');
    }
}
