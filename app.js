
const express = require('express');
const app = express();

app.get('/', (req, res) => {
	res.send('Hello DevOps World');
	});

app.get('/users', (req, res) => {
	res.json([
	{ id: 1, name: 'Jack'},
	{ id: 2, name: 'Anna'}
	]);
      });

module.exports = app;
 
