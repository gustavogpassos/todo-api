const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

const users = [];

app.use(express.json());

function verifyUserExists(req, res, next) {
  const { username } = req.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(400).json({ error: "User not found!" });
  }

  req.user = user;

  next();
}


app.post("/users/create", (req, res) => {
  const { name, username } = req.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return res.status(400).json({ error: "User already exists!" });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return res.status(201).send();
});

app.get("/users/list", (req,res)=>{
  return res.json(users);
});

app.get("/todos", verifyUserExists, (req, res) => {
  const { todos } = req.user;
  return res.json(todos);
});

app.post("/todos/create", verifyUserExists, (req, res) => {
  const { todos } = req.user;
  const { title, deadline } = req.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  todos.push(todo);

  return res.status(201).send(todo);

});

app.put("/todos/:id", verifyUserExists, (req,res)=>{
  const {title, deadline} = req.body;
  const {id} = req.params;
  const {todos} = req.user;

  const todo = todos.find((todo)=>todo.id === id);

  todo.title = title;
  todo.deadline = new Date(deadline);

  return res.status(201).json(todo);
});


app.listen(3000);