// Imports
const express = require('express');
const path = require('path');
const dotenv = require("dotenv").config();
const session = require("express-session");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const router = require('./app/routes/homeRoutes');
const redis = require("redis");
const connectRedis = require("connect-redis");


//creating express app here...
const app = express();

// settting the port and globals  here...
let port = process.env.PORT || 1601;
global.app = app;
global.basePath = __dirname;
global.jwt = jwt;
process.env.TZ = "Asia/kolkata";

let RedisStore, redisClient
if (process.env.NODE_ENV === 'development') {

	RedisStore = connectRedis(session);
	redisClient = redis.createClient({
		host: 'http://localhost/',
		port: 6379,
		legacyMode: true,
	});
	redisClient.connect();

	redisClient.on("error", function (err) {
		console.log("Could not establish a connection with redis. " + err)
	});
	redisClient.on("connect", function (err) {
		console.log("Connected to redis successfully 👍👍👍👍👍👍👍👍")
	});
}

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

/* ===========>>>>>>>>>    Middlewares here  <<<<<<<<<<<======================= */


//logs here....
app.use(morgan('dev'));





// setting ejs view here.... 
app.use(express.static(__dirname + ""));
app.set('views', [path.join(__dirname, 'app/view/')]);
app.set('view engine', 'ejs');


// invoking session here.....



/* The above code is setting up the session middleware. */

app.use(
	session({
		secret: "ciCustomSessionSecret",
		cookie: {
			secure: false,
			httpOnly: true,
			maxAge: 24 * 60 * 60 * 1000,

		},
		saveUninitialized: true,
		resave: false,
		...(process.env.NODE_ENV === 'development' && { store: new RedisStore({ client: redisClient }) })

	})
);


// parsing data here....
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());




//using the router here....

app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	next();
});


app.use('/', router);
// listening to port here....

app.listen(port, function () {
	console.log("listening on port : ", port);
});
