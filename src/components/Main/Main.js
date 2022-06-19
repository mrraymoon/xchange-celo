import React from 'react'
import "./Main.css";

const Main = () => {
  const nft = {
    index: 0,
    name: "Alaf OP",
    owner: "0x0000000",
    image: "https://static.vecteezy.com/packs/media/components/global/search-explore-nav/img/vectors/term-bg-1-666de2d941529c25aa511dc18d727160.jpg",
    description: "First market item. This is the first item of it's kind in the market",
    price: 99
  }
  const { image, description, owner, name, index, price } = nft;
  return (
    <div className='main'>
      {[1, 2, 3, 4, 5, 6, 7].map(item => (<div className='item-card'>
        <div className='card-price'>${price}</div>
        <img className='card-img' src={image} alt={name} />
        <div className='card-description'>{description}</div>
        <div className='buy'>Buy</div>
        <div></div>
      </div>)
      )}

    </div>
  )
}

export default Main