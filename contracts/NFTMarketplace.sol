//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarketplace is ERC721URIStorage {
    address payable owner;
    uint256 private _tokenIds;
    uint256 private _itemSold;
    uint256 listingPrice = 0.01 ether;

    constructor() ERC721("NFT Marketplace", "NFTMP") {
        owner = payable(msg.sender);
    }

    struct ListedToken {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
    }

    mapping(uint256 => ListedToken) private idToListedToken;

    // Helper Functions
    // Update the Listing price of a token
    function updateListedPrice(uint256 _listingPrice) public {
        require(msg.sender == owner, "Only owner can update the Price");
        listingPrice = _listingPrice;
    }

    // Fetch the current Listing price
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    // Fetch the latest listed token data
    function getLatestIdToListedToken()
        public
        view
        returns (ListedToken memory)
    {
        return idToListedToken[_tokenIds];
    }

    function getListedTokenById(
        uint256 tokenId
    ) public view returns (ListedToken memory) {
        return idToListedToken[tokenId];
    }

    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIds;
    }

    // Main functions

    function createToken(
        string memory tokenURI,
        uint256 price
    ) public payable returns (uint) {
        require(
            msg.value == listingPrice,
            "Not enough ether! Price for listing your token is 0.01 ETH"
        );
        require(price > 0, "Make sure the price is not negative");

        _tokenIds++;

        // Assign token ID to current user
        _safeMint(msg.sender, _tokenIds);

        // Set token URI to token ID
        _setTokenURI(_tokenIds, tokenURI);

        // Call function to create
        createListedToken(_tokenIds, price);

        return _tokenIds;
    }

    function createListedToken(uint256 tokenId, uint256 price) private {
        // Add the token info and assign it to idToListedToken
        idToListedToken[tokenId] = ListedToken(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            true
        );

        // This transfers the ownership of the token from seller(msg.sender) to this contract.
        _transfer(msg.sender, address(this), tokenId);
    }

    function getAllNFTs() public view returns (ListedToken[] memory) {
        uint256 tokenCount = _tokenIds;
        ListedToken[] memory tokens = new ListedToken[](tokenCount);

        for (uint i = 0; i < tokenCount; i++) {
            tokens[i] = idToListedToken[i + 1]; // tokenId start from 1, that's why incremented 1
        }

        return tokens;
    }

    function getMyNFTs() public view returns (ListedToken[] memory) {
        uint256 totalTokens = _tokenIds;
        uint256 myTokenCount = 0;
        uint256 i;
        uint256 currentIndex = 0;

        for (i = 0; i < totalTokens; i++) {
            if (
                idToListedToken[i + 1].owner == msg.sender ||
                idToListedToken[i + 1].seller == msg.sender
            ) {
                myTokenCount++;
            }
        }

        ListedToken[] memory myTokens = new ListedToken[](myTokenCount);

        for (i = 0; i < totalTokens; i++) {
            if (
                idToListedToken[i + 1].owner == msg.sender ||
                idToListedToken[i + 1].seller == msg.sender
            ) {
                myTokens[currentIndex] = idToListedToken[i + 1];
                currentIndex++;
            }
        }

        return myTokens;
    }

    function executeSale(uint256 tokenId) public payable {
        uint256 price = idToListedToken[tokenId].price;
        require(
            msg.value == price,
            "Please pay the asking price of the NFT to purchase."
        );

        // Fetch seller of the token
        address seller = idToListedToken[tokenId].seller;

        // Assign the token buyer/msg.sender as the seller of token
        idToListedToken[tokenId].seller = payable(msg.sender);
        idToListedToken[tokenId].currentlyListed = true;

        // Transfer ownership of token from contract to buyer/msg.sender
        _transfer(address(this), msg.sender, tokenId);

        // Since the owner of token is not this contract, the token cannot sold further by it.
        // So we approve this contract the right to sell the token in future.
        approve(address(this), tokenId);

        payable(owner).transfer(listingPrice); // Pays the listing price to owner
        payable(seller).transfer(price); // Pays the token price to seller
    }
}
