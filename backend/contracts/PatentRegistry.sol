// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PatentRegistry
 * @dev A simple contract for registering document hashes on the blockchain
 */
contract PatentRegistry {
    
    struct Document {
        bytes32 hash;
        string fileName;
        address owner;
        uint256 timestamp;
        uint256 blockNumber;
    }
    
    // Mapping from hash to Document
    mapping(bytes32 => Document) public documents;
    
    // Mapping from owner to their document hashes
    mapping(address => bytes32[]) public ownerDocuments;
    
    // Total number of documents registered
    uint256 public totalDocuments;
    
    // Events
    event DocumentRegistered(
        bytes32 indexed hash,
        string fileName,
        address indexed owner,
        uint256 timestamp,
        uint256 blockNumber
    );
    
    /**
     * @dev Register a new document hash
     * @param _hash The SHA-256 hash of the document
     * @param _fileName The name of the file
     */
    function registerDocument(bytes32 _hash, string memory _fileName) public {
        require(_hash != bytes32(0), "Invalid hash");
        require(bytes(_fileName).length > 0, "File name required");
        require(documents[_hash].timestamp == 0, "Document already registered");
        
        Document memory newDoc = Document({
            hash: _hash,
            fileName: _fileName,
            owner: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number
        });
        
        documents[_hash] = newDoc;
        ownerDocuments[msg.sender].push(_hash);
        totalDocuments++;
        
        emit DocumentRegistered(
            _hash,
            _fileName,
            msg.sender,
            block.timestamp,
            block.number
        );
    }
    
    /**
     * @dev Check if a document hash is registered
     * @param _hash The hash to check
     * @return bool True if registered
     */
    function isRegistered(bytes32 _hash) public view returns (bool) {
        return documents[_hash].timestamp != 0;
    }
    
    /**
     * @dev Get document details by hash
     * @param _hash The document hash
     * @return Document struct
     */
    function getDocument(bytes32 _hash) public view returns (Document memory) {
        require(documents[_hash].timestamp != 0, "Document not found");
        return documents[_hash];
    }
    
    /**
     * @dev Get all document hashes for an owner
     * @param _owner The owner address
     * @return bytes32[] Array of hashes
     */
    function getOwnerDocuments(address _owner) public view returns (bytes32[] memory) {
        return ownerDocuments[_owner];
    }
}
