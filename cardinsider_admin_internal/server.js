/* ===========>>>>>>>>>    imports here  <<<<<<<<<<<======================= */


const express = require("express")
const path = require("path")
const fs = require("fs")
const bodyParser = require("body-parser")
const jwt = require("jsonwebtoken")
const app = express()
const cookieParser = require("cookie-parser")
const session = require("express-session")
require("dotenv").config()
const morgan = require("morgan")
const logger = require("./configration/logs/config/winstonConfig")

const redis = require("redis")
const connectRedis = require("connect-redis")
const redisConfig = require("./configration/redisConfig")
const userAdminModel = require("./admin/application/model/userAdminModel")


let port = process.env.PORT
global.app = app
global.jwt = jwt
global.basePath = __dirname


//d

let debugStatus = process.env.DEBUGLEVEL || 'production'

if (debugStatus == 'production') {
    logger.debug("Overriding 'Express' logger")
    app.use(morgan("combined", { "stream": logger.stream }))

} else {
    app.use(morgan('dev'))
}




/* --------------------- This allows only whitelisted domains   ----------------------------------------------------- */

/* This is a middleware function that is executed before any other middleware function. */

app.use((req, res, next) => {
    const allowedOrigins = [process.env.WHITELISTDOMAIN1, process.env.WHITELISTDOMAIN2]
    const origin = req.headers.host
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin)
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        res.header('Access-Control-Allow-Credentials', true)
        next()
    } else {
        res.send("Not a valid Domain.")
    }

})



/* -------------------------------------------------------------------------- */





/* --------------------- The below code is creating a connection to the redis server.  ----------------------------------------------------- */
//Configure redis client
let RedisStore, redisClient
if (process.env.NODE_ENV === 'development') {
    RedisStore = connectRedis(session)
    redisClient = redis.createClient(redisConfig.configureRedis)

    redisClient.connect()

    redisClient.on("error", function (err) {
        console.log("Could not establish a connection with redis. " + err)
    })
    redisClient.on("connect", function (err) {
        console.log("Connected to redis successfully  🛵 🚗")
    })
}

/* -------------------------------------------------------------------------- */

app.use(express.static(__dirname + ""))
app.set("views", [path.join(__dirname, "admin/application/views")])
app.set("view engine", "ejs")
if (process.env.NODE_ENV === 'development') {
    app.use(
        session({
            secret: "ssshhhhh",
            cookie: {
                secure: false, // if true only transmit cookie over https
                httpOnly: true, // if true prevent client side JS from reading the cookie
                maxAge: 24 * 24 * 60 * 60 * 60 * 1000, // session max age in millisecond's
            },
            // create new redis store.
            store: new RedisStore({ client: redisClient }),
            saveUninitialized: true,
            resave: false,
        }
        )
    )
} else {
    app.use(
        session({
            secret: "ssshhhhh",
            cookie: {
                secure: false, // if true only transmit cookie over https
                httpOnly: true, // if true prevent client side JS from reading the cookie
                maxAge: 24 * 24 * 60 * 60 * 1000 * 1000, // session max age in millisecond's
            },
            // create new redis store.
            saveUninitialized: true,
            resave: false,
        }
        )
    )
}
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }))
app.use(express.json())
app.use(cookieParser())

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0





app.listen(port, () => console.log(`SERVER START-----${port}  🖥`))

/* requiring the admin for further */
require("./admin/")()
