// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Crowdfunding
 * @dev A crowdfunding contract for patent projects
 */
contract Crowdfunding is ReentrancyGuard, Ownable {
    
    enum ProjectStatus { Active, Successful, Failed }
    
    struct Project {
        uint256 id;
        address creator;
        string title;
        string description;
        string category;
        uint256 fundingGoal;
        uint256 deadline;
        uint256 amountRaised;
        bytes32 patentHash;
        ProjectStatus status;
        bool fundsWithdrawn;
    }
    
    struct Contribution {
        uint256 amount;
        bool refunded;
    }
    
    // Project ID counter
    uint256 public projectCount;
    
    // Mapping from project ID to Project
    mapping(uint256 => Project) public projects;
    
    // Mapping from project ID to contributor address to Contribution
    mapping(uint256 => mapping(address => Contribution)) public contributions;
    
    // Mapping from project ID to array of contributor addresses
    mapping(uint256 => address[]) public projectContributors;
    
    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed creator,
        string title,
        uint256 fundingGoal,
        uint256 deadline,
        bytes32 patentHash
    );
    
    event ContributionReceived(
        uint256 indexed projectId,
        address indexed contributor,
        uint256 amount
    );
    
    event FundsWithdrawn(
        uint256 indexed projectId,
        address indexed creator,
        uint256 amount
    );
    
    event RefundIssued(
        uint256 indexed projectId,
        address indexed contributor,
        uint256 amount
    );
    
    event ProjectStatusUpdated(
        uint256 indexed projectId,
        ProjectStatus status
    );
    
    modifier onlyCreator(uint256 _projectId) {
        require(projects[_projectId].creator == msg.sender, "Not project creator");
        _;
    }
    
    modifier projectExists(uint256 _projectId) {
        require(_projectId > 0 && _projectId <= projectCount, "Project does not exist");
        _;
    }
    
    modifier activeProject(uint256 _projectId) {
        require(projects[_projectId].status == ProjectStatus.Active, "Project not active");
        require(block.timestamp < projects[_projectId].deadline, "Deadline passed");
        _;
    }
    
    constructor() Ownable() {}
    
    /**
     * @dev Create a new crowdfunding project
     * @param _title Project title
     * @param _description Project description
     * @param _category Project category
     * @param _fundingGoal Funding goal in wei
     * @param _duration Duration in seconds
     * @param _patentHash Hash of the associated patent
     * @return projectId The ID of the created project
     */
    function createProject(
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _fundingGoal,
        uint256 _duration,
        bytes32 _patentHash
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(_fundingGoal > 0, "Funding goal must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        projectCount++;
        uint256 projectId = projectCount;
        
        projects[projectId] = Project({
            id: projectId,
            creator: msg.sender,
            title: _title,
            description: _description,
            category: _category,
            fundingGoal: _fundingGoal,
            deadline: block.timestamp + _duration,
            amountRaised: 0,
            patentHash: _patentHash,
            status: ProjectStatus.Active,
            fundsWithdrawn: false
        });
        
        emit ProjectCreated(
            projectId,
            msg.sender,
            _title,
            _fundingGoal,
            block.timestamp + _duration,
            _patentHash
        );
        
        return projectId;
    }
    
    /**
     * @dev Contribute ETH to a project
     * @param _projectId The project ID
     */
    function contribute(uint256 _projectId) 
        external 
        payable 
        nonReentrant 
        projectExists(_projectId) 
        activeProject(_projectId) 
    {
        require(msg.value > 0, "Contribution must be greater than 0");
        
        Project storage project = projects[_projectId];
        
        // Track first-time contributors
        if (contributions[_projectId][msg.sender].amount == 0) {
            projectContributors[_projectId].push(msg.sender);
        }
        
        contributions[_projectId][msg.sender].amount += msg.value;
        project.amountRaised += msg.value;
        
        emit ContributionReceived(_projectId, msg.sender, msg.value);
    }
    
    /**
     * @dev Creator withdraws funds if goal reached
     * @param _projectId The project ID
     */
    function withdrawFunds(uint256 _projectId) 
        external 
        nonReentrant 
        projectExists(_projectId) 
        onlyCreator(_projectId) 
    {
        Project storage project = projects[_projectId];
        
        require(block.timestamp >= project.deadline, "Funding period not ended");
        require(project.amountRaised >= project.fundingGoal, "Funding goal not reached");
        require(!project.fundsWithdrawn, "Funds already withdrawn");
        require(project.status == ProjectStatus.Active, "Project not active");
        
        project.status = ProjectStatus.Successful;
        project.fundsWithdrawn = true;
        
        uint256 amount = project.amountRaised;
        
        (bool success, ) = payable(project.creator).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit ProjectStatusUpdated(_projectId, ProjectStatus.Successful);
        emit FundsWithdrawn(_projectId, project.creator, amount);
    }
    
    /**
     * @dev Request refund if goal not reached
     * @param _projectId The project ID
     */
    function requestRefund(uint256 _projectId) 
        external 
        nonReentrant 
        projectExists(_projectId) 
    {
        Project storage project = projects[_projectId];
        
        require(block.timestamp >= project.deadline, "Funding period not ended");
        require(project.amountRaised < project.fundingGoal, "Funding goal was reached");
        require(project.status == ProjectStatus.Active, "Project not active");
        
        Contribution storage contribution = contributions[_projectId][msg.sender];
        require(contribution.amount > 0, "No contribution found");
        require(!contribution.refunded, "Already refunded");
        
        contribution.refunded = true;
        
        (bool success, ) = payable(msg.sender).call{value: contribution.amount}("");
        require(success, "Refund transfer failed");
        
        emit RefundIssued(_projectId, msg.sender, contribution.amount);
        
        // Update status if this is the first refund after deadline
        if (project.status == ProjectStatus.Active) {
            project.status = ProjectStatus.Failed;
            emit ProjectStatusUpdated(_projectId, ProjectStatus.Failed);
        }
    }
    
    /**
     * @dev Finalize project status after deadline (can be called by anyone)
     * @param _projectId The project ID
     */
    function finalizeProject(uint256 _projectId) 
        external 
        projectExists(_projectId) 
    {
        Project storage project = projects[_projectId];
        
        require(block.timestamp >= project.deadline, "Funding period not ended");
        require(project.status == ProjectStatus.Active, "Project already finalized");
        
        if (project.amountRaised >= project.fundingGoal) {
            project.status = ProjectStatus.Successful;
        } else {
            project.status = ProjectStatus.Failed;
        }
        
        emit ProjectStatusUpdated(_projectId, project.status);
    }
    
    /**
     * @dev Get contribution amount for a specific contributor
     * @param _projectId The project ID
     * @param _contributor The contributor address
     * @return The contribution amount
     */
    function getContribution(uint256 _projectId, address _contributor) 
        external 
        view 
        returns (uint256) 
    {
        return contributions[_projectId][_contributor].amount;
    }
    
    /**
     * @dev Get all contributors for a project
     * @param _projectId The project ID
     * @return Array of contributor addresses
     */
    function getProjectContributors(uint256 _projectId) 
        external 
        view 
        returns (address[] memory) 
    {
        return projectContributors[_projectId];
    }
    
    /**
     * @dev Get project details
     * @param _projectId The project ID
     * @return Project struct
     */
    function getProject(uint256 _projectId) 
        external 
        view 
        returns (Project memory) 
    {
        return projects[_projectId];
    }
    
    /**
     * @dev Check if project has ended
     * @param _projectId The project ID
     * @return bool True if project has ended
     */
    function hasEnded(uint256 _projectId) 
        external 
        view 
        returns (bool) 
    {
        return block.timestamp >= projects[_projectId].deadline;
    }
}
