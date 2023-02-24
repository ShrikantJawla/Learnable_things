let redisConfig = {
    configureRedis: {
        username: process.env.REDISUSERNAME,
        password: process.env.REDISPASSWORD,
        host: process.env.REDISPASSWORD,
        port: process.env.REDISPORT,
        legacyMode: true,
        
        // host: 'http://localhost/',
		// port: 6379,
		// legacyMode: true,
    },
};


module.exports = redisConfig;