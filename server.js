require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const MOVIES = require('./movies.json');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

function validateBearerToken(req, res, next) {
	const apiToken = process.env.API_TOKEN;
	const authToken = req.get('Authorization');

	if (!authToken || authToken.split(' ')[1] !== apiToken)
		return res.status(401).json({ error: 'Unauthorized request' });

	next();
}

app.use(validateBearerToken);

function handleGetMovie(req, res) {
	let response = MOVIES;

	if (req.query.genre)
		response = response.filter(movie =>
			movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
		);

	res.send(response);
}

app.get('/movie', handleGetMovie);

const PORT = 8000;

app.listen(PORT, () => {
	console.log(`Server listening at http://localhost:${PORT}`);
});
