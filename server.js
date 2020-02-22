const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");
const app = express();
const PORT = process.env.PORT || 3001;
const passport = require('./config/passport.js')
// const { google } = require("googleapis")
const session = require('express-session')
const path = require("path");
const chalk = require('chalk');
const db = require("./models");


app.use(session({ secret: process.env.SESSION_SECRET || "the cat ate my keyboard", resave: true, saveUninitialized: true }))
app.use(passport.initialize());
app.use(passport.session());


let server = require('http').Server(app);
let io = require('socket.io')(server);

//OAuth
//============================================================================
// const googleConfig = {
//   clientId: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   redirect: process.env.GOOGLE_REDIRECT_URI
// }

// const defaultScope = [
//   'https://www.googleapis.com/auth/userinfo.email'
// ]

// function createConnection() {
//   return new google.auth.OAuth2(
//     googleConfig.clientId,
//     googleConfig.clientSecret,
//     googleConfig.redirect
//   )
// }
// function getConnectionUrl() {
//   return createConnection().generateAuthUrl({
//     access_type: 'offline',
//     prompt: 'consent',
//     scope: defaultScope
//   })
// }

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}
app.use(express.static("public"));

// Add routes, both API and view
app.use(routes);

// Connect to the Mongo DB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/trivia_masters");

//SOCKET AND GAME STATES START HERE
// ===========================================================================================
//Player Data on Server
const playerArr = [];

const makePlayer = (socket) => {
  console.log(chalk.blue("Making new player for: ", socket.id));
  return {
    id: socket.id,
    email: "",
    authorized: false,
    socket: socket
  }
}

//Session Data on Server
let sessionId = 1;
const sessions = [];

const makeSession = (id, creator, categoryId) => {
  return {
    id,
    categoryId: categoryId,
    playerOne: creator,
    playerTwo: null,
    playerOneSelect: false,
    playerTwoSelect: false,
    playerOneScore: 0,
    playerTwoScore: 0
  }
}


