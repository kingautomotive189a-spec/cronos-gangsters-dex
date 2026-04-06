// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract MultiTokenLendingVault {
    address public owner;
    
    // token => total liquidity available for borrowing
    mapping(address => uint256) public poolLiquidity;
    // token => user => amount supplied
    mapping(address => mapping(address => uint256)) public userSupplied;
    // token => user => amount borrowed
    mapping(address => mapping(address => uint256)) public userBorrowed;
    // token => total supplied
    mapping(address => uint256) public totalSupplied;
    // token => total borrowed
    mapping(address => uint256) public totalBorrowed;
    
    uint256 public feeBps = 30; // 0.3% origination fee
    uint256 public ltv = 75; // 75% loan-to-value
    
    event Supplied(address indexed token, address indexed user, uint256 amount);
    event Withdrawn(address indexed token, address indexed user, uint256 amount);
    event Borrowed(address indexed token, address indexed user, uint256 amount);
    event Repaid(address indexed token, address indexed user, uint256 amount);
    event LiquidityAdded(address indexed token, address indexed provider, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "!owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Owner adds liquidity for any token
    function addLiquidity(address token, uint256 amount) external {
        require(amount > 0, "!amount");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        poolLiquidity[token] += amount;
        emit LiquidityAdded(token, msg.sender, amount);
    }
    
    // User supplies collateral
    function supply(address token, uint256 amount) external {
        require(amount > 0, "!amount");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        userSupplied[token][msg.sender] += amount;
        totalSupplied[token] += amount;
        poolLiquidity[token] += amount;
        emit Supplied(token, msg.sender, amount);
    }
    
    // User withdraws their supplied collateral (if not locked by borrows)
    function withdraw(address token, uint256 amount) external {
        require(amount > 0, "!amount");
        require(userSupplied[token][msg.sender] >= amount, "!balance");
        require(poolLiquidity[token] >= amount, "!liquidity");
        userSupplied[token][msg.sender] -= amount;
        totalSupplied[token] -= amount;
        poolLiquidity[token] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        emit Withdrawn(token, msg.sender, amount);
    }
    
    // User borrows actual tokens — checks pool has enough liquidity
    function borrow(address token, uint256 amount) external {
        require(amount > 0, "!amount");
        require(poolLiquidity[token] >= amount, "Insufficient pool liquidity");
        // Fee
        uint256 fee = (amount * feeBps) / 10000;
        poolLiquidity[token] -= amount;
        userBorrowed[token][msg.sender] += amount;
        totalBorrowed[token] += amount;
        // Transfer actual tokens to borrower
        IERC20(token).transfer(msg.sender, amount - fee);
        emit Borrowed(token, msg.sender, amount);
    }
    
    // User repays borrowed tokens
    function repay(address token, uint256 amount) external {
        require(amount > 0, "!amount");
        require(userBorrowed[token][msg.sender] >= amount, "!debt");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        userBorrowed[token][msg.sender] -= amount;
        totalBorrowed[token] -= amount;
        poolLiquidity[token] += amount;
        emit Repaid(token, msg.sender, amount);
    }
    
    // View: available liquidity for a token
    function getAvailableLiquidity(address token) external view returns (uint256) {
        return poolLiquidity[token];
    }
    
    // View: user's supply balance
    function getUserSupplied(address token, address user) external view returns (uint256) {
        return userSupplied[token][user];
    }
    
    // View: user's borrow balance
    function getUserBorrowed(address token, address user) external view returns (uint256) {
        return userBorrowed[token][user];
    }
    
    // Owner can update fee
    function setFeeBps(uint256 _bps) external onlyOwner {
        feeBps = _bps;
    }
    
    // Owner can withdraw fees/excess
    function ownerWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "!zero");
        owner = newOwner;
    }
}
