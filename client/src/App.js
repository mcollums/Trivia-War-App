import React, { Component } from "react";
import socketAPI from './utils/socketAPI';
import NavBarCustom from "./components/Navbar";
import { Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.scss';

//Page imports and Router
import PlayNow from "./pages/PlayNow";
import Authentication from "./pages/Authentication";
import UserHome from "./pages/UserHome";
import MultiPlayerCat from "./pages/MultiPlayerCategory";
import GameContainer from "./pages/GameContainer";
import SingleGameContainer from "./pages/SP-game-cont";
import NoMatch from "./pages/NoMatch";
import SingleCategory from "./pages/SingleCategory";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";



class App extends Component {
  state = {
    userEmail: "",
    authorized: false,
    inGame: false
  }

  componentDidMount = () => {
    socketAPI.subscribeAuthorized((message) => {
      if (message === true) {
        this.setState({
          authorized: true
        })
      } else { console.log("State not updated") }
    })
  }

  publishLogin = (email) => {
    socketAPI.publishLogin(email);
  }

  render() {
    return (
      <Router>
        <div id="app-cont">
          <NavBarCustom />
          <Switch>
            <Route exact path="/" component={ Authentication } />
            <Route exact path="/home" component={() => <UserHome 
              publishLogin={ this.publishLogin } 
              authorized={ this.state.authorized } />} />
            <Route exact path="/play" component={ PlayNow } />
            <Route exact path="/game" component={ GameContainer } />
            <Route exact path="/singlegame" component={ SingleGameContainer } />
            <Route exact path="/multi" component={ MultiPlayerCat } />
            <Route exact path="/single" component={ SingleCategory } />
            <Route component={ NoMatch } />
          </Switch>
          <Navbar className="footer" sticky="bottom">
            <Navbar.Brand className="logo">Trivia War</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text>
                Built and Maintained by Michelle Collums
              </Navbar.Text>
            </Navbar.Collapse>
          </Navbar>
        </div>
      </Router>
    )
  }
}

export default App;