io.on('connection', function (player) {

  //Clears the internal
  const makeClearInterval = (countdown) => {
    return () => {
      clearInterval(countdown)
    }
  }
  let clearFn = () => {};

  //Keeps track of the game timing
  var startTimer = (s, duration) => {
    var timer = duration, minutes, seconds;

    var countdown = setInterval(function () {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      s.playerOne.socket.emit('timerDec', timer);
      s.playerTwo.socket.emit('timerDec', timer);

      if (--timer < 0) {
        timer = duration;
      } else if (timer === 0) {
        s.playerOne.socket.emit('timesUp');
        s.playerTwo.socket.emit('timesUp');
        clearInterval(countdown);
      }
    }, 1000);

    player.off('playerChoice', clearFn);
    player.off('gameOver', clearFn);
    clearFn = makeClearInterval(countdown);
    player.on('playerChoice', clearFn);
    player.on('gameOver', clearFn);
  }

  //On connection, create a new player and add 
  const newPlayer = makePlayer(player);
  playerArr.push(newPlayer)

  //Tell all the other sockets that there's a new player
  playerArr.filter(p => p.id !== newPlayer.id).forEach(p => {
    p.socket.emit("message", "somebody else connected")
  });

  //When the user disconnects, remove them from the array
  player.on('disconnect', () => {
    console.log("Player " + player.id + "is disconnecting");
    const index = playerArr.findIndex(p => p.id === player.id);
    // Look for any games they are a part of and kill them
    playerArr.splice(index, 1);
  })

  //Add users email to their socket when they login
  player.on("setuser", (data) => {
    console.log('==================================================================');
    // console.log(chalk.green("Data from Server's SetUser ", JSON.stringify(data)));
    const index = playerArr.find(p => p.id === player.id);

    if (index) {
      // console.log("User found in playersArr, adding email:", data);
      index.email = data;
      index.authorized = true;
      index.socket.emit("addedEmail", "We added your email to your user ID");
      index.socket.emit('authorized', true);
    } else {
      console.log(chalk.red("User not found"));
    }
  });

  //User can find or create a session
  player.on("seekGame", (categoryId) => {

    let p1Info = {};
    let p2Info = {};

    // Try and find them a game, if we can, great!
    // Otherwise just make a new one and put them in it
    if (sessions.length === 0) {
      //If there are no Sessions, make your own
      sessions.push(makeSession(sessionId++, newPlayer, categoryId));
      //Let P1 know we're matching them soon
      newPlayer.socket.emit("matchmaking", "Server says: 'You've created a game. Waiting for another player to join.'");
    } else {
      // Look for a game without a playerTwo...
      const s = sessions.find(s => s.playerTwo === null && categoryId === s.categoryId);
      if (s) {
        //Add this player as the session's player 2
        s.playerTwo = newPlayer;

        //Finish filling out the objects to be sent back to the page
        p1Info.position = "p1";
        p1Info.opponent = s.playerTwo.email;
        p1Info.sessionId = s.id;
        p2Info.position = "p2";
        p2Info.opponent = s.playerOne.email;
        p2Info.sessionId = s.id;

        //Send each player info about the game
        s.playerOne.socket.emit("startGame", p1Info);
        s.playerTwo.socket.emit("startGame", p2Info);

      } else {
        //If there are no games to join, make your own
        sessions.push(makeSession(sessionId++, newPlayer, categoryId));
        //Tell P1 that we're matching them soon
        newPlayer.socket.emit("matchmaking", "Server says: 'You've created a game. Waiting for another player to join.'");
      }
    }
  });

  //This sends the session info to the game container so both users have 
  //their positions and the gameId to load questions
  player.on('GCMount', () => {
    const s = sessions.find((s) => (s.playerOne.id === newPlayer.id || s.playerTwo.id === newPlayer.id))
    if (s) {
      //info needed for the session
      let sessionInfo = {
        categoryId: s.categoryId,
        playerOne: s.playerOne.email,
        playerTwo: s.playerTwo.email
      };
      //Send to both users
      s.playerOne.socket.emit("sessionInfo", sessionInfo);
      s.playerTwo.socket.emit("sessionInfo", sessionInfo);

      //Start timer
      startTimer(s, 20);
    }
  });

  //This function happens when the player chooses an answer in game...
  player.on('playerChoice', result => {
    //Find this user's session...
    const s = sessions.find((s) => (s.playerOne.id === newPlayer.id || s.playerTwo.id === newPlayer.id))
    if (s) {
      // console.log("Session Found! This player is in the session # " + s.id);

      //If this user is P1 and the answer is correct, update score
      //Also, update the session to mark that they've chosen an answer
      if (newPlayer.email === s.playerOne.email) {
        s.playerOneSelect = true;
        if (result === "correct") {
          s.playerOneScore++
        }
        console.log("Player One Selected an Answer");

        //If this user is P2 and the answer is correct, update score
        //Also, update the session to mark that they've chosen an answer
      } else if (newPlayer.email === s.playerTwo.email) {
        s.playerTwoSelect = true;
        if (result === "correct") {
          s.playerTwoScore++
        }
        console.log("Player Two Selected an Answer");
      }

      //If either player hasn't selected an answer...
      if (s.playerOneSelect === false || s.playerTwoSelect === false) {
        //If P1 has chosen, let them know. Also let P2 know.
        if (s.playerOneSelect === true) {
          s.playerOne.socket.emit('scoreUpdate', "You've Selected an Answer");
          s.playerTwo.socket.emit('scoreUpdate', "Your Opponent has Selected their Answer");

          //If P2 has chosen, let them know. Also let P1 know.
        } else if (s.playerTwoSelect === true) {
          s.playerTwo.socket.emit('scoreUpdate', "You've Selected an Answer");
          s.playerOne.socket.emit('scoreUpdate', "Your Opponent has Selected their Answer");
        }
        //If both users have answered...
      } else if (s.playerOneSelect === true && s.playerTwoSelect === true) {
        console.log("Both users have answered");
        //Reset Session State for next question
        s.playerOneSelect = false;
        s.playerTwoSelect = false;

        //Creating Object to send back with new scores
        let updatedScore = {
          playerOne: s.playerOneScore,
          playerTwo: s.playerTwoScore
        }

        //Let both players know the current score
        s.playerOne.socket.emit('nextQuestion', updatedScore);
        s.playerTwo.socket.emit('nextQuestion', updatedScore);

        //restart timer
        // startTimer(s, 10);
      }
    } else {
      console.log("No session found");
    }
  });

  //Start timer
  player.on("startTimer", () => {
    const s = sessions.find((s) => (s.playerOne.id === newPlayer.id || s.playerTwo.id === newPlayer.id))
    if (s) {
      //restart time
      startTimer(s, 15);
    }
  })

  //When the game has finished...
  player.on('gameOver', result => {
    //Find that user's session...
    const s = sessions.find((s) => (s.playerOne.email === newPlayer.email || s.playerTwo.email === newPlayer.email));
    if (s) {
      //Grab info from the session
      let finalScore = {
        p1Score: s.playerOneScore,
        p2Score: s.playerTwoScore,
        winner: ""
      }
      //Determin winner, loser or tie
      if (s.playerOneScore === s.playerTwoScore) {
        finalScore.winner = "tie"
      } else if (s.playerOneScore > s.playerTwoScore) {
        finalScore.winner = s.playerOne.email;
      } else if (s.playerOneScore < s.playerTwoScore) {
        finalScore.winner = s.playerTwo.email
      }
      // console.log(chalk.red("FINAL SCORE: " + JSON.stringify(finalScore)));
      //Send info back to each player
      s.playerOne.socket.emit('finalScore', finalScore);
      s.playerTwo.socket.emit('finalScore', finalScore);

      const index = sessions.findIndex(index => (index.playerOne.email === newPlayer.email || index.playerTwo.email === newPlayer.email));
      // remove session once finished
      sessions.splice(index, 1);
    }
  });
});


