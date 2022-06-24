import { useState, useEffect } from "react";
import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BigNumber from "bignumber.js";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

import xchangeAbi from "./contracts/xchange.abi.json";
import erc20abi from "./contracts/erc20.abi.json";
import { Header, Main, Traders, New } from "./components";
import "./App.css";

const ERC20_DECIMALS = 18;
const xchangeContractAddress = "0xD76504526Cf6D6B7cC91e9F1BbE339DA78F47cc3";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

function App() {
  const [kit, setKit] = useState();
  const [items, setItems] = useState();
  const [traders, setTraders] = useState();
  const [tradersArr, setTradersArr] = useState();
  const [balance, setBalance] = useState(0);
  const [userAddress, setAddress] = useState();
  const [xchangeContract, setXchangeContract] = useState();

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (kit && userAddress) {
      getBalance();
    }
  }, [kit, userAddress]);

  useEffect(() => {
    if (xchangeContract) {
      loadItems();
      getTraders();
    }
  }, [xchangeContract]);

  // create an identicon from `_address`
  const identicon = (_address) => {
    return <Jazzicon diameter={50} seed={jsNumberForAddress(_address)} />;
  };

  const approvePayment = async (_amount) => {
    const cUSDContract = new kit.web3.eth.Contract(
      erc20abi,
      cUSDContractAddress
    );
    await cUSDContract.methods
      .approve(xchangeContractAddress, _amount)
      .send({ from: kit.defaultAccount });
  };

  // connect wallet to app
  const connectWallet = async () => {
    if (window.celo) {
      // alert("⚠️ Please approve this DApp to use it.");
      try {
        await window.celo.enable();
        const web3 = new Web3(window.celo);
        let kit = newKitFromWeb3(web3);

        const accounts = await kit.web3.eth.getAccounts();
        const defaultAccount = accounts[0];
        kit.defaultAccount = defaultAccount;

        setKit(kit);
        setAddress(defaultAccount);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert(
        "You need to install the celo wallet extension in order to use this app"
      );
    }
  };

  // get both cUSD balance and RP balance
  const getBalance = async () => {
    try {
      const balance = await kit.getTotalBalance(userAddress);
      const cUsdBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
      const xchangeContract = new kit.web3.eth.Contract(
        xchangeAbi,
        xchangeContractAddress
      );

      setBalance(cUsdBalance);
      setXchangeContract(xchangeContract);
    } catch (error) {
      console.log(error);
    }
  };

  // load items from market
  const loadItems = async () => {
    try {
      const itemsCount = await xchangeContract.methods.itemCounter().call();
      const _items = [];
      for (let i = 0; i < itemsCount; i++) {
        let item = await new Promise(async (resolve) => {
          let _item = await xchangeContract.methods.getItem(i).call();
          resolve({
            index: i,
            owner: _item[0],
            name: _item[1],
            imageUrl: _item[2],
            description: _item[3],
            price: _item[4],
            sold: _item[5],
          });
        });
        _items.push(item);
      }
      const allItems = await Promise.all(_items);
      console.log(allItems.length);
      setItems(allItems);
    } catch (e) {
      console.log("Error loading items: " + e);
    }
  };

  // create new item with give parameters
  const createItem = async (name, imageUrl, description, _price) => {
    try {
      const price = new BigNumber(_price).shiftedBy(ERC20_DECIMALS).toString();
      const txn = await xchangeContract.methods
        .createItem(name, imageUrl, description, price)
        .send({ from: userAddress });
    } catch (e) {
      console.log("Error creating item: " + e);
    }
  };

  // buy item at index `itemIndex`
  const buyItem = async (itemIndex, itemPrice) => {
    console.log(userAddress);
    try {
      await approvePayment(itemPrice);
    } catch (e) {
      console.log("Error while approving payment: " + e);
    }

    try {
      await xchangeContract.methods
        .buyItem(itemIndex)
        .send({ from: userAddress });
    } catch (e) {
      console.log("Error while calling buyItem(): " + e);
    }
  };

  // return all traders
  const getTraders = async () => {
    try {
      const tradersArr = await xchangeContract.methods
        .getMarketTraders()
        .call();
      setTradersArr(tradersArr);
      const _traders = await Promise.all(
        tradersArr.map(async (trader) => {
          const _trader = await xchangeContract.methods
            .getTrader(trader)
            .call();
          return {
            trader: _trader.trader,
            sold: _trader.sold,
            rating: _trader.rating,
            rateCount: _trader.rateCount,
          };
        })
      );
      setTraders(_traders);
    } catch (e) {
      console.log("Error getting traders: " + e);
    }
  };

  // rate trader with address `trader`g
  const rateTrader = async (trader, rate) => {
    try {
      await xchangeContract.methods
        .rateTrader(trader, rate)
        .send({ from: userAddress });
    } catch (e) {
      console.log("Error while rating traders: " + e);
    }
  };

  return (
    <div className="App">
      <Router>
        <Header balance={balance} />
        <Routes>
          <Route
            path="/"
            element={
              <Main items={items} userAddress={userAddress} buyItem={buyItem} />
            }
          />
          <Route path="/new" element={<New createItem={createItem} />} />
          <Route
            path="/traders"
            element={
              <Traders
                traders={traders}
                identicon={identicon}
                tradersArr={tradersArr}
                rateTrader={rateTrader}
              />
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
