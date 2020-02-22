const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    username: {
        type: String,
        required: "Please enter a username"
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        match: [/.+@.+\..+/, "Enter a valid email"]
    },
    password: {
        type: String, 
        required: true,
        validate: [function (input) {
            return input.length >= 6
        },
            "Password needs to be at least 6 characters"]
    },
    picLink: {
        type: String,
        required: "Please attach a picture link"
    },
    //PicBinary is here for later if we want to store a user's image in Mongo... 
    //ask Michelle for article link when ready.
    // picBinary: {data: Buffer, type: String},
    totalWins: { type: Number, default: 0 },
    totalLosses: { type: Number, default: 0 },
    //totalPoints is here for later if we have time to implement
    //a points system based on difficulty instead of total wins.
    authType: { type: String },
    googleId: { type: String }
    // totalPoints: {type: Number, default: 0}
});

userSchema.methods.checkPassword = function (password) {
    return bcrypt.compare(password, this.password)
}

userSchema.pre('save', function (next) {
    if(!this.isNew){
        return Promise.resolve()
    }
    if (this.authType !== "google") {
        return bcrypt.genSalt(10).then(salt => {
            return bcrypt.hash(this.password, salt)
        }).then(hash => {
            this.password = hash
            return Promise.resolve()
        })
    } else {
        return Promise.resolve()
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;