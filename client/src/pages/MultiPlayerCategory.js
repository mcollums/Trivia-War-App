import React, { Component } from "react";
import { Redirect, withRouter } from "react-router-dom";
import socketAPI from "../utils/socketAPI";
import API from "../utils/API";
import MPCategory from "../components/MPCategory";


class MultiPlayer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            category: [],
            selected: "",
            position: "",
            gameStart: false,
            matchmakingOpen: false,
        }
        this.handleCatSelect = this.handleCatSelect.bind(this);
    }

    componentDidMount() {
        //Get all the games from the database
        API.getGames().then(res => {
            this.setState({
                category: res.data
            })
        });

        //Listens for matchmaking message from the server
        socketAPI.subscribeMatchmaking((message) => {
            //function that shows matchmaking modal
            this.setState({ matchmakingOpen: true });
        });

        //Listens for the gameStart information from the server
        //this will happen when two users have joined the session
        socketAPI.subscribeGameStart((info) => {
            this.setState({ 
                matchmakingOpen: false 
            }, () => this.props.history.push('/game'));
        });
    }

    //called by handleCatSelect and sernds info to server
    publishSeekGame = (category) => {
        socketAPI.publishSeekGame(category);
    }

    //Click handler for the game id
    handleCatSelect = (id) => {
        this.publishSeekGame(id);
    }

    render() {
        if (this.state.matchmakingOpen) {
            return (
                <div className="circlecontainer">
                    <div className="lds-circle"><div>
                    </div><h5 className="match">Looking for a match...</h5></div>
                </div>
            );
        }
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        return (
            <div>
                <div className="scatContain">
                    {this.state.category.map(category => (
                        <MPCategory
                            id={category._id}
                            key={category._id}
                            category={category.category}
                            image={category.image}
                            handleSelect={this.handleCatSelect}
                        />
                    ))}
                </div>
            </div>
        )
    };
}


export default withRouter(MultiPlayer);