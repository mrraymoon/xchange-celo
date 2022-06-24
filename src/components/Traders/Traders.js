import React, { useEffect, useState } from "react";
import "./Traders.css";

const Traders = ({ traders, tradersArr, identicon, rateTrader }) => {
  const [rate, setRate] = useState(5);
  const [allRates, setAllRates] = useState();

  const loadRates = () => {
    tradersArr.forEach((trader) => {
      setAllRates((prev) => {
        let newObj = { ...prev, [trader]: 5 };
        return newObj;
      });
    });
  };

  const handleRateChange = (value, trader) => {    
    if ((value < 1) || (value > 5)) {
      alert("Rating out of range");
      return;
    }
    setAllRates(prev => {
        return {...prev, [trader]: value}
    })
  };

  const handleRate = (trader) => {
    const rate = allRates[trader];
    if ((rate < 1) || (rate > 5)) {
      alert("Rating out of range");
      return;
    }
    rateTrader(trader, rate)
  };

  useEffect(() => {
    loadRates();
  }, []);

  return (
    <>
      <div className="trader">
        <div className="trader-title">Traders</div>
        {traders.map((trader, index) => (
          <div className="trader-card">
            <div className="trader-icon">{identicon(trader.trader)}</div>
            <div className="trader-details">
              <div>Sold: {trader.sold}</div>
              <div>Rating: {Number(trader.rating / trader.rateCount || 0).toFixed(2)}</div>
            </div>
            <div className="trader-rate">
              <input
                name={`rate-${index}`}
                type="number"
                style={{ outline: "none" }}
                min={1}
                max={5}
                defaultValue={5}
                onChange={(e) =>
                  handleRateChange(e.target.value, trader.trader)
                }
              />
              <div className="rate-button" onClick={() => handleRate(trader.trader)}>
                Rate
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Traders;
