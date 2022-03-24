const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: 
    {
      type: String,
      required: true,
      text: "Please enter your name",
      trim: true,
    },
  email: { type: String, required: true, text: "Please enter a description", unique: true},
  password: { type: String, required: true, text: "Please enter a password" }
});

module.exports = mongoose.model("User", userSchema);