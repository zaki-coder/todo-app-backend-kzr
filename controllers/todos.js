const Todo = require("../models/todo.model");
const mongoose = require('mongoose');

const asyncWrapper = require("../middleware/async");
const { createCustomError, CustomAPIError } = require("../errors/custom-errors");


const getAllTodos = asyncWrapper(async (req, res) => {
  const todos = await Todo.find({});
  res.status(200).json({ todos });
});

const createTodo = asyncWrapper(async (req, res) => {

  try {
    const todo = await Todo.create(req.body);
    res.status(201).json({ todo: todo, msg: 'Created'});
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      throw new CustomAPIError(err.message, 422)
    } else {
      throw err;
    }
  }
  
});

const getTodo = asyncWrapper(async (req, res, next) => {
  const { id: todoID } = req.params;
  const todo = await Todo.findOne({ _id: todoID });
  if (!todo) {
    return next(createCustomError(`No todo with id : ${todoID}`, 404));
  }

  res.status(200).json({ todo });
});
const deleteTodo = asyncWrapper(async (req, res, next) => {
  const { id: todoID } = req.params;
  const todo = await Todo.findOneAndDelete({ _id: todoID });
  if (!todo) {
    return next(createCustomError(`No todo with id : ${todoID}`, 404));
  }
  res.status(200).json({ todo });
});
const updateTodo = asyncWrapper(async (req, res, next) => {
  const { id: todoID } = req.params;

  const todo = await Todo.findOneAndUpdate({ _id: todoID }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!todo) {
    return next(createCustomError(`No todo with id : ${todoID}`, 404));
  }

  res.status(200).json({ todo });
});

module.exports = {
  getAllTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo,
};
