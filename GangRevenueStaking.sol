// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * GANG Revenue Staking Contract
 * 
 * Users stake GANG tokens and earn CRO rewards proportionally.
 * Owner can deposit CRO rewards into the pool.
 * Rewards are distributed based on stake share.
 */

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract GangRevenueStaking {
    address public owner;
    IERC20 public gangToken;
    
    uint256 public totalStaked;
    uint256 public rewardPerTokenStored;
    uint256 public lastRewardTime;
    uint256 public rewardRate; // CRO per second (in wei)
    uint256 public rewardPool; // Total CRO available for distribution
    
    mapping(address => uint256) public staked;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event RewardDeposited(address indexed depositor, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastRewardTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
    
    constructor(address _gangToken) {
        owner = msg.sender;
        gangToken = IERC20(_gangToken);
        lastRewardTime = block.timestamp;
    }
    
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) return rewardPerTokenStored;
        uint256 elapsed = block.timestamp - lastRewardTime;
        return rewardPerTokenStored + (elapsed * rewardRate * 1e18 / totalStaked);
    }
    
    function earned(address account) public view returns (uint256) {
        return (staked[account] * (rewardPerToken() - userRewardPerTokenPaid[account]) / 1e18) + rewards[account];
    }
    
    // Stake GANG tokens
    function stake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        gangToken.transferFrom(msg.sender, address(this), amount);
        staked[msg.sender] += amount;
        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }
    
    // Unstake GANG tokens
    function unstake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Cannot unstake 0");
        require(staked[msg.sender] >= amount, "Not enough staked");
        staked[msg.sender] -= amount;
        totalStaked -= amount;
        gangToken.transfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }
    
    // Claim CRO rewards
    function claimReward() external updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards");
        require(address(this).balance >= reward, "Insufficient CRO in contract");
        rewards[msg.sender] = 0;
        (bool sent, ) = payable(msg.sender).call{value: reward}("");
        require(sent, "CRO transfer failed");
        emit RewardClaimed(msg.sender, reward);
    }
    
    // Owner deposits CRO rewards and sets distribution rate
    function depositRewards(uint256 durationSeconds) external payable onlyOwner updateReward(address(0)) {
        require(msg.value > 0, "Must send CRO");
        require(durationSeconds > 0, "Duration must be > 0");
        rewardPool += msg.value;
        rewardRate = msg.value / durationSeconds;
        lastRewardTime = block.timestamp;
        emit RewardDeposited(msg.sender, msg.value);
    }
    
    // Emergency: owner can withdraw stuck tokens
    function emergencyWithdraw() external onlyOwner {
        (bool sent, ) = payable(owner).call{value: address(this).balance}("");
        require(sent, "Failed");
    }
    
    // Accept CRO deposits
    receive() external payable {}
}
