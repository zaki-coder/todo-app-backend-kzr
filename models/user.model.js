const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: 
    {
      type: String,
      required: true,
      text: "Please enter your name",
      trim: true,
    },
  email: { type: String, required: true},
  password: { type: String, required: true}
});

module.exports = mongoose.model("User", userSchema);