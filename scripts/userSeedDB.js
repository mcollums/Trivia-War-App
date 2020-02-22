const mongoose = require("mongoose");
const db = require("../models");

// This file empties the Books collection and inserts the books below

mongoose.connect(
  process.env.MONGODB_URI ||
  "mongodb://localhost/trivia_masters"
);

const userSeed = [
  {
    username: "Robert",
    email: "robert@email.com",
    password: "rob",
    picLink: "https://placehold.it/200x200",
    totalWins: 1502,
    totalLosses: 0
  },
  {
    username: "Joel",
    email: "joel@email.com",
    password: "joel",
    picLink: "https://placehold.it/200x200",
    totalWins: 3,
    totalLosses: 2
  },
  {
    username: "Michelle",
    email: "michelle@email.com",
    password: "michelle",
    picLink: "https://placehold.it/200x200",
    totalWins: 0,
    totalLosses: 1502
  },
  {
    username: "Trihn",
    email: "trihn@email.com",
    password: "trihn",
    picLink: "https://placehold.it/200x200",
    totalWins: 6,
    totalLosses: 2
  },
  {
    username: "Jyoti",
    email: "jyoti@email.com",
    password: "jyoti",
    picLink: "https://placehold.it/200x200",
    totalWins: 9,
    totalLosses: 1
  }
];

db.User
  .remove({})
  .then(() => db.User.collection.insertMany(userSeed))
  .then(data => {
    console.log(data.result.n + " records inserted!");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
