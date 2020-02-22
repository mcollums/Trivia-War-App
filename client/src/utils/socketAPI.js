import openSocket from 'socket.io-client';

const socket = openSocket(process.env.REACT_APP_SOCKET_URL  || 'http://localhost:3001')

//As soon as a user connects, add them to the UsersArray
socket.on("message", message => console.log(message));
socket.on("addedEmail", message => console.log(message));

export default {
    subscribeTimer: (callback) => {
        socket.on("timer", time => callback(time));
    },
    //Authenticating User and Adding to playersArray in server
    publishLogin: userData => {
        socket.emit("setuser", userData);
    },
    subscribeAuthorized: callback => {
        socket.on("authorized", (message) => callback(message));
    },
    //When the user wants to join a game
    publishSeekGame: categoryId => {
        socket.emit("seekGame", categoryId);
    },
    //User is the only one in the session
    subscribeMatchmaking: (callback) => {
        socket.on("matchmaking", message => callback(message));
    },
    //When the game has two users...
    subscribeGameStart: (callback) => {
        socket.on("startGame", sessionId => callback(sessionId));
    },
    //When the Game Container Mounts...
    publishGCMount: () => { socket.emit('GCMount') },
    //Send back info about this session
    subscribeSessionInfo: (callback) => {
        socket.on('sessionInfo', sessionInfo => callback(sessionInfo));
    },
    publishStartGameTimer: () => {
        socket.emit('startTimer');
    },
    //when the player makes a choice...
    publishPlayerSelect: (result) => {
        socket.emit('playerChoice', result);
    },
    //server lets each player know if the other has selected an answer
    subscribeScoreUpdate: (callback) => {
        socket.on('scoreUpdate', message => callback(message));
    },
    subscribeNextQuestion: (callback) => {
        socket.on('nextQuestion', score => callback(score));
    },
    publishEndGame: (result) => {
        socket.emit('gameOver', result);
    },
    subscribeFinalScore: (callback) => {
        socket.on('finalScore', result => callback(result))
    },
    subscribeEndTimer: callback => {
        socket.on('timesUp', message => callback(message));
    },
    subscribeTimerDec: (callback) => {
        socket.on('timerDec', message => callback(message));
    },
    disconnect(){
        socket.disconnect()
    }
}