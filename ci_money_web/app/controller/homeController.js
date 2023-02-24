let jwt = require("jsonwebtoken");
const {pool} = require('../utils/config/database')
let homeControllerObj = {};
// router to get render landing page
homeControllerObj.renderLandingPage = async function(req, res, next){
    if(req.session && req.session.userToken){
        let userData = jwt.decode(req.session.userToken);
        if(userData.isVerified === true){
            res.render("home/dashboard")
        }else{
            res.render("home/profile") 
        }
    }else{
        res.render("auth/login")
    }
}

homeControllerObj.renderAccountPage = async function(req, res, next){
    res.render("home/account")
}


module.exports = homeControllerObj;