const express = require('express');
const router = express.Router();

const {
  getAllTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo,
  editTodo,
} = require("../controllers/todos");

router.route("/").get(getAllTodos).post(createTodo);
router.route("/:id").get(getTodo).patch(updateTodo).delete(deleteTodo);

module.exports = router;