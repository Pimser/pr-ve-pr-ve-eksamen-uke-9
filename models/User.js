const mongoose = require("mongoose");
const { type } = require("os");
const Schema = mongoose.Schema;

//brukerskjema 
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true //dette gjør eposten unik i databasen
    },
    password: {
        type: String,
        required: true,
    }
});

//lag en modell utifra skjemaet
const User = mongoose.model("User", userSchema);
module.exports = User;
