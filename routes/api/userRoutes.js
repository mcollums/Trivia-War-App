const router = require("express").Router();
const userController = require("../../controllers/userController");

// Matches with "/api/user"
// router.route("/")
//   .get(userController.findAll);

// Matches with "/api/user/:email"
router.route("/email/:email")
  .get(userController.findOneByEmail)

router.route("/score/:id")
  .put(userController.updateUserScore)
//Matches with "/api/user/:id"
// updates the winningscore on matching of the userid
router.route("/add-win/:id")
  .get(userController.addwinScore);

// updates the loose score on matching of the userid
router.route("/add-loss/:id")
  .get(userController.addlossScore);

router.route("/:id")
  .get(userController.findById)

//updates the single player wins and losses after the game
// matches with "/api/user/:user"
router.route("/")
  .post(userController.updateOne)
  .get(userController.findAll);
//Matched with api/user/update/:id


module.exports = router;