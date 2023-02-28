let userController = require("../controller/users/userAdminController")
let userRolesController = require("../controller/users/userAdminRolesController")

let permissionsController = require("../controller/users/userAdminPermissionController")


//////////////////////////////////////////////


/* Requiring the express module and then creating a router object. */
let router = require('express').Router()


/* The below code is creating a route for the userAdminListUI function in the userController.js file. */
router.get("/users-list-ui", userController.userAdminListUI)

/* This is creating a route for the `getFilteredUserAdmins` function in the `userController.js` file. */
router.post("/users-list-ui-ajax", userController.getUserAdminAjax)

router.get('/edit-user-admin-ui', userController.editUserAdminUi)

router.get('/usersAdminRoles',userController.getAllAdminRoles);

/* This is creating a route for the `getFilteredUserAdmins` function in the `userController.js` file. */
router.post("/admin-add-new-user", userController.addNewAdminUser)

router.get('/admin-get-single-user/:id',userController.getSingleUserAdmin)


/* This is creating a route for the `updateAdminUser` function in the `userController.js` file. */
router.post("/admin-update-user", userController.updateAdminUser);


/* This is creating a route for the `getUserAdminRolesUi` function in the `userRolesController.js`
file. */
router.get("/user-roles", userRolesController.getUserAdminRolesUi);


/* This is creating a route for the `getUserAdminRolesAjax` function in the `userRolesController.js`
file. */
router.get("/user-roles-ajax", userRolesController.getUserAdminRolesAjax);


/* This is creating a route for the `addNewUserAdminRole` function in the `userRolesController.js`
file. */
router.post("/user-add-new-role", userRolesController.addNewUserAdminRole);



/* This is creating a route for the `getUserAdminPermissionUi` function in the
`permissionsController.js`
file. */
router.get('/permissions', permissionsController.getUserAdminPermissionUi);


/* This is creating a route for the `getAllPermissionsData` function in the `permissionsController.js`
file. */
router.get('/admin-permission-data', permissionsController.getAllPermissionsData);


/* This is creating a route for the `postNewPermission` function in the `permissionsController.js`
file. */
router.post('/admin-post-new-permission', permissionsController.postNewPermission);


/* This is creating a route for the `updatePermissionDataController` function in the
`permissionsController.js`
file. */
router.post('/admin-update-permission', permissionsController.updatePermissionDataController);


/*This is the route to render page for managing telecaller user access*/
router.get('/manage-tele-permission', permissionsController.getUserManagePermission);


/* This is creating a route for the `updateTeleTeams` function in the `permissionsController.js`
file. */
router.post('/update-tele-teams', permissionsController.updateTeleTeams);

/* This is a catch all route. If the user tries to access a route that is not defined in the router,
then this route will be executed. */
router.get('*', function (req, res, next) {
	res.render('error/notFound')
});
/* This is exporting the router object to the `app.js` file. */
module.exports = router;