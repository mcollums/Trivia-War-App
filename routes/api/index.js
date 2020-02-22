const router = require("express").Router();
const gameRoutes = require("./gameRoutes");
const userRoutes = require("./userRoutes");

// Game routes
router.use("/game", gameRoutes);
router.use("/user", userRoutes);


module.exports = router;
