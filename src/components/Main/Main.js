import React from "react";
import BigNumber from "bignumber.js";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import "./Main.css";

const Main = ({ items, userAddress, buyItem }) => {
  return (
    <div className="main">
      {items?.map((item) => (
        <div className="item-card">
          <div className="card-price">
            ${BigNumber(item.price).shiftedBy(-18).toString()}
          </div>
          <img className="card-img" src={item.imageUrl} alt={item.name} />
          <div className="item-details">
            <Jazzicon diameter={40} seed={jsNumberForAddress(item.owner)} />
            <div className="item-details-address">{item.owner}</div>
          </div>
          <div className="card-description">{item.description}</div>
          {userAddress !== item.owner && (
            <div
              className="buy"
              onClick={() => buyItem(item.index, item.price)}
            >
              Buy
            </div>
          )}

          <div></div>
        </div>
      ))}
    </div>
  );
};

export default Main;
