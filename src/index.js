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


app.post("/users", (req, res) => {
  const { name, username } = req.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return res.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return res.status(201).json(user);
});

// app.get("/users", (req,res)=>{
//   return res.json(users);
// });

app.get("/todos", verifyUserExists, (req, res) => { 
  const { todos } = req.user;
  return res.json(todos);
});

app.post("/todos", verifyUserExists, (req, res) => {
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

  if(!todo){
    return res.status(400).json({error:"Task not found!"});
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return res.status(201).json(todo);
});

app.patch("/todos/:id/done", verifyUserExists, (req,res)=>{
  const {todos} = req.user;
  const {id} = req.params;

  const todo = todos.find((todo)=>todo.id === id);
  
  if(!todo){
    return res.status(400).json({error:"Task not found!"});
  }

  todo.done = true;

  return res.status(201).json(todo);
});


app.delete("/todos/:id", verifyUserExists, (req,res)=>{
  const {todos} = req.user;
  const {id} = req.params;

  const todo = todos.find((todo)=>todo.id ===id)

  if(!todo){
    return res.status(400).json({error:"Task not found!"});
  }

  todos.splice(todo, 1);

  return res.json(todos);

});

app.listen(3000);