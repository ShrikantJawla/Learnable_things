const commonHelper = require("./commonHelper");
const jwt = require("jsonwebtoken");

let middleWareObj = {};

middleWareObj.checkLoginStatus = async (req, res, next) => {

    if (!req.session || !req.session.userToken) {
        res.redirect("/");
    } else {
        const loggedUser = jwt.decode(req.session.userToken);
        req.body.loggedUser = loggedUser;
        next();
    }
}
 
middleWareObj.checkAuthStatus = async (req , res, next) =>{
    if(req.session.userToken){
        res.redirect("/")
    }else{
        next();
    }
}

module.exports = middleWareObj;