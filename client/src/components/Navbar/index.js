import React, { Component } from "react";
import './navStyle.scss';
//Component imports
import { Link } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap';
//API imports
import API from "../../utils/API.js";


class NavBarCustom extends Component {

  handleLogout = () => {
    API.logout().catch(err => console.log(err));
  }

  render() {
    return (
      <>
        <Navbar className="navbar-main pt-3 mx-5">
          <Nav className="mr-auto">
              <Nav.Link id="home-nav-link" href="/home">
                <Link to="/home" className="link">Home</Link>
              </Nav.Link>
              <Nav.Link id="logout-nav-link" eventKey="link-1">
                <Link to="/" className="link" onClick={this.handleLogout}>Logout</Link>
              </Nav.Link>
              <Nav.Link id="about-nav-link" eventKey="link-2">
                <Link to="/play" className="link">Play Now</Link>
              </Nav.Link>
          </Nav>
          <Navbar.Brand>
              <Link to="/home" className="link logo-link">
                Trivia War
              </Link>
          </Navbar.Brand>
        </Navbar>

        <hr className="nav-hr" />
      </>
    );
  }
}

export default NavBarCustom;
