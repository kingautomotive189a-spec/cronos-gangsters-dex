// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GANGMiningRewards
 * @dev Smart contract for automatic $GANG mining reward distributions
 * 
 * HOW TO DEPLOY:
 * 1. Go to https://remix.ethereum.org
 * 2. Create new file: GANGMiningRewards.sol
 * 3. Paste this code
 * 4. Compile with Solidity 0.8.19
 * 5. Connect MetaMask to Cronos network
 * 6. Deploy with GANG token address: 0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF
 * 7. Fund contract with $GANG tokens for rewards
 */

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract GANGMiningRewards {
    // State variables
    address public owner;
    address public operator; // Can process withdrawals
    IERC20 public gangToken;
    
    // Mining stats
    uint256 public totalWithdrawn;
    uint256 public totalUsers;
    
    // Withdrawal tracking
    mapping(bytes32 => bool) public processedWithdrawals;
    mapping(address => uint256) public userTotalWithdrawn;
    
    // Events
    event WithdrawalProcessed(
        address indexed user,
        uint256 amount,
        bytes32 indexed withdrawalId,
        uint256 timestamp
    );
    event FundsDeposited(address indexed from, uint256 amount);
    event OperatorUpdated(address indexed newOperator);
    event EmergencyWithdraw(address indexed to, uint256 amount);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyOperator() {
        require(msg.sender == owner || msg.sender == operator, "Only operator");
        _;
    }
    
    constructor(address _gangToken) {
        owner = msg.sender;
        operator = msg.sender;
        gangToken = IERC20(_gangToken);
    }
    
    /**
     * @dev Process a withdrawal request
     * @param user Wallet address to send tokens to
     * @param amount Amount of $GANG to send (in wei, 18 decimals)
     * @param withdrawalId Unique withdrawal ID from backend
     */
    function processWithdrawal(
        address user,
        uint256 amount,
        bytes32 withdrawalId
    ) external onlyOperator {
        require(!processedWithdrawals[withdrawalId], "Already processed");
        require(user != address(0), "Invalid address");
        require(amount > 0, "Invalid amount");
        require(gangToken.balanceOf(address(this)) >= amount, "Insufficient funds");
        
        // Mark as processed
        processedWithdrawals[withdrawalId] = true;
        
        // Update stats
        totalWithdrawn += amount;
        userTotalWithdrawn[user] += amount;
        
        // Transfer tokens
        require(gangToken.transfer(user, amount), "Transfer failed");
        
        emit WithdrawalProcessed(user, amount, withdrawalId, block.timestamp);
    }
    
    /**
     * @dev Batch process multiple withdrawals
     */
    function batchProcessWithdrawals(
        address[] calldata users,
        uint256[] calldata amounts,
        bytes32[] calldata withdrawalIds
    ) external onlyOperator {
        require(users.length == amounts.length, "Length mismatch");
        require(users.length == withdrawalIds.length, "Length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            if (!processedWithdrawals[withdrawalIds[i]] && users[i] != address(0) && amounts[i] > 0) {
                processedWithdrawals[withdrawalIds[i]] = true;
                totalWithdrawn += amounts[i];
                userTotalWithdrawn[users[i]] += amounts[i];
                
                require(gangToken.transfer(users[i], amounts[i]), "Transfer failed");
                
                emit WithdrawalProcessed(users[i], amounts[i], withdrawalIds[i], block.timestamp);
            }
        }
    }
    
    /**
     * @dev Check if withdrawal has been processed
     */
    function isWithdrawalProcessed(bytes32 withdrawalId) external view returns (bool) {
        return processedWithdrawals[withdrawalId];
    }
    
    /**
     * @dev Get contract's $GANG balance
     */
    function getBalance() external view returns (uint256) {
        return gangToken.balanceOf(address(this));
    }
    
    /**
     * @dev Set operator address
     */
    function setOperator(address _operator) external onlyOwner {
        operator = _operator;
        emit OperatorUpdated(_operator);
    }
    
    /**
     * @dev Emergency withdraw all tokens (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = gangToken.balanceOf(address(this));
        require(balance > 0, "No balance");
        require(gangToken.transfer(owner, balance), "Transfer failed");
        emit EmergencyWithdraw(owner, balance);
    }
    
    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
