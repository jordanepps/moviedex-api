require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const MOVIES = require('./movies.json');

const app = express();
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(cors());
app.use(helmet());
app.use(morgan(morganSetting));

const VALID_COUNTRIES = [
	'canada',
	'china',
	'france',
	'germany',
	'great britain',
	'hungary',
	'israel',
	'italy',
	'japan',
	'spain',
	'united states'
];
const VALID_GENRES = [
	'action',
	'adventure',
	'animation',
	'biography',
	'comedy',
	'crime',
	'documentary',
	'drama',
	'fantasy',
	'grotesque',
	'history',
	'horror',
	'musical',
	'romantic',
	'spy',
	'thriller',
	'war',
	'western'
];

function processQuery(req, res, next) {
	const { genre, country, avg_vote } = req.query;
	let err;

	if (genre && !VALID_GENRES.includes(genre.toLowerCase())) {
		err = new Error();
		err.message = 'Please enter a valid genre';
	}

	if (country && !VALID_COUNTRIES.includes(country.toLowerCase())) {
		err = new Error();
		err.message = 'Please enter a valid country';
	}

	if (avg_vote && isNaN(avg_vote)) {
		err = new Error();
		err.message = 'Please enter a valid number';
	}

	if (err) return next(err);
	next();
}

function validateBearerToken(req, res, next) {
	const apiToken = process.env.API_TOKEN;
	const authToken = req.get('Authorization');

	if (!authToken || authToken.split(' ')[1] !== apiToken)
		return res.status(401).json({ error: 'Unauthorized request' });

	next();
}

function handleGetMovie(req, res) {
	let response = MOVIES;

	if (req.query.genre)
		response = response.filter(movie =>
			movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
		);
	if (req.query.country)
		response = response.filter(movie =>
			movie.country.toLowerCase().includes(req.query.country.toLowerCase())
		);
	if (req.query.avg_vote)
		response = response.filter(
			movie => movie.avg_vote >= Number(req.query.avg_vote)
		);

	res.send(response);
}

app.use(validateBearerToken);

app.get('/movie', processQuery, handleGetMovie);

app.use(function(err, req, res, next) {
	res.status(err.status || 500).json({
		error: err.message
	});
});

const PORT = process.env.PORT || 8000;

app.listen(PORT);
