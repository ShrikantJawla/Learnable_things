const siteUsersController = require('../controller/users/siteUsersControllers')



let router = require('express').Router()



router.get('/site-users-list-ui',siteUsersController.externalUsersListUI)

router.post("/site-users-list-ui-ajax", siteUsersController.externalUsersListAjax)



module.exports = router;