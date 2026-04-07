// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract TradingVaultV2 {
    address public owner;
    uint256 public totalDeposited;
    mapping(address => uint256) public userDeposits;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    receive() external payable {
        userDeposits[msg.sender] += msg.value;
        totalDeposited += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function deposit() external payable {
        require(msg.value > 0, "Zero");
        userDeposits[msg.sender] += msg.value;
        totalDeposited += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function withdrawTo(address payable to, uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Low bal");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "Failed");
        if (amount <= totalDeposited) {
            totalDeposited -= amount;
        }
        emit Withdraw(to, amount);
    }

    function withdrawTokenTo(address token, address to, uint256 amount) external onlyOwner {
        require(amount > 0, "Zero");
        IERC20 t = IERC20(token);
        require(t.balanceOf(address(this)) >= amount, "Low bal");
        require(t.transfer(to, amount), "Failed");
        emit WithdrawToken(token, to, amount);
    }

    function tokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);
    event WithdrawToken(address indexed token, address indexed to, uint256 amount);
}
