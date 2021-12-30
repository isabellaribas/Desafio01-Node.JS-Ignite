const express = require('express');
const cors = require('cors');

const {v4: uuidv4} = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(400).json({error: "Usuário não encontrado."});
  };

  request.user = user;

  return next();
};

function checksUsernameAlreadyExists(request, response, next) {
  const {username} = request.body;
  const checks = users.find(user => user.username == username);
  
  if(checks) {
    return response.status(400).json({error: "Nome de usuário já existente. Favor escolher outro."})
  };
  
  return next();
};

app.post('/users', checksUsernameAlreadyExists, (request, response) => {
  const {name, username} = request.body;

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  const userCreated = users.find(user => user.username == username);

  return response.status(201).json(userCreated);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;

  const {user} = request;

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  });

  const todoCreated = user.todos.find(todo => todo.title == title);

  return response.status(201).json(todoCreated);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {

  const {user} = request;
  const {title, deadline} = request.body;
  const {id} = request.params;

  const todo = user.todos.find(todo => todo.id == id);

  if(!todo) {
    return response.status(404).json({error: "Tarefa não existente!"});
  };

  todo.title = title;
  todo.deadline = new Date(deadline)

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find(todo => todo.id == id);

  if(!todo) {
    return response.status(404).json({error: "Tarefa não existente!"})
  };

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if(todoIndex === -1) {
    return response.status(404).json({error: "Tarefa não existente!"})
  };

  user.todos.splice(todoIndex, 1);

  return response.status(204).json();
});

module.exports = app;