const mongoose = require("mongoose");

const User = mongoose.model('User', {
    name: String,
    username: String,
    email: String,
    todos: Array,
});

module.exports = User;