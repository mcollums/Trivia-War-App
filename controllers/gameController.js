const db = require("../models");

module.exports = {
  findAllGames: function (req, res) {
    db.Game
      .find()
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  findGameById: function (req, res) {
    db.Game
      .findById(req.params.gameId)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  findSessionAndGameById: function (req, res) {
    var sessionGameData = {}

    this.findGameById(req.params.gameId)
      .then(gameObj => {
        sessionGameData.game = gameObj
        return Promise.resolve()
      })
      .then(() => db.Session.findById(req.params.sessionId))
      .then(sessionObj => {
        sessionGameData.session = sessionObj
        res.json(sessionGameData)
      })
      .catch(err => res.status(422).json(err));
  }
};