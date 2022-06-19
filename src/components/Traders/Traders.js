import React, { useState } from 'react'
import { Header } from "../../components"
import "./Traders.css";

const Traders = () => {
    const [rate, setRate] = useState(5);

    const handleRateChange = (e) => {
        const {name, value} = e.target;
        console.log(name, value)
    }

    const handleRate = () => {
        if ((rate < 1) || (rate > 5)) {
            alert("Rate between 1 and 5");
            return;
        }
        console.log(rate)
    }

    return (
        <>
            <Header />
            <div className='trader'>
                <div className='trader-title'>Traders</div>
                {[1, 2, 3, 4, 5].map((item, index) => (
                    <div className='trader-card'>
                        <div className='trader-icon'>
                            <div className='icon'></div>
                        </div>
                        <div className='trader-details'>
                            <div>Sold: 99</div>
                            <div>Rating: 4.6</div>
                        </div>
                        <div className='trader-rate'>
                            <input name={`rate-${index}`} type="number" style={{ outline: "none" }} min={1} max={5} defaultValue={5} onChange={handleRateChange} />
                            <div className='rate-button' onClick={() => handleRate()}>Rate</div>
                        </div>
                    </div>
                ))}

            </div>
        </>

    )
}

export default Traders