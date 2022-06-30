// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}


contract XChange {
    using Counters for Counters.Counter;
    Counters.Counter public itemCounter;
    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Item {
        address payable owner;
        string name;
        string imageUrl;
        string description;
        uint256 price;
        bool sold;
        uint256 commentsCount;
    }

    struct Trader {
        address payable trader;
        uint256 sold;
        uint256 rating;
        uint256 rateCount;
        mapping(uint256 => string) reviews;
        mapping(uint256 => address) reviewOwner;
        mapping(address => bool) hasRate;
    }

    mapping(uint256 => Item) private items;
    mapping(address => Trader) private traders;
    mapping(address => bool) public isTrader;
    address[] public marketTraders;

    address contractOwner;

    // maps itemId to commentId to the string comment
    mapping(uint256 => mapping(uint256 => string)) private comments;
    // maps commentId to its respective owner
    mapping(uint256 => address) commentOwner;

    // is used to check if a product has already been deleted
    mapping(uint => bool) productDeleted;

    constructor() {
        contractOwner = msg.sender;
    }

    // adds a comment on a product
    // _comment is the comment received from the caller
    function comment(uint256 _index, string memory _comment) external {
        uint256 count = items[_index].commentsCount;
        // strings are initialised as "" thus the zero length
        // this ensures that the user is commenting for the first time on this product
        require(
            bytes(comments[_index][count]).length == 0,
            "User has already commented on this product"
        );
        require(bytes(_comment).length > 0, "Enter a valid comment");
        require(items[_index].owner != msg.sender, "You can't comment on this product while you own it");
        comments[_index][count] = _comment;
        commentOwner[count] = msg.sender;
        items[_index].commentsCount++;
    }

    // retrieves a user comment on a product
    // _commentId is derived from commentsCount
    function getComment(uint256 _index, uint256 _commentId)
        public
        view
        returns (string memory, address)
    {
        return (comments[_index][_commentId],commentOwner[_commentId]);
    }

    // deletes a previous comment, calleable only by the comment Owner or the contract Owner
    function deleteComment(uint256 _index, uint256 _commentId) external {
        require(
            commentOwner[_commentId] == msg.sender ||
                contractOwner == msg.sender,
            "Not authorized to do that"
        );
        require(
            bytes(comments[_index][_commentId]).length > 0,
            "Query for non existant comment"
        );
        delete comments[_index][_commentId];
    }


    // removes a product
    //
    function removeProduct(uint256 _index) external {
        require(
            contractOwner == msg.sender || items[_index].owner == msg.sender,
            "Not allowed to do that"
        );
        require(!productDeleted[_index], "Query for non existant product");
        productDeleted[_index] = true;
        delete items[_index];
    }

    // create a new market in the exchange pool
    function createItem(
        string memory _name,
        string memory _imageUrl,
        string memory _description,
        uint256 _price
    ) public {
        require(bytes(_name).length > 0, "Enter a valid name");
        require(bytes(_imageUrl).length > 7, "Enter a valid image url"); // ipfs urls starts with ipfs://
        require(bytes(_description).length > 0, "Enter a valid description");
        require(_price > 0, "Enter a valid price");
        items[itemCounter.current()] = Item(
            payable(msg.sender),
            _name,
            _imageUrl,
            _description,
            _price,
            false,
            0
        );
        itemCounter.increment();
        if (!isTrader[msg.sender]) {
            marketTraders.push(msg.sender);
            traders[msg.sender].trader = payable(msg.sender);
            isTrader[msg.sender] = true;
        }
    }

    // get new item from the exchange pool
    function getItem(uint256 _index)
        public
        view
        returns (
            address payable owner,
            string memory name,
            string memory imageUrl,
            string memory description,
            uint256 price,
            bool sold,
            uint256 commentsCount
        )
    {
        require(
            items[_index].owner != address(0),
            "Query for non-existent Item"
        );

        owner = items[_index].owner;
        name = items[_index].name;
        imageUrl = items[_index].imageUrl;
        description = items[_index].description;
        price = items[_index].price;
        sold = items[_index].sold;
        commentsCount = items[_index].commentsCount;
    }

    // buy item
    function buyItem(uint256 _index) public payable {
        Item storage item = items[_index];
        require(item.owner != msg.sender, "You can't buy your own product");
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                items[_index].owner,
                items[_index].price
            ),
            "Transfer failed."
        );

        traders[item.owner].sold++;
        item.sold = true;
        item.owner = payable(msg.sender);
    }

    // rate a trader and give a descriptive string _review and uint rating between 1 to 5
    function rateTrader(
        address _trader,
        uint256 _rating,
        string memory _review
    ) public {
        require(_trader != address(0), "non existent trader");
        require(_rating > 0 && _rating <= 5, "Enter a valid rating");
        require(bytes(_review).length > 0, "Enter a valid review");
        Trader storage trader = traders[_trader];
        require(
            !trader.hasRate[msg.sender],
            "You have already rated this trader"
        );
        trader.rating += _rating;
        trader.rateCount++;
        trader.reviews[trader.rateCount] = _review;
        trader.reviewOwner[trader.rateCount] = msg.sender;
        trader.hasRate[msg.sender] = true;
    }

    // get trader
    function getTrader(address _trader)
        public
        view
        returns (
            address payable trader,
            uint256 sold,
            uint256 rating,
            uint256 rateCount
        )
    {
        trader = traders[_trader].trader;
        sold = traders[_trader].sold;
        rating = traders[_trader].rating;
        rateCount = traders[_trader].rateCount;
    }

    // retrieves a review for a trader
    // _reviewId is derived from rateCount
    function getReview(address _trader, uint256 _reviewId)
        public
        view
        returns (string memory, address reviewer)
    {
        return (
            traders[_trader].reviews[_reviewId],
            traders[_trader].reviewOwner[_reviewId]
        );
    }
}
