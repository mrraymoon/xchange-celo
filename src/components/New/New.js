import React, { useState } from 'react'
import { Form, Button } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import "./New.css"

const New = ({ createItem }) => {
    const [itemName, setItemName] = useState()
    const [itemDescription, setItemDescription] = useState()
    const [itemImage, setItemImage] = useState()
    const [itemPrice, setItemPrice] = useState()

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (itemName && itemImage && itemDescription && itemPrice) {
            createItem(itemName, itemImage, itemDescription, itemPrice);
            setItemName();
            setItemDescription();
            setItemImage();
            setItemPrice();
        } else {
            alert("Please complete all fields before proceeding!");
            return;
        }
        
    }

    return (
        <div className='form-new'>
            <div className='form-form'>
                <Form onSubmit={(e) => handleSubmit(e)}>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Item Name</Form.Label>
                        <Form.Control type="text" onChange={(e) => setItemName(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                        <Form.Label>Image URL</Form.Label>
                        <Form.Control type="text" onChange={(e) => setItemImage(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea3">
                        <Form.Label>Item Description</Form.Label>
                        <Form.Control as="textarea" rows={3} onChange={(e) => setItemDescription(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput4">
                        <Form.Label>Price</Form.Label>
                        <Form.Control type="number" onChange={(e) => setItemPrice(e.target.value)} />
                    </Form.Group>
                    <Button variant="dark" type="button" onClick={() => navigate("/")}>
                        Close
                    </Button>
                    <Button variant="dark" type="submit">
                        Submit
                    </Button>
                </Form>
            </div>

        </div>
    )
}

export default New