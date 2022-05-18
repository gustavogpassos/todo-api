const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

const mongoose = require("./utils/database")(app);
const User = require('./models/User');

const users = [];

app.use(express.json());

async function verifyUserExists(req, res, next) {
  const { username } = req.headers;

  const user = await User.findOne({ username: username });

  if (!user) {
    return res.status(400).json({ error: "User not found!" });
  }

  req.user = user;

  next();
}


app.post("/users", async (req, res) => {
  const { name, username, email } = req.body;

  const user = await User.findOne({ username: username });

  if (user) {
    return res.status(400).json({ error: "User already exists!" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    email,
    todos: []
  }

  //criando registro no mongodb
  try {
    await User.create(newUser);
    return res.status(201).json({ message: "resource created", newUser });

  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

// app.get("/users", (req,res)=>{
//   return res.json(users);
// });

app.get("/todos", verifyUserExists, (req, res) => {
  const { todos } = req.user;
  return res.json(todos);
});

app.post("/todos", verifyUserExists, async (req, res) => {
  const { _id, todos } = req.user;

  const { title, deadline } = req.body;
  
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  todos.push(todo);

  await User.updateOne({_id: _id}, {todos: todos});

  return res.status(201).send(todo);

});

app.put("/todos/:id", verifyUserExists, (req, res) => {
  const { title, deadline } = req.body;
  const { id } = req.params;
  const { todos } = req.user;

  const todo = todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Task not found!" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return res.status(201).json(todo);
});

app.patch("/todos/:id/done", verifyUserExists, (req, res) => {
  const { todos } = req.user;
  const { id } = req.params;

  const todo = todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Task not found!" });
  }

  todo.done = true;

  return res.status(201).json(todo);
});


app.delete("/todos/:id", verifyUserExists, (req, res) => {
  const { todos } = req.user;
  const { id } = req.params;

  const todo = todos.find((todo) => todo.id === id)

  if (!todo) {
    return res.status(404).json({ error: "Task not found!" });
  }

  todos.splice(todo, 1);

  return res.status(204).send();

});
