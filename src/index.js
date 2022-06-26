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
  //criando registro de usuario no mongodb
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


/**
 * obter os to-dos do usuario
 */
app.get("/todos", verifyUserExists, (req, res) => {
  const { todos } = req.user;
  return res.json(todos);
});

/**
 * criar um novo to-do
 */
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

  await User.updateOne({ _id: _id }, { todos: todos });

  return res.status(201).send(todo);

});

/**
 * alterar o titulo ou deadline do todo
 */
app.put("/todos/:id", verifyUserExists, async (req, res) => {
  const { title, deadline } = req.body;
  const { id } = req.params;
  const { _id, todos } = req.user;

  const todo = todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Task not found!" });
  }
  if (title.length > 0) {
    todo.title = title;
  }
  if (todo.deadline != new Date(deadline)) {
    todo.deadline = new Date(deadline);
    todo.done = false;
  }

  await User.updateOne({ _id: _id }, { todos: todos });

  return res.status(201).json(todo);
});

app.patch("/todos/:id/done", verifyUserExists, async (req, res) => {
  const { _id, todos } = req.user;
  const { id } = req.params;

  const todo = todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Task not found!" });
  }

  todo.done = true;

  await User.updateOne({ _id: _id }, { todos: todos });

  return res.status(201).json(todo);
});

/**
 * exclui os dados de um todo
 */
app.delete("/todos/:id", verifyUserExists, async (req, res) => {
  const { _id, todos } = req.user;
  const { id } = req.params;

  const todo = todos.find((todo) => todo.id === id)

  if (!todo) {
    return res.status(404).json({ error: "Task not found!" });
  }

  todos.splice(todo, 1);

  await User.updateOne({ _id: _id }, { todos: todos });

  return res.status(204).send();

});
