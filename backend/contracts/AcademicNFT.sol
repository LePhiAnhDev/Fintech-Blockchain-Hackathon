// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AcademicNFT
 * @dev NFT contract for academic documents with marketplace functionality
 */
contract AcademicNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _tokenIdCounter;
    
    // Constants
    uint256 public constant MINT_PRICE = 0.01 ether;
    uint256 public constant PLATFORM_FEE_PERCENT = 1; // 1%
    uint256 public constant ROYALTY_MAX_PERCENT = 20; // Max 20% royalty
    
    // Structs
    struct DocumentNFT {
        string name;
        string description;
        string fileType;
        address creator;
        uint256 royaltyPercent;
        uint256 createdAt;
    }
    
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
        uint256 listedAt;
    }
    
    // Mappings
    mapping(uint256 => DocumentNFT) public documents;
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public userTokens;
    mapping(uint256 => uint256) private userTokensIndex;
    
    // Events
    event DocumentMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        string tokenURI,
        string fileType
    );
    
    event DocumentListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    
    event DocumentSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 royalty,
        uint256 platformFee
    );
    
    event ListingCancelled(
        uint256 indexed tokenId,
        address indexed seller
    );
    
    constructor() ERC721("Academic NFT", "ANFT") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new document NFT
     * @param to Address to mint the NFT to
     * @param name Name of the document
     * @param description Description of the document
     * @param tokenMetadataURI IPFS URI containing metadata
     * @param fileType Type of file (pdf, docx, txt, md, png, jpeg)
     * @param royaltyPercent Royalty percentage for future sales (0-20%)
     */
    function mintDocument(
        address to,
        string memory name,
        string memory description,
        string memory tokenMetadataURI,
        string memory fileType,
        uint256 royaltyPercent
    ) public payable nonReentrant {
        require(msg.value >= MINT_PRICE, "Insufficient payment for minting");
        require(royaltyPercent <= ROYALTY_MAX_PERCENT, "Royalty percentage too high");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(tokenMetadataURI).length > 0, "Token URI cannot be empty");
        
        uint256 tokenId = _tokenIdCounter++;
        
        // Increment happens after assignment
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenMetadataURI);
        
        // Store document metadata
        documents[tokenId] = DocumentNFT({
            name: name,
            description: description,
            fileType: fileType,
            creator: to,
            royaltyPercent: royaltyPercent,
            createdAt: block.timestamp
        });
        
        // Add to user's token list
        userTokens[to].push(tokenId);
        userTokensIndex[tokenId] = userTokens[to].length - 1;
        
        emit DocumentMinted(tokenId, to, name, tokenMetadataURI, fileType);
    }
    
    /**
     * @dev List an NFT for sale
     * @param tokenId Token ID to list
     * @param price Price in wei
     */
    function listForSale(uint256 tokenId, uint256 price) public {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(!listings[tokenId].active, "Already listed");
        require(price > 0, "Price must be greater than 0");
        
        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true,
            listedAt: block.timestamp
        });
        
        emit DocumentListed(tokenId, msg.sender, price);
    }
    
    /**
     * @dev Cancel a listing
     * @param tokenId Token ID to cancel listing
     */
    function cancelListing(uint256 tokenId) public {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        require(listings[tokenId].active, "Not listed");
        
        listings[tokenId].active = false;
        
        emit ListingCancelled(tokenId, msg.sender);
    }
    
    /**
     * @dev Purchase an NFT
     * @param tokenId Token ID to purchase
     */
    function purchaseNFT(uint256 tokenId) public payable nonReentrant {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(listings[tokenId].active, "Not for sale");
        require(msg.value >= listings[tokenId].price, "Insufficient payment");
        require(msg.sender != listings[tokenId].seller, "Cannot buy your own NFT");
        
        Listing memory listing = listings[tokenId];
        DocumentNFT memory doc = documents[tokenId];
        
        // Calculate fees
        uint256 salePrice = listing.price;
        uint256 platformFee = (salePrice * PLATFORM_FEE_PERCENT) / 100;
        uint256 royalty = 0;
        
        // Calculate royalty if not original creator buying
        if (doc.creator != listing.seller && doc.royaltyPercent > 0) {
            royalty = (salePrice * doc.royaltyPercent) / 100;
        }
        
        uint256 sellerAmount = salePrice - platformFee - royalty;
        
        // Transfer NFT
        address seller = listing.seller;
        address buyer = msg.sender;
        
        // Remove from seller's token list
        _removeFromUserTokens(seller, tokenId);
        
        // Add to buyer's token list
        userTokens[buyer].push(tokenId);
        userTokensIndex[tokenId] = userTokens[buyer].length - 1;
        
        // Transfer ownership
        _transfer(seller, buyer, tokenId);
        
        // Mark as not listed
        listings[tokenId].active = false;
        
        // Transfer payments
        if (sellerAmount > 0) {
            payable(seller).transfer(sellerAmount);
        }
        
        if (royalty > 0) {
            payable(doc.creator).transfer(royalty);
        }
        
        if (platformFee > 0) {
            payable(owner()).transfer(platformFee);
        }
        
        // Refund excess payment
        if (msg.value > salePrice) {
            payable(buyer).transfer(msg.value - salePrice);
        }
        
        emit DocumentSold(tokenId, seller, buyer, salePrice, royalty, platformFee);
    }
    
    /**
     * @dev Remove token from user's token list (internal function)
     */
    function _removeFromUserTokens(address user, uint256 tokenId) internal {
        uint256[] storage tokens = userTokens[user];
        uint256 index = userTokensIndex[tokenId];
        uint256 lastIndex = tokens.length - 1;
        
        if (index != lastIndex) {
            uint256 lastTokenId = tokens[lastIndex];
            tokens[index] = lastTokenId;
            userTokensIndex[lastTokenId] = index;
        }
        
        tokens.pop();
        delete userTokensIndex[tokenId];
    }
    
    /**
     * @dev Get all active listings
     */
    function getActiveListings() public view returns (uint256[] memory) {
        uint256 totalTokens = _tokenIdCounter;
        uint256[] memory activeListings = new uint256[](totalTokens);
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < totalTokens; i++) {
            if (listings[i].active) {
                activeListings[activeCount] = i;
                activeCount++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeListings[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get user's tokens
     */
    function getUserTokens(address user) public view returns (uint256[] memory) {
        return userTokens[user];
    }
    
    /**
     * @dev Get document metadata
     */
    function getDocument(uint256 tokenId) public view returns (DocumentNFT memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return documents[tokenId];
    }
    
    /**
     * @dev Get listing details
     */
    function getListing(uint256 tokenId) public view returns (Listing memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return listings[tokenId];
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    // Override required functions for ERC721URIStorage
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
} 