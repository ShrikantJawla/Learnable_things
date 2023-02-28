/* ===========>>>>>>>>>    imports here  <<<<<<<<<<<======================= */

// requiring the env here...
require("dotenv").config()
// const cluster = require("cluster");
// const os = require("os");
const express = require('express')
const path = require('path')
const fs = require('fs')
const cookieParser = require('cookie-parser')
const session = require("express-session")
const jwt = require("jsonwebtoken")
const morgan = require('morgan')
const redis = require("redis")
const connectRedis = require("connect-redis")


const router = require('./app/routes/homeRoutes')

// if(cluster.isMaster){
// 	console.log(`Master PID ${process.pid} is running`);

// 	const cpuN = os.cpus().length;

// 	for(let i = 0; i < cpuN; i++){
// 		console.log(i);
// 		cluster.fork();
// 	}

// 	cluster.on("exit", (worker, code, signal) => {
// 		console.log(`Worker PID ${worker.process.pid} died`);
// 	  });
// }else{
	//creating express app here...
const app = express()

// settting the port and globals  here...
let port = process.env.PORT || 1601
global.app = app
global.basePath = __dirname
global.jwt = jwt

/* ===========>>>>>>>>>    REDIS SERVICE HERE  <<<<<<<<<<<======================= */

// Configure redis client

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
	})
	redisClient.on("connect", function (err) {
		console.log("Connected to redis successfully 👍👍👍👍👍👍👍👍")
	})
}


/* ===========>>>>>>>>>    Middlewares here  <<<<<<<<<<<======================= */


//logs here....
app.use(morgan('dev'))


// /* --------------------- This allows only whitelisted domains   ----------------------------------------------------- */

// /* This is a middleware function that is executed before any other middleware function. */

// app.use((req, res, next) => {
//     const allowedOrigins = [process.env.WHITELISTDOMAIN1, process.env.WHITELISTDOMAIN2];
//     const origin = req.headers.host;
//     if (allowedOrigins.includes(origin)) {
//         res.setHeader('Access-Control-Allow-Origin', origin);
//         res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
//         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//         res.header('Access-Control-Allow-Credentials', true);
//         next();
//     } else {
//         res.send("Not a valid Domain.");
//     }

// });



/* -------------------------------------------------------------------------- */




app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*")
	next()
})

// setting ejs view here.... 
app.use(express.static(__dirname + ""))
app.set('views', [path.join(__dirname, 'app/view/')])
app.set('view engine', 'ejs')


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
)

// parsing data here....
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(cookieParser())





process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0


//using the router here....

app.use('/', router)



// listening to port here....
app.listen(port, function () {
	console.log("listening on port 👨‍💻 ----->>", port)
})
// }

