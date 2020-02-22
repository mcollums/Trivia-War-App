const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    questions: {type: Array, "default" : []}
  });

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;