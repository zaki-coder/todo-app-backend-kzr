const Todo = require("../models/todo.model");
const mongoose = require('mongoose');

const asyncWrapper = require("../middleware/async");
const { createCustomError, CustomAPIError } = require("../errors/custom-errors");


const getAllTodos = asyncWrapper(async (req, res) => {
  try {
    const todos = await Todo.find({}).sort({ createdAt: "desc" }).exec();
    res.status(200).json({ todos });
  } catch (err) {
    console.log(err)
  }
});

const createTodo = asyncWrapper(async (req, res) => {

  try {
    const todo = await Todo.create(req.body);
    res.status(201).json({ todo, msg: 'Created'});
  } catch (err) {
    res.status(422).json({msg: err.message})
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

  const todo = await Todo.findOne({ _id: todoID }, function(err, todo) {
    todo.completed = !todo.completed;
    todo.save();
  }, {
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
