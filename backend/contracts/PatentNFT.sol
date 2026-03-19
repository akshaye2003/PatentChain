// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PatentNFT
 * @dev ERC-721 NFT contract for representing patents as NFTs
 */
contract PatentNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    
    struct PatentMetadata {
        string title;
        string description;
        bytes32 documentHash;
        string ipfsHash;
        address inventor;
        uint256 mintTimestamp;
        bool transferable;
    }
    
    // Mapping from token ID to PatentMetadata
    mapping(uint256 => PatentMetadata) public patentMetadata;
    
    // Mapping from document hash to token ID (prevents duplicate minting)
    mapping(bytes32 => uint256) public documentHashToTokenId;
    
    // Mapping from owner to array of token IDs
    mapping(address => uint256[]) private _ownedTokens;
    
    // Base URI for token metadata
    string private _baseTokenURI;
    
    // Events
    event PatentMinted(
        uint256 indexed tokenId,
        address indexed inventor,
        bytes32 indexed documentHash,
        string ipfsHash,
        string title
    );
    
    event BatchPatentsMinted(
        uint256[] tokenIds,
        address indexed inventor
    );
    
    event TransferabilityUpdated(
        uint256 indexed tokenId,
        bool transferable
    );
    
    modifier onlyTokenOwner(uint256 _tokenId) {
        require(ownerOf(_tokenId) == msg.sender, "Not token owner");
        _;
    }
    
    modifier whenTransferable(uint256 _tokenId) {
        require(patentMetadata[_tokenId].transferable, "Token not transferable");
        _;
    }
    
    constructor(string memory name, string memory symbol) 
        ERC721(name, symbol) 
        Ownable() 
    {}
    
    /**
     * @dev Set base URI for token metadata
     * @param baseURI The base URI string
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Mint a new Patent NFT
     * @param _to Address to mint the NFT to
     * @param _title Patent title
     * @param _description Patent description
     * @param _documentHash Hash of the patent document
     * @param _ipfsHash IPFS hash of the patent document
     * @param _uri Token URI for metadata
     * @param _transferable Whether the token is transferable
     * @return tokenId The ID of the minted token
     */
    function mintPatentNFT(
        address _to,
        string memory _title,
        string memory _description,
        bytes32 _documentHash,
        string memory _ipfsHash,
        string memory _uri,
        bool _transferable
    ) external nonReentrant returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(_documentHash != bytes32(0), "Document hash required");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        require(documentHashToTokenId[_documentHash] == 0, "Patent already minted");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, _uri);
        
        patentMetadata[tokenId] = PatentMetadata({
            title: _title,
            description: _description,
            documentHash: _documentHash,
            ipfsHash: _ipfsHash,
            inventor: _to,
            mintTimestamp: block.timestamp,
            transferable: _transferable
        });
        
        documentHashToTokenId[_documentHash] = tokenId;
        _ownedTokens[_to].push(tokenId);
        
        emit PatentMinted(tokenId, _to, _documentHash, _ipfsHash, _title);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint multiple Patent NFTs
     * @param _to Address to mint the NFTs to
     * @param _titles Array of patent titles
     * @param _descriptions Array of patent descriptions
     * @param _documentHashes Array of document hashes
     * @param _ipfsHashes Array of IPFS hashes
     * @param _uris Array of token URIs
     * @param _transferable Whether the tokens are transferable
     * @return tokenIds Array of minted token IDs
     */
    function batchMintPatentNFT(
        address _to,
        string[] memory _titles,
        string[] memory _descriptions,
        bytes32[] memory _documentHashes,
        string[] memory _ipfsHashes,
        string[] memory _uris,
        bool _transferable
    ) external nonReentrant returns (uint256[] memory) {
        require(
            _titles.length == _descriptions.length &&
            _titles.length == _documentHashes.length &&
            _titles.length == _ipfsHashes.length &&
            _titles.length == _uris.length,
            "Array length mismatch"
        );
        
        uint256 batchSize = _titles.length;
        uint256[] memory tokenIds = new uint256[](batchSize);
        
        for (uint256 i = 0; i < batchSize; i++) {
            require(bytes(_titles[i]).length > 0, "Title required");
            require(_documentHashes[i] != bytes32(0), "Document hash required");
            require(bytes(_ipfsHashes[i]).length > 0, "IPFS hash required");
            require(documentHashToTokenId[_documentHashes[i]] == 0, "Patent already minted");
            
            _tokenIdCounter.increment();
            uint256 tokenId = _tokenIdCounter.current();
            
            _safeMint(_to, tokenId);
            _setTokenURI(tokenId, _uris[i]);
            
            patentMetadata[tokenId] = PatentMetadata({
                title: _titles[i],
                description: _descriptions[i],
                documentHash: _documentHashes[i],
                ipfsHash: _ipfsHashes[i],
                inventor: _to,
                mintTimestamp: block.timestamp,
                transferable: _transferable
            });
            
            documentHashToTokenId[_documentHashes[i]] = tokenId;
            _ownedTokens[_to].push(tokenId);
            
            tokenIds[i] = tokenId;
            
            emit PatentMinted(tokenId, _to, _documentHashes[i], _ipfsHashes[i], _titles[i]);
        }
        
        emit BatchPatentsMinted(tokenIds, _to);
        
        return tokenIds;
    }
    
    /**
     * @dev Get all patents owned by an address
     * @param _owner The owner address
     * @return tokenIds Array of token IDs owned by the address
     */
    function getPatentsByOwner(address _owner) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return _ownedTokens[_owner];
    }
    
    /**
     * @dev Check if a patent has been minted for a document hash
     * @param _documentHash The document hash to check
     * @return bool True if a patent exists for the hash
     */
    function isMinted(bytes32 _documentHash) external view returns (bool) {
        return documentHashToTokenId[_documentHash] != 0;
    }
    
    /**
     * @dev Get token ID by document hash
     * @param _documentHash The document hash
     * @return tokenId The token ID (0 if not found)
     */
    function getTokenIdByDocumentHash(bytes32 _documentHash) 
        external 
        view 
        returns (uint256) 
    {
        return documentHashToTokenId[_documentHash];
    }
    
    /**
     * @dev Get patent metadata
     * @param _tokenId The token ID
     * @return PatentMetadata struct
     */
    function getPatentMetadata(uint256 _tokenId) 
        external 
        view 
        returns (PatentMetadata memory) 
    {
        require(_exists(_tokenId), "Token does not exist");
        return patentMetadata[_tokenId];
    }
    
    /**
     * @dev Update transferability of a token (only owner or token owner)
     * @param _tokenId The token ID
     * @param _transferable New transferability status
     */
    function setTransferability(
        uint256 _tokenId, 
        bool _transferable
    ) external onlyTokenOwner(_tokenId) {
        patentMetadata[_tokenId].transferable = _transferable;
        emit TransferabilityUpdated(_tokenId, _transferable);
    }
    
    /**
     * @dev Override transfer functions to check transferability
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) whenTransferable(tokenId) {
        super.transferFrom(from, to, tokenId);
        _updateOwnedTokens(from, to, tokenId);
    }
    
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) whenTransferable(tokenId) {
        super.safeTransferFrom(from, to, tokenId);
        _updateOwnedTokens(from, to, tokenId);
    }
    
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override(ERC721, IERC721) whenTransferable(tokenId) {
        super.safeTransferFrom(from, to, tokenId, data);
        _updateOwnedTokens(from, to, tokenId);
    }
    
    /**
     * @dev Internal function to update owned tokens mapping
     */
    function _updateOwnedTokens(address from, address to, uint256 tokenId) internal {
        // Remove from sender's list
        uint256[] storage fromTokens = _ownedTokens[from];
        for (uint256 i = 0; i < fromTokens.length; i++) {
            if (fromTokens[i] == tokenId) {
                fromTokens[i] = fromTokens[fromTokens.length - 1];
                fromTokens.pop();
                break;
            }
        }
        
        // Add to recipient's list
        _ownedTokens[to].push(tokenId);
    }
    
    /**
     * @dev Override _burn to clean up metadata
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        delete patentMetadata[tokenId];
    }
    
    /**
     * @dev Override tokenURI
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override supportsInterface
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Override _baseURI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Check if token exists
     */
    function _exists(uint256 tokenId) internal view override returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
}
