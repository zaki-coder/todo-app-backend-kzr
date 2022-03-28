const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "todo must have a title"],
      trim: true,
      maxlength: [20, "name can not be more than 20 characters"],
    },
    description: {
      type: String,
      maxlength: [50, "description can not be more than 30 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", TodoSchema);
