import React, { Component } from "react";
import { withRouter, Redirect } from "react-router-dom";
import API from "../utils/API"

import '../styles/UserHome.scss'
import { Container, Row, Col, Button, Jumbotron } from 'react-bootstrap';
import Leaderboard from "../components/Leaderboard"

class UserHome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            userInfo: {},
            redirectTo: null,
            userInfoFromDB: {},
            ranking: ""
        };
    }

    componentDidMount() {
        this.loadUserData();
    }

    loadUserById() {
        const id = this.state.userInfo.id
        API.getOneUser(id)
            .then(res => {
                this.setState({
                    userInfoFromDB: res.data,
                })
            })
            .catch(err => console.log(err));
    }

    loadUserData() {
        API.checkAuth()
            .then(response => {
                // this runs if the user is logged in
                this.setState({
                    userInfo: response.data
                },
                    this.loadUsers
                );
                this.loadUserById();
            })
            .catch(err => {
                // this runs if the user is NOT logged in
                this.setState({ redirectTo: "/" })
            })
    }

    loadUsers() {
        API.getUsers()
            .then(res => {
                this.setState({
                    users: res.data,
                },
                    this.findRanking)
            })
            .catch(err => console.log(err));
    }

    findRanking = () => {
        let ranking = 0;
        let allUsers = this.state.users;
        for (let i = 0; i < allUsers.length; i++) {
            if (allUsers[i]._id === this.state.userInfo.id) {
                ranking = (i + 1);
                break;
            }
        }
        this.setState({
            ranking: ranking
        })
    }

    handlePlayNowBtn = () => {
        let path = "/play";
        this.props.history.push(path);
    }

    render() {
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        return (
            <>
                <Container id="userHome-cont" className="my-5">
                    <Row className="my-5">
                        <Col id="user-col">
                            <h2>Welcome, {this.state.userInfoFromDB.username}!</h2>
                            <Row id="user-info-row" className="d-flex justify-content-around">
                                <Col md="4">
                                    <img
                                        alt={"user's profile image"}
                                        src={this.state.userInfoFromDB.picLink} />
                                </Col>
                                <Col md="4">
                                    <h5><strong>Name: </strong> {this.state.userInfoFromDB.username}</h5>
                                    <h5><strong>Wins:</strong> {this.state.userInfoFromDB.totalWins}</h5>
                                    <h5><strong>Losses:</strong> {this.state.userInfoFromDB.totalLosses}</h5>
                                    <h5><strong>Ranking:</strong> {this.state.ranking}</h5>
                                    <Button variant="info" 
                                            className="btn-custom-primary"
                                            onClick={() => this.handlePlayNowBtn()}>
                                            Play New Game
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                        <Col id="mess-col">
                            {/* TODO: Add route that gets most recent message from the user to the database */}
                            <h2>Messages: </h2>
                            <p>
                                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cumque sint nisi nesciunt dolorem qui similique quidem amet tempore maiores incidunt asperiores fugiat eligendi nobis atque ex nostrum, facilis, consequatur repellendus.
                            </p>
                        </Col>
                    </Row>
                    <Row id="user-message-row">
                        <Col md="4">
                            {/* TODO: Route to retrieve the topscore for users in MP and SP */}
                            <h1>Highscores</h1>
                            <p>
                                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cumque sint nisi nesciunt dolorem qui similique quidem amet tempore maiores incidunt asperiores fugiat eligendi nobis atque ex nostrum, facilis, consequatur repellendus.
                            </p>
                        </Col>
                        <Col md="4">
                            {/* TODO: Route to retrieve previous match info */}
                            <h1>Previous Game</h1>
                            <p>
                                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cumque sint nisi nesciunt dolorem qui similique quidem amet tempore maiores incidunt asperiores fugiat eligendi nobis atque ex nostrum, facilis, consequatur repellendus.
                            </p>
                        </Col>
                        <Col md="4">
                            {/* TBD */}
                            <h1>Info</h1>
                            <p>
                                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cumque sint nisi nesciunt dolorem qui similique quidem amet tempore maiores incidunt asperiores fugiat eligendi nobis atque ex nostrum, facilis, consequatur repellendus.
                            </p>
                        </Col>

                    </Row>
                    <Row id="user-lb-row">
                        <Col>
                            <Jumbotron id="userHome-leaderboard" className="leaderboard-jumbo">
                                <Leaderboard
                                    leaders={this.state.users}
                                />
                            </Jumbotron>
                        </Col>
                    </Row>
                </Container>
            </>
        )
    }
}

export default withRouter(UserHome);