// ROUTES FOR GOOGLE AUTHENTICATION
//=======================================================================
// app.get('/api/google/url', (req, res) => {
//   res.json({ url: getConnectionUrl() })
// })

// function getGoogleAccountFromCode(code) {
//   // console.log("CODE");
//   // console.log(code);
//   return createConnection().getToken(code).then(data => {
//     // console.log("DATA");
//     // console.log(data.tokens)
//     return Promise.resolve(data.tokens)
//   })
// }

// app.post('/api/google/code', (req, res) => {
//   const { code } = req.body;
//   getGoogleAccountFromCode(code).then(tokens => {
//     console.log(tokens)
//     const userConnection = createConnection()
//     userConnection.setCredentials(tokens)
//     userConnection.getTokenInfo(tokens.access_token).then(data => {
//       // console.log("TOKEN INFO");
//       // console.log(data);
//       const { email, sub } = data;

//       db.User.findOne({ email }).then(dbUser => {
//         if (!dbUser) {
//           // create a new user!
//           db.User.create({
//             email,
//             authType: "google",
//             googleId: sub
//           }).then(finalDbUser => {
//             req.login(finalDbUser, () => {
//               res.json(true)
//             })
//           }).catch(err => {
//             console.log(err)
//             res.sendStatus(500)
//           })

//         } else {
//           // Check the type and googleId
//           // if it matches, great! Login the user!
//           // if not, something odd is up, reject it
//           // console.log(dbUser);
//           if (dbUser.authType === "google" && dbUser.googleId === sub + "") {
//             req.login(dbUser, () => {
//               res.json(true)
//             });

//           } else {
//             res.sendStatus(500)
//           }
//         }
//       })

//     }).catch(() => {
//       res.sendStatus(500)
//     })
//   })
// })

// app.get('/api/google/callback', function (req, res) {
//   const code = req.query.code
//   getGoogleAccountFromCode(code).then(tokens => {
//     const userConnection = createConnection()
//     userConnection.setCredentials(tokens)
//     userConnection.getTokenInfo(tokens.access_token).then(data => {
//       const { email, sub } = data;
//       db.User.findOne({ email }).then(dbUser => {
//         // console.log(dbUser);
//         if (!dbUser) {
//           // console.log("NEW USER");
//           // create a new user!
//           db.User.create({
//             email,
//             authType: "google",
//             googleId: sub
//           }).then(finalDbUser => {
//             req.login(finalDbUser, () => {
//               res.redirect(process.env.NODE_ENV === "production" ? "/" : "http://localhost:3000/");
//             })
//           }).catch(err => {
//             console.log(err)
//             res.sendStatus(500)
//           })

//         } else {
//           if (dbUser.authType === "google" && dbUser.googleId === sub + "") {
//             req.login(dbUser, () => {
//               res.redirect(process.env.NODE_ENV === "production" ? "/" : "http://localhost:3000/");
//             })
//           } else {
//             res.sendStatus(500)
//           }
//         }
//       }).catch(err => console.log(err))

//     }).catch(err => {
//       console.log(err)
//       res.sendStatus(500)
//     })
//   })
// })

// Start the API server
server.listen(PORT, function () {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});

//Make sure Mongoose connection is disconnected
process.on('SIGINT', () => {
  mongoose.connection.close().then(() => {
    console.log("Mongoose disconnected");
    process.exit(0);
  })
})


