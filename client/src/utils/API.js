import axios from "axios";

export default {
  // Gets all games
  getGames: function () {
    return axios.get("/api/game");
  },
  // Gets the game with the given id
  getOneGame: function (id) {
    return axios.get("/api/game/" + id);
  },
  logout: function () {
    return axios.get("/logout");
  },
  checkAuth: function () {
    return axios.get("/user/me");
  },
  getUsers: function () {
    return axios.get("/api/user")
  },
  getOneUser: function (id) {
    return axios.get("/api/user/" + id);
  },
  getUserByEmail: function (email) {
    return axios.get("api/user/email/" + email);
  },
  updateUserScore: function (id, obj) {
    return axios.put("api/user/score/" + id, obj);
  },
  postGameDetails: function (user) {
    return axios.post("/api/user", {
      id: user.id,
      wins: user.wins,
      losses: user.losses
    });
  },
  addWin: function (userId) {
    return axios.get("/api/user/add-win/" + userId);
  },
  addLoss: function (userId) {
    return axios.get("/api/user/add-loss/" + userId);
  }
};

