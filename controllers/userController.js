const db = require("../models");

module.exports = {
  //TODO Check if these are working
  findAll: function (req, res) {
    db.User
      .find(req.query).sort({ totalWins: -1 })
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  findById: function (req, res) {
    db.User
      .findById(req.params.id)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  findOneByEmail: function (req, res) {
    db.User
      .findOne({ email: req.params.email })
      .then((dbModel, err) => {
        if (err) {
          console.log("Error" + err);
        }
        res.json(dbModel)
      })
      .catch(err => res.status(422).json(err));
  },
  updateOne: function (req, res) {
    // console.log("wins", req.body.wins);
    // console.log("looses", req.body.losses);
    // console.log("id", req.body.id);
    db.User.findOneAndUpdate({ _id: req.body.id }, {
      totalWins: req.body.wins, totalLosses: req.body.losses
    }, { new: true }).then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));

  },
  updateUserScore: function (req, res) {
    db.User
      .findById(req.params.id)
      .then((user) => {
        if (!user) { return new Error('Could not find document') }
        else {
          // console.log(req.body);
          if (req.body.totalWins) {
            user.totalWins = user.totalWins + 1
          } else if (req.body.totalLosses) {
            user.totalLosses = user.totalLosses + 1
          }
          user.save().then(dbUser => {
            req.login(dbUser, () => {
              res.json(dbUser);
            });
          });
        }
      })
      .catch(err => res.status(422).json(err));
  },
  addwinScore: function (req, res) {
    db.User
      .findOne({ _id: req.params.id })
      .then(function (user) {
        return db.User
          .update({ _id: req.params.id }, { totalWins: user.totalWins + 1 });
      })
      .then(function () {
        res.send(true);
      })
      .catch(err => console.log(err));
  },
  addlossScore: function (req, res) {
    db.User
      .findOne({ _id: req.params.id })
      .then(function (user) {
        return db.User
          .update({ _id: req.params.id }, { totalLosses: user.totalLosses + 1 });
      })
      .then(function () {
        res.send(true);
      })
      .catch(err => console.log(err));
  }
};
