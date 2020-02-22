import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import API from "../utils/API";
import MPGameCard from "../components/MPGameCard";
import GameCol from "../components//GameCol";
import { Col, Row, Container } from "../components/Grid";
import Jumbotron from "../components/Jumbotron";
import socketAPI from "../utils/socketAPI";


//this holds all questions for the game to cycle through
let quizQuestions = [];

class GameContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            position: "",
            userInfo: "",
            title: "",
            category: "",
            question: "",
            questionCount: 0,
            answers: [],
            correctAnswer: "",
            correct: 0,
            userSelect: "",
            message: "",
            index: 0,
            timer: 15,
            gameOver: false,
            oppCorrect: 0,
            oppEmail: "",
            oppInfo: "",
            redirectTo: null,
            introShow: true
        };

        this.publishPlayerSelect = this.publishPlayerSelect.bind(this)
        this.startIntroTimer = this.startIntroTimer.bind(this);
        this.startEndTimer = this.startIntroTimer.bind(this);
    }


    componentDidMount() {
        API.checkAuth()
            .then(response => {
                // this runs if the user is logged in
                this.setState({ userInfo: response.data }, () => {
                    setTimeout(() => {
                        socketAPI.publishGCMount();
                    }, 500);
                });
                //Grab the session info from the server
                //Then set the state with the session info
                socketAPI.subscribeSessionInfo((info) => {
                    console.log("Subcribe Session Info" + JSON.stringify(info));
                    let userPosition = "";
                    let oppInfo = "";

                    if (this.state.userInfo.email === info.playerOne) {
                        userPosition = "p1";
                        oppInfo = info.playerTwo;
                    } else if (this.state.userInfo.email === info.playerTwo) {
                        userPosition = "p2";
                        oppInfo = info.playerOne;
                    }

                    this.setState({
                        category: info.categoryId,
                        position: userPosition,
                        oppEmail: oppInfo
                    }, () => {
                        API.getUserByEmail(this.state.oppEmail)
                            .then(res => {
                                this.getGame(this.state.category);
                                this.setState({
                                    oppInfo: res.data
                                }, () => {
                                    console.log("OPPONENT: " + JSON.stringify(this.state.oppInfo));
                                })
                            })
                            .catch(err => {
                                console.log(err);
                            })
                    })
                });
            }).catch(err => {
                // this runs if the uer is NOT logged in
                this.setState({ redirectTo: "/" })
            });

        this.startIntroTimer();

        socketAPI.subscribeTimerDec((timer) => {
            // console.log("Timer" + timer);
            this.setState({
                timer: timer
            })
        });

        socketAPI.subscribeEndTimer((message) => {
            console.log("Time's Up!");
            // if(this.state.userSelect = "") {
            //     // socketAPI.publishNoChoiceSelected();
            // }
            this.setState({
                message: ""
            })
            this.setUserAnswer((result) => {
                socketAPI.publishPlayerSelect(result);
            });
        });

        //Setting up Socket Listeners for Game:
        //Message comes back after either user selects an answer
        socketAPI.subscribeScoreUpdate((message) => {
            // console.log(message);
            this.setState({
                message: message
            }, () => { console.log("State Message " + this.state.message) })
        });

        //Score comes back when both players have selected an ansnwer
        //Also updates to the next question
        socketAPI.subscribeNextQuestion((score) => {
            // console.log("New Score = " + JSON.stringify(score));
            if (this.state.position === "p1") {
                this.setState({
                    correct: score.playerOne,
                    oppCorrect: score.playerTwo
                })
            } else if (this.state.position === "p2") {
                this.setState({
                    correct: score.playerTwo,
                    oppCorrect: score.playerOne
                })
            }
            //This variable is checking to see what the next index value will be
            let nextIndex = (this.state.index + 1);

            // if the next index value is equal to the total amount of questions 
            // then stop the game otherwise, keep going
            if (nextIndex === this.state.questionCount) {
                this.endGame();
            } else {
                this.setNextQuestion();
            }

            socketAPI.publishStartGameTimer();
        });

        socketAPI.subscribeFinalScore((score) => {
            console.log("Final Score from Server " + JSON.stringify(score));
            // console.log("User ID in state: " + this.state.userInfo.email);
            let userResult = "";
            if (score.winner === "tie") {
                userResult = "totalWins"
            } else if (score.winner === this.state.userInfo.email) {
                userResult = "totalWins";
            } else if (score.winner !== this.state.userInfo.email) {
                userResult = "totalLosses";
            }
            // console.log("User result " + userResult);
            let obj = {}
            obj[userResult] = true;

            setTimeout(() => {
                API.updateUserScore(this.state.userInfo.id, obj)
                    .then(res => {
                        // console.log(res);
                        this.setState({
                            gameOver: true
                        })
                        this.startEndTimer();
                    })
            }, 500);

            // API.updateUserScore(this.state.userInfo.id, obj)
            //     .then(res => {
            //         // console.log(res);
            //         this.setState({
            //             gameOver: true
            //         })
            //         this.startEndTimer();
            //     })
            // this.setState({ redirectTo: "/home" });
        })
    }

    startIntroTimer = () => {
        setTimeout(() => {
            this.setState({
                introShow: false
            })
        }, 6000);
    }

    startEndTimer = () => {
        setTimeout(() => {
            console.log("Start End Timer");
            this.setState({
                gameOver: false
            }, () => {
                this.setState({ redirectTo: "/home" });
            })
        }, 6000);
    }

    //Getting the game information from the Database based on the game's ID
    //Then updating the state
    getGame(gameId) {
        API.getOneGame(gameId)
            .then(res => {
                //quiz Questions will be held outside the component 
                //so we can go through the questions/answers with an index value
                quizQuestions = res.data;
                // console.log("Quiz Questions" + JSON.stringify(quizQuestions));

                this.setQuestionState(res.data);
            });
    }

    shuffleQuestions(array) {
        var currentIndex = array.length;
        var temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    // Setting the state of the game
    setQuestionState(data) {
        let index = this.state.index;
        let allAnswers = data.questions[index].answers.answersObject;
        //push correct answer
        allAnswers.push(data.questions[index].correctAnswer);
        //Shuffle all questions
        let shuffledArr = this.shuffleQuestions(allAnswers);

        this.setState({
            title: data.title,
            category: data.category,
            question: data.questions[index].question,
            answers: shuffledArr,
            correctAnswer: data.questions[index].correctAnswer,
            questionCount: data.questions.length
        }, () => {
            // console.log("STATE" + JSON.stringify(this.state.answers));
            // console.log("QUIZ QUESTIONS " + JSON.stringify(quizQuestions));
        });
    }

    //Click Handler
    publishPlayerSelect(selection) {
        console.log("User Selected: " + selection);
        this.setState({
            userSelect: selection
        }, () => {
            //putting this in a callback so we're sure the state has been updated
            //before setUserAnswer is called
            this.setUserAnswer((result) => {
                // console.log("User is " + result);
                socketAPI.publishPlayerSelect(result);
            });
        })
    };


    //This method checks if the user answer is correct and checks if the
    // game continues or not based on if there are any questions left
    setUserAnswer = (callback) => {
        let userAnswerResult = "";

        //if the user didn't select an answer add to incorrect
        if (this.state.userSelect === "") {
            userAnswerResult = "incorrect";

            //if the user selected the correct answer, add to correct
        } else if (this.state.userSelect === this.state.correctAnswer) {
            userAnswerResult = "correct"

            //if the user selected the incorrect answer, add to incorrect
        } else if (this.state.userSelect !== this.state.correctAnswer) {
            userAnswerResult = "incorrect";
        }

        // console.log("User answer result = " + userAnswerResult);
        callback(userAnswerResult);
        this.setState({
            userSelect: ""
        })
        userAnswerResult = "";
    }

    setNextQuestion = () => {
        let newIndex = this.state.index + 1;
        let allAnswers = quizQuestions.questions[newIndex].answers.answersObject;
        //push correct answer
        allAnswers.push(quizQuestions.questions[newIndex].correctAnswer);
        // console.log("All answers" + allAnswers);
        //push incorrect answers
        let shuffledArr = this.shuffleQuestions(allAnswers);

        this.setState({
            index: newIndex,
            timer: 15,
            question: quizQuestions.questions[newIndex].question,
            answers: shuffledArr,
            correctAnswer: quizQuestions.questions[newIndex].correctAnswer,
            userSelect: "",
            message: ""
        }, function () {
            // console.log(this.state);
        });
    }

    endGame = () => {
        console.log("GAME OVER");
        this.setState({
            gameOver: true,
        }, () => {
            if (this.state.position === "p1") {
                console.log("Player One sending Game Data to server");
                setTimeout(() => {
                    socketAPI.publishEndGame();
                }, 500);
            } else {
                console.log("Player 2 waiting on score");
            }
        })
    }


    render() {
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        if (this.state.introShow === true) {
            return (
                <Container fluid="-fluid">
                    <Row>
                        <Col size="12" id="titleCol">
                            <h5 style={{ color: "white", marginTop: "100px", fontSize: "30px" }}
                                className="text-center"> {this.state.title} </h5>
                        </Col>
                    </Row>
                    <Row>

                        <GameCol size="12">
                            <Jumbotron jumboWidth="800px" className="userData text-center" jumboHeight="80%">
                                <h2>Get Ready for Trivia!</h2>
                                <h5>Instructions:</h5>
                                <p> Both players will have 15 seconds to answer each of the 10 questions. Don't let time run out or
                                    your round will be counted as incorrect. If both users answer before the timer ends
                                    the next question will automatically appear, so be ready!
                                </p>
                            </Jumbotron>
                        </GameCol>

                    </Row>
                    <Row>
                        <Col size="4" id="player1">
                            <h5 style={{ marginTop: "15px", color: "white" }}>{this.state.userInfo.name}</h5>
                            <img style={{ marginTop: "10px", width: "100px", height: "100px", backgroundColor: "white", borderRadius: "50%" }} alt={"player1"} src={this.state.userInfo.picLink} />
                            <h5 style={{ color: "white", marginTop: "8px" }}>Score: {this.state.correct}</h5>
                        </Col>
                        <Col size="4" id="message">
                            <h5 style={{ color: "white", marginTop: "30px" }}> {this.state.message} </h5>
                        </Col>
                        <Col size="4" id="player2">
                            <h5 style={{ marginTop: "15px", color: "white" }}>{this.state.oppInfo.username}</h5>
                            <img style={{ marginTop: "10px", width: "100px", height: "100px", backgroundColor: "white", borderRadius: "50%" }} alt={"player1"} src={this.state.oppInfo.picLink} />
                            <h5 style={{ color: "white", marginTop: "8px" }}> Score {this.state.oppCorrect} </h5>
                        </Col>
                    </Row>
                </Container>
            )
        }
        else if (this.state.gameOver === false && this.state.introShow === false) {

            return (
                <div>
                    <Container fluid="-fluid">
                        <Row>
                            <Col size="12" id="titleCol">
                                <h5 style={{ color: "white", marginTop: "100px", fontSize: "30px" }}
                                    className="text-center"> {this.state.title} </h5>
                            </Col>
                        </Row>
                        <Row>

                            <GameCol size="12">
                                <Jumbotron jumboWidth="800px" className="userData" jumboHeight="80%">
                                    <h2>{this.state.question}</h2>
                                    <h4>Tick Tock <strong>{this.state.timer}s</strong> left</h4>
                                    {this.state.answers.map(answer => (
                                        <MPGameCard
                                            className="box"
                                            id={answer}
                                            key={answer}
                                            publishPlayerSelect={this.publishPlayerSelect}
                                        />
                                    ))}
                                </Jumbotron>
                            </GameCol>

                        </Row>
                        <Row>
                            <Col size="4" id="player1">
                                <h5 style={{ marginTop: "15px", color: "white" }}>{this.state.userInfo.name}</h5>
                                <img style={{ marginTop: "10px", width: "100px", height: "100px", backgroundColor: "white", borderRadius: "50%" }} alt={"player1"} src={this.state.userInfo.picLink} />
                                <h5 style={{ color: "white", marginTop: "8px" }}>Score: {this.state.correct}</h5>
                            </Col>
                            <Col size="4" id="message">
                                <h5 style={{ color: "white", marginTop: "30px" }}> {this.state.message} </h5>
                            </Col>
                            <Col size="4" id="player2">
                                <h5 style={{ marginTop: "15px", color: "white" }}>{this.state.oppInfo.username}</h5>
                                <img style={{ marginTop: "10px", width: "100px", height: "100px", backgroundColor: "white", borderRadius: "50%" }} alt={"player1"} src={this.state.oppInfo.picLink} />
                                <h5 style={{ color: "white", marginTop: "8px" }}> Score {this.state.oppCorrect} </h5>
                            </Col>
                        </Row>
                    </Container>
                </div>
            )
        }
        else if (this.state.gameOver === true) {
            return (
                <Container fluid="-fluid">
                    <Row>
                        <Col size="12" id="titleCol">
                            <h5 style={{ color: "white", marginTop: "100px", fontSize: "30px" }}
                                className="text-center"> {this.state.title} </h5>
                        </Col>
                    </Row>
                    <Row>

                        <GameCol size="12">
                            <Jumbotron jumboWidth="800px" className="userData text-center" jumboHeight="80%">
                                <h2>Final Score</h2>
                                <Row>
                                    <Col size="6">
                                        <h5>{this.state.userInfo.name}'s Score: </h5>
                                        <h5>{this.state.correct}</h5>
                                    </Col>
                                    <Col size="6">
                                        <h5>{this.state.oppInfo.username}'s Score: </h5>
                                        <h5>{this.state.oppCorrect}</h5>
                                    </Col>
                                </Row>
                            </Jumbotron>
                        </GameCol>

                    </Row>
                    <Row>
                        <Col size="4" id="player1">
                            <h5 style={{ marginTop: "15px", color: "white" }}>{this.state.userInfo.name}</h5>
                            <img style={{ marginTop: "10px", width: "100px", height: "100px", backgroundColor: "white", borderRadius: "50%" }} alt={"player1"} src={this.state.userInfo.picLink} />
                            <h5 style={{ color: "white", marginTop: "8px" }}>Score: {this.state.correct}</h5>
                        </Col>
                        <Col size="4" id="message">
                            <h5 style={{ color: "white", marginTop: "30px" }}> {this.state.message} </h5>
                        </Col>
                        <Col size="4" id="player2">
                            <h5 style={{ marginTop: "15px", color: "white" }}>{this.state.oppInfo.username}</h5>
                            <img style={{ marginTop: "10px", width: "100px", height: "100px", backgroundColor: "white", borderRadius: "50%" }} alt={"player1"} src={this.state.oppInfo.picLink} />
                            <h5 style={{ color: "white", marginTop: "8px" }}> Score {this.state.oppCorrect} </h5>
                        </Col>
                    </Row>
                </Container>
            )
        }
    }

}

export default GameContainer