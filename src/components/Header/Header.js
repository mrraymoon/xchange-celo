import React from "react";
import {
  Navbar,
  Nav,
  Form,
  FormControl,
  Button,
  Container,
} from "react-bootstrap";
import { Link } from "react-router-dom";

const Header = ({ balance }) => {
  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container fluid>
          <Navbar.Brand href="#">XChange</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: "100px" }}
              navbarScrollx
            >
              <Nav.Link>
                <Link style={{ textDecoration: "none" }} to="/">
                  Home
                </Link>
              </Nav.Link>
              <Nav.Link>
                <Link style={{ textDecoration: "none" }} to="/new">
                  New
                </Link>
              </Nav.Link>
              <Nav.Link>
                <Link style={{ textDecoration: "none" }} to="/traders">
                  Traders
                </Link>
              </Nav.Link>
            </Nav>
            <Button variant="dark">{balance} cUSD</Button>
            <Form className="d-flex">
              <FormControl
                type="search"
                placeholder="Search"
                className="me-2"
                aria-label="Search"
              />
              <Button variant="outline-success">Search</Button>
            </Form>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Header;
