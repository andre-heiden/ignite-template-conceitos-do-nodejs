const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found!" });
  }

  request.user = user;

  return next();

}

app.get('/users', (request, response) => {
  response.status(200).json(users);
});

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = users.find((user) => user.username === username);
  
  if (user) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const newUser =
  {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);
  response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo =
  {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(newTodo);

  response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  console.log(id);

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" });
  } 

  todo.title = title;
  todo.deadline = new Date(deadline);

  response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  console.log(id);

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" });
  } 

  todo.done = true;

  response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  console.log(id);

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" });
  } 

  user.todos.splice(user.todos.indexOf(todo),1);

  response.status(204).json(todo);
});

module.exports = app;