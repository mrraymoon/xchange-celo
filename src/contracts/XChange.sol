// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";

interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract XChange {
    using Counters for Counters.Counter;
    Counters.Counter public itemCounter;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Item {
        address payable owner;
        string name;
        string imageUrl;
        string description;
        uint price;
        bool sold;
    }

    struct Trader {
        address payable trader;
        uint256 sold;
        uint256 rating;
        uint256 rateCount;
        mapping(address => bool) hasRate;
    }

    mapping(uint => Item) private items;
    mapping(address => Trader) private traders;
    mapping(address => bool) public isTrader;
    address[] public marketTraders;

    // create a new market in the exchange pool
    function createItem(
        string memory _name,
        string memory _imageUrl,
        string memory _description, 
        uint _price
    ) public {        
        items[itemCounter.current()] = Item(
            payable(msg.sender),
            _name,
            _imageUrl,
            _description,
            _price,
            false
        );
        itemCounter.increment();
        if (!isTrader[msg.sender]) {
            marketTraders.push(msg.sender);
            traders[msg.sender].trader = payable(msg.sender);
            isTrader[msg.sender] = true;
        }
    }

    // get new item from the exchange pool
    function getItem(uint _index) public view returns (
        address payable owner,
        string memory name, 
        string memory imageUrl, 
        string memory description,  
        uint256 price,
        bool sold
    ) {
        require(items[_index].owner != address(0), "Query for non-existent Item");
        
        owner = items[_index].owner;
        name = items[_index].name;
        imageUrl = items[_index].imageUrl;
        description = items[_index].description;
        price = items[_index].price;
        sold = items[_index].sold;
    }

    // buy item
    function buyItem(uint _index) public payable  {
        require(
          IERC20Token(cUsdTokenAddress).transferFrom(
            msg.sender,
            items[_index].owner,
            items[_index].price
          ),
          "Transfer failed."
        );
        Item storage item = items[_index];
        traders[item.owner].sold++;
        item.sold = true;
        item.owner = payable(msg.sender);   
    }

    // rate a trader
    function rateTrader(address _trader, uint256 _rating) public {
        Trader storage trader = traders[_trader];
        require(!trader.hasRate[msg.sender], "You have already rated this trader");
        trader.rating += _rating;
        trader.rateCount++;        
        trader.hasRate[msg.sender] = true;
    }

    // get trader 
    function getTrader(address _trader) public view returns (
        address payable trader,
        uint256 sold,
        uint256 rating,
        uint256 rateCount
    ) {
        trader = traders[_trader].trader;
        sold = traders[_trader].sold;
        rating = traders[_trader].rating;
        rateCount = traders[_trader].rateCount;
    }

    // get market traders 
    function getMarketTraders() public view returns (address[] memory) {
        return marketTraders;
    }

}