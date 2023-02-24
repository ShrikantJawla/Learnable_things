const homeController = require("../application/controller/homeController")
const factoryController = require("../application/controller/factoryController")
const offerController = require("../application/controller/offerController")
const creditCardController = require("../application/controller/creditcardController")
const loungeController = require("../application/controller/loungeController")
const applicationController = require("../application/controller/applicationsController")
const authController = require("../application/controller/authenticationController")
const commonMiddleware = require("../application/common/middleware")
const userController = require("../application/controller/usersController")
const cashbackController = require("../application/controller/cashbackController")
const notificationController = require("../application/controller/notificationsControlller")
const sequenceController = require("../application/controller/sequenceController")
const adminUsers = require("../application/controller/userAdminController")
const transactionsController = require("../application/controller/transactionsController");
const cibilConditionsController = require("../application/controller/cibilConditionsController");
// const { header } = require("express/lib/response")



const uploadFileController = require("../application/controller/uploadFileController")
const res = require("express/lib/response")

module.exports = function () {
    /* ===========>>>>>>>>>   Home routes here....   <<<<<<<<<<<======================= */
    /* The above code is checking if the user is logged in or not. If the user is logged in, then the user
    will be redirected to the dashboard. If the user is not logged in, then the user will be redirected
    to the sign in page. */

    app.get("/", authController.signIn)
    app.get(
        "/dashboard",
        commonMiddleware.checkTheLoginStatus,
        homeController.index
    )

    /* ===========>>>>>>>>>   authentication routes here....   <<<<<<<<<<<======================= */

    /* The above code is creating a route for the sign-in page. */
    app.get("/sign-in", authController.signIn)


    /* The above code is creating a route for the sign-in-data. */
    app.post("/sign-in-data", authController.signinData)


    /* This is a post route that is sending the signOutData function from the authController.js file. */
    app.post("/sign-out-user", authController.signOutData)

    /* The above code is a route that is used to publish an item. */
    app.post(
        "/publish/:table/:id",
        commonMiddleware.checkTheLoginStatusForAjax,
        factoryController.publishItem
    )

    /* ===========>>>>>>>>>    Users routes  here....   <<<<<<<<<<<======================= */
    /* A route that is used to get the CI users. */
    app.get(
        "/ci-users",
        commonMiddleware.checkTheLoginStatus,

        userController.getCiUsers
    )


    /* A route for post request  for getting the filtered ciUsers . */
    app.post(
        "/get-filtered-ciUsers",
        commonMiddleware.checkTheLoginStatusForAjax,
        userController.getFilteredCiUsers
    )

    /* a get rooute for rendering edit ciUsers page. */
    app.get(
        "/edit-ciUser",
        commonMiddleware.checkTheLoginStatus,
        userController.getExistingCiUserByIdUI
    )

    /* The above code is updating the user by id. */
    app.put(
        "/update-ciUser",
        commonMiddleware.checkTheLoginStatus,
        userController.updateCiUserById
    )

    /* Deleting a user by id. */
    app.delete(
        "/delete/ciUser/:id",
        commonMiddleware.checkTheLoginStatusForAjax,
        userController.deleteCiUserById
    )



    /* ===========>>>>>>>>>    Account routes  here....   <<<<<<<<<<<======================= */
    /* Checking if the user is logged in, and if so, it is rendering the account page. */
    app.get(
        "/account",
        commonMiddleware.checkTheLoginStatus,
        userController.getAccountDetails
    )

    /* ===========>>>>>>>>>    Internal Users  routes here....   <<<<<<<<<<<======================= */

    /* A route that is used to get all the internal users. */
    app.get(
        "/internal-users",
        commonMiddleware.checkTheLoginStatus,
        userController.getInternalUsers
    )

    /* ===========>>>>>>>>>   Applications routes here....   <<<<<<<<<<<======================= */
    /* The above code is a route that is used to upload a card application. */
    app.get(
        "/application-upload",
        commonMiddleware.checkTheLoginStatus,

        applicationController.cardApplicationUpload
    )

    /* A route for ajax call. */
    app.post(
        "/application-get-users",
        commonMiddleware.checkTheLoginStatusForAjax,
        userController.getAllCiUsersAjax
    )

    /* A route to get all the applications list. */
    app.get(
        "/card-application",
        commonMiddleware.checkTheLoginStatus,
        applicationController.getAllApplicationsList
    )
    /* Creating a route for the new-card-application page. */
    app.get(
        "/new-card-application",
        commonMiddleware.checkTheLoginStatus,
        applicationController.getNewApplicationPageUi
    )

    /* Adding the data to the database. */
    app.post(
        "/application-add-application-axis",
        commonMiddleware.checkTheLoginStatusForAjax,
        applicationController.addApplicationsDataForAxis
    )


    /* A route for adding application data for IDFC. */
    app.post(
        "/application-add-application-idfc",
        commonMiddleware.checkTheLoginStatusForAjax,
        applicationController.addApplicationsDataForIdfc
    )

    /* A route for adding application data for BOB. */
    app.post(
        "/application-add-application-bob",
        commonMiddleware.checkTheLoginStatusForAjax,
        applicationController.addApplicationsDataForBob
    )

    /* The above code is a route for adding applications data for AU. */
    app.post(
        "/application-add-application-au",
        commonMiddleware.checkTheLoginStatusForAjax,
        applicationController.addApplicationsDataForAu
    )



    /* The above code is a route for adding applications data for Yes. */
    app.post(
        "/application-add-application-yes",
        commonMiddleware.checkTheLoginStatusForAjax,
        applicationController.addApplicationsDataForYes
    )

    /* A route that is used to get the web users. */
    app.post(
        "/application-get-web-users",
        commonMiddleware.checkTheLoginStatusForAjax,
        applicationController.getWebUsers
    )

    /* A route for ajax call. */
    app.post(
        "/application-get-all-applications",
        commonMiddleware.checkTheLoginStatusForAjax,
        applicationController.getAllApplicationsListByAjax
    )

    /* The above code is creating a route that will be used to get all the issuers data from the
    database. */
    app.post("/get-issuers", applicationController.getAllIssuersData)

    // approved applications in cashbacks here.....

    /* A route to get the approved applications. */
    app.get(
        "/approved-applications",
        commonMiddleware.checkTheLoginStatus,
        cashbackController.getApprovedAppliations
    )

    /* A route for ajax request. */
    app.post(
        "/filtered-approved-applications",
        commonMiddleware.checkTheLoginStatusForAjax,
        cashbackController.getFilteredApprovedApplications
    )

    /* A route for ajax call. */
    app.post(
        "/approved-mark-paid",
        commonMiddleware.checkTheLoginStatusForAjax,
        cashbackController.markApprovedAsPaid
    )

    /* A route to set cashback and referrals paid. */
    app.post(
        '/set-cashback-referral-paid',
        commonMiddleware.checkTheLoginStatusForAjax,
        cashbackController.setCashbackRefferalsPaid,
    )


    /* ===========>>>>>>>>>   Cashback rewards  routes here....   <<<<<<<<<<<======================= */

    /* A route for cashback page. */
    app.get(
        "/cashbacks",
        commonMiddleware.checkTheLoginStatus,
        cashbackController.cashbackData
    )

    app.post(
        "/demo-add-data",
        //commonMiddleware.checkTheLoginStatus,
        cashbackController.demoDataAdd
    )

    /* A route for  data cashback page. */
    app.post(
        "/get-cashbacks",
        commonMiddleware.checkTheLoginStatus,
        cashbackController.getCashbackDataList
    )

    /* A Route to update payment details */

    app.post("/update-payment-details", commonMiddleware.checkTheLoginStatus, cashbackController.updatePaymentDetails)

    

    app.get("/get-transaction-report" , commonMiddleware.checkTheLoginStatus, cashbackController.getTransactionsReport)
    app.post("/get-transaction-report-ajex" , commonMiddleware.checkTheLoginStatus, cashbackController.getTransactionsReportAjex)
    /* ===========>>>>>>>>>    transactions routes here....   <<<<<<<<<<<======================= */

    /* Rendering the transactions page. */
    app.get(
        '/transactions',
        commonMiddleware.checkTheLoginStatus,
        transactionsController.renderTransactionsPage
    )

    /* A route that is used to process a transaction. */
    app.post(
        '/process-transaction',
        commonMiddleware.checkTheLoginStatusForAjax,
        transactionsController.processTransaction
    )
    app.post(
        "/filtered-transactions",
        commonMiddleware.checkTheLoginStatusForAjax,
        transactionsController.getFilteredTransactions
    )
    app.post("/insert-transaction", commonMiddleware.checkTheLoginStatus, transactionsController.insertTransaction)
    app.post(
        '/complete-transaction',
        commonMiddleware.checkTheLoginStatusForAjax,
        transactionsController.completeTransaction
    )

    app.get(
        '/view-transaction',
        commonMiddleware.checkTheLoginStatus,
        transactionsController.viewTransactionDetailsById

    )

    app.get(
        '/transaction-upload-report',
        commonMiddleware.checkTheLoginStatusForAjax,
        transactionsController.renderUploadTransactionsPage
    );

    app.post(
        '/post-transaction-report',
        commonMiddleware.checkTheLoginStatusForAjax,
        transactionsController.uploadAndProcessTransactionReport
    );

    app.post(
        '/transactions/export-csv',
        commonMiddleware.checkTheLoginStatusForAjax,
        transactionsController.exportCsv
    )
    /* ===========>>>>>>>>>    Offers routes here....   <<<<<<<<<<<======================= */


    /* A post route for get filtered offers. */
    app.post(
        "/get-filtered-offers",
        commonMiddleware.checkTheLoginStatusForAjax,
        offerController.getFilteredOffers
    )


    /* Creating a route for the offer page. */
    app.get(
        "/offers",
        commonMiddleware.checkTheLoginStatus,
        offerController.getOfferPageUi
    )

    /* A route for ajax call. */
    app.get(
        "/offersforrelation",
        commonMiddleware.checkTheLoginStatusForAjax,
        offerController.getOfferNameForRelation
    )
    //route for creating new offer

    /* Creating a route for the new offer page. */
    app.get(
        "/offers-list-new",
        commonMiddleware.checkTheLoginStatus,

        offerController.getNewOfferPageUI
    )

    //editing existing offer
    /* Getting the offer by id and displaying it in the UI. */
    app.get(
        "/edit-offer",
        commonMiddleware.checkTheLoginStatus,
        offerController.getExistingOfferByIdUI
    )

    /* The above code is updating the offer by id. */
    app.put(
        "/update-offer",
        commonMiddleware.checkTheLoginStatus,

        offerController.updateOfferById
    )
    // posting new offer here...

    /* The above code is a route for a POST request. It is a route for a form submission. */
    app.post(
        "/post-newoffer",
        commonMiddleware.checkTheLoginStatusForAjax,
        offerController.postForNewOffer
    )

    /* Deleting an offer by id. */
    app.delete(
        "/delete/offer/:id",
        commonMiddleware.checkTheLoginStatusForAjax,
        offerController.deleteOfferById
    )

    /* Deleting a brand by id. */
    app.delete(
        "/delete/brand/:id",
        commonMiddleware.checkTheLoginStatusForAjax,
        offerController.deleteBrandById
    )

    /* A route to get the list of brands. */
    app.get(
        "/brands-list",
        commonMiddleware.checkTheLoginStatus,
        offerController.getBrandsList
    )

    /* A route for ajax call. */
    app.get(
        "/brandsnameforrelation",
        commonMiddleware.checkTheLoginStatusForAjax,
        offerController.getBrandsNameForRelation
    )

    /* A route for ajax call. */
    app.post(
        "/get-filtered-brands",
        commonMiddleware.checkTheLoginStatusForAjax,
        offerController.getFilteredBrands
    )

    /* The above code is doing the following:
    1. It is checking the login status of the user.
    2. It is uploading the file to the spaces.
    3. It is posting the data to the database.
    4. It is posting the image to the database. */
    app.post(
        "/post-newbrand",
        commonMiddleware.checkTheLoginStatusForAjax,
        uploadFileController.uploadToSpaces('brands/').array('upload', 3),
        offerController.postForNewBrand,
        factoryController.imagePost
    )

    /* Creating a route for the new brand page. */
    app.get(
        "/brands-list-new",
        commonMiddleware.checkTheLoginStatus,
        offerController.getNewBrandPageUI
    )

    /* Updating the brand by id. */
    app.put(
        "/update-brand",
        commonMiddleware.checkTheLoginStatus,
        uploadFileController.uploadToSpaces('brands/').array('upload', 3),
        offerController.updateBrandById,
        factoryController.imagePost
    )

    /* Getting the existing brand by id and displaying it in the UI. */
    app.get(
        "/edit-brand",
        commonMiddleware.checkTheLoginStatus,
        offerController.getExistingBrandByIdUI
    )


    /* ===========>>>>>>>>>    Airport routes here....   <<<<<<<<<<<======================= */
    // RELATION ROUTE

    /* A route for the lounge controller. */
    app.get(
        "/airportsforrelation",
        commonMiddleware.checkTheLoginStatus,
        loungeController.getAirportsForRelation
    )


    // UI ROUTES


    /* A route to get the list of airports. */
    app.get(
        "/airports-list",
        commonMiddleware.checkTheLoginStatus,
        loungeController.getAirportsList
    )

    /* Getting the airport by id and displaying it in the UI. */
    app.get(
        "/edit-airport",
        commonMiddleware.checkTheLoginStatus,
        loungeController.getExistingAirportByIdUI
    )

    /* Creating a route for the new airport page. */
    app.get(
        "/airports-list-new",
        commonMiddleware.checkTheLoginStatus,
        loungeController.getNewAirportPageUI
    )

    // AJAX ROUTES

    /* A route that is used to get the filtered airports. */
    app.post(
        "/get-filtered-airports",
        commonMiddleware.checkTheLoginStatusForAjax,
        loungeController.getFilteredAirports
    )

    /* A route for ajax call. */
    app.get(
        "/get-airport-cities",
        commonMiddleware.checkTheLoginStatusForAjax,
        loungeController.getAllAirportCities
    )

    /* The above code is a route for a POST request to the URL /post-newairport. */
    app.post(
        "/post-newairport",
        commonMiddleware.checkTheLoginStatusForAjax,
        uploadFileController.uploadToSpaces('airports/').array('upload', 1),
        loungeController.postForNewAirport,
        factoryController.imagePost
    )

    /* The above code is updating the airport by id. */
    app.put(
        "/update-airport",
        commonMiddleware.checkTheLoginStatus,
        uploadFileController.uploadToSpaces('airports/').array('upload', 1),
        loungeController.updateAirportById,
        factoryController.imagePost
    )

    /* Deleting the airport by id. */
    app.delete(
        "/delete/airport/:id",
        commonMiddleware.checkTheLoginStatusForAjax,
        loungeController.deleteAirportById
    )





    /* ===========>>>>>>>>>    Lounge routes here....   <<<<<<<<<<<======================= */


    // RELATION ROUTE


    /* A route for ajax call. */
    app.get(
        "/loungesforrelation",
        commonMiddleware.checkTheLoginStatusForAjax,
        loungeController.getLoungesNameForRelation
    )

    // UI ROUTES


    /* The above code is a route that is used to get the list of lounges. */
    app.get(
        "/lounges-list",
        commonMiddleware.checkTheLoginStatus,
        loungeController.getLoungesList
    )
    /* Creating a route for the new lounge page. */
    app.get(
        "/lounges-list-new",
        commonMiddleware.checkTheLoginStatus,
        loungeController.getNewLoungePageUI
    )
    /* The above code is a route that is used to get the lounge by its id. */
    app.get(
        "/edit-lounge",
        commonMiddleware.checkTheLoginStatus,
        loungeController.getExistingLoungeByIdUI
    )

    // AJAX ROUTES


    /* The above code is a route that is used to get the filtered lounges. */
    app.post(
        "/get-filtered-lounges",
        commonMiddleware.checkTheLoginStatusForAjax,
        loungeController.getFilteredLounges
    )
    /* The above code is a route for a POST request to the URL /post-newlounge. */
    app.post(
        "/post-newlounge",
        commonMiddleware.checkTheLoginStatusForAjax,
        uploadFileController.uploadToSpaces('lounges/').array('upload', 1),
        loungeController.postForNewLounge,
        factoryController.imagePost
    )
    /* The above code is updating the lounge by id. */
    app.put(
        "/update-lounge",
        commonMiddleware.checkTheLoginStatus,
        uploadFileController.uploadToSpaces('lounges/').array('upload', 1),
        loungeController.updateLoungeById,
        factoryController.imagePost
    )
    /* The above code is deleting a lounge by its id. */
    app.delete(
        "/delete/lounge/:id",
        commonMiddleware.checkTheLoginStatusForAjax,
        loungeController.deleteLoungeById
    )




    /* ===========>>>>>>>>>    Lounge Network routes here....   <<<<<<<<<<<======================= */

    //  RELATION ROUTES


    /* A route for ajax call. */
    app.get(
        "/loungenetworksforrelation",
        commonMiddleware.checkTheLoginStatusForAjax,
        loungeController.getLoungeNetworksForRelation
    )
    //UI ROUTES

    /* A route that is used to get the lounge network list. */
    app.get(
        "/lounge-network-list",
        commonMiddleware.checkTheLoginStatus,
        loungeController.getLoungeNetworkList
    )
    /* Creating a route for the new lounge network page. */
    app.get(
        "/loungeNetworks-list-new",
        commonMiddleware.checkTheLoginStatus,
        loungeController.getNewLoungeNetworkPageUI
    )

    /* The above code is a route handler for the edit-loungeNetwork page. */
    app.get(
        "/edit-loungeNetwork",
        commonMiddleware.checkTheLoginStatus,
        loungeController.getExistingLoungeNetworkByIdUI
    )

    // AJAX ROUTES

    /* A route for ajax call. */
    app.post(
        "/get-filtered-loungeNetworks",
        commonMiddleware.checkTheLoginStatusForAjax,
        loungeController.getFilteredLoungeNetworks
    )

    /* The above code is a route for a POST request. It is a route for a form submission. */
    app.post(
        "/post-newloungeNetwork",
        commonMiddleware.checkTheLoginStatusForAjax,
        loungeController.postForNewLoungeNetwork
    )
    /* The above code is updating the loungeNetwork by id. */
    app.put(
        "/update-loungeNetwork",
        commonMiddleware.checkTheLoginStatus,
        loungeController.updateLoungeNetworkById
    )
    /* The above code is deleting a lounge network by id. */
    app.delete(
        "/delete/loungeNetwork/:id",
        commonMiddleware.checkTheLoginStatusForAjax,
        loungeController.deleteLoungeNetworkById
    )

    /* ===========>>>>>>>>>    Credit cards routes here....   <<<<<<<<<<<======================= */

    /* Creating a new route for the new card issuer page. */
    app.get(
        "/cardissuers-list-new",
        commonMiddleware.checkTheLoginStatus,

        creditCardController.getNewCardIssuerPageUI
    )

    //editing existing offer


    /* The above code is a route handler for the URL /edit-cardIssuer. It is a GET request. The route
    handler is using the commonMiddleware.checkTheLoginStatus middleware to check if the user is
    logged in. If the user is logged in, then the route handler will call the
    creditCardController.getExistingCardIssuerByIdUI controller function. */
    app.get(
        "/edit-cardIssuer",
        commonMiddleware.checkTheLoginStatus,
        creditCardController.getExistingCardIssuerByIdUI
    )


    // posting new cardIssuer here...

    /* The above code is doing the following:
    1. It is checking the login status of the user.
    2. It is uploading the files to the spaces.
    3. It is posting the new card issuer.
    4. It is posting the image. */
    app.post(
        "/post-newcardIssuer",
        commonMiddleware.checkTheLoginStatusForAjax,
        uploadFileController.uploadToSpaces('card_issuers/').array('upload', 2),
        creditCardController.postForNewCardIssuer,
        factoryController.imagePost
    )

    /* The above code is updating the card issuer by id. */
    app.put(
        "/update-cardIssuer",
        commonMiddleware.checkTheLoginStatus,
        uploadFileController.uploadToSpaces('card_issuers/').array('upload', 2),
        creditCardController.updateCardIssuerById,
        factoryController.imagePost
    )


    /* The above code is creating a route for the new credit card page. */
    app.get(
        "/creditcards-list-new",
        commonMiddleware.checkTheLoginStatus,
        creditCardController.getNewCreditCardPageUI
    )

    //editing existing offer


    /* The above code is a route handler for the URL /edit-creditCard. It is a GET request. It is using
    the commonMiddleware.checkTheLoginStatus middleware to check if the user is logged in. If the
    user is logged in, then it will call the creditCardController.getExistingCreditCardByIdUI
    function. */
    app.get(
        "/edit-creditCard",
        commonMiddleware.checkTheLoginStatus,
        creditCardController.getExistingCreditCardByIdUI
    )

    /* The above code is updating the credit card information. */
    app.put(
        "/update-creditCard",
        commonMiddleware.checkTheLoginStatus,
        uploadFileController.uploadToSpaces('credit_cards/').array('upload', 1),
        creditCardController.updateCreditCardById,
        factoryController.imagePost
    )

    // posting new creditCard here...

    /* The above code is doing the following:
    1. It is checking the login status of the user.
    2. It is uploading the file to the spaces.
    3. It is posting the new credit card.
    4. It is posting the image. */
    app.post(
        "/post-newcreditCard",
        commonMiddleware.checkTheLoginStatusForAjax,
        uploadFileController.uploadToSpaces('credit_cards/').array('upload', 1),
        creditCardController.postForNewCreditCard,
        factoryController.imagePost
    )

    /* The above code is a route that is used to get the filtered credit cards. */
    app.post(
        "/get-filtered-credit-cards",
        commonMiddleware.checkTheLoginStatusForAjax,
        creditCardController.getFilteredCreditCards
    )

    /* A route that is used to get the filtered card issuers. */
    app.post(
        "/get-filtered-card-issuers",
        commonMiddleware.checkTheLoginStatusForAjax,
        creditCardController.getFilteredCardIssuers
    )

    /* Creating a route for the creditcards-list page. */
    app.get(
        "/creditcards-list",
        commonMiddleware.checkTheLoginStatus,
        creditCardController.getCreditcardsList
    )



    /* The above code is used to get the credit card names for relation. */
    app.get(
        "/creditcardforrelation",
        commonMiddleware.checkTheLoginStatusForAjax,
        creditCardController.getCreditCardNamesForRelation
    )


    /* The above code is for the routes of the credit card application. */
    app.get(
        "/creditcardforrelationpresentincardapplications",
        commonMiddleware.checkTheLoginStatusForAjax,
        creditCardController.getCreditCardNamesForRelationPresentInCardApplications
    )

    /* The above code is deleting a credit card by id. */
    app.delete(
        "/delete/creditCard/:id",
        commonMiddleware.checkTheLoginStatusForAjax,
        creditCardController.deleteCreditCardById
    )

    /* Deleting a card issuer by id. */
    app.delete(
        "/delete/cardIssuer/:id",
        commonMiddleware.checkTheLoginStatusForAjax,
        creditCardController.deleteCardIssuerById
    )

    /* A route that is used to get the list of card issuers. */
    app.get(
        "/cardissuers-list",
        commonMiddleware.checkTheLoginStatus,
        creditCardController.getCardIssuerList
    )

    /* The above code is a route for the card issuers list. */
    app.post(
        "/cardissuerslist-ajax",
        commonMiddleware.checkTheLoginStatusForAjax,
        creditCardController.getCardIssuerListAjax
    )


    /* A route for ajax call "/cardissuersforrelation" . */
    app.get(
        "/cardissuersforrelation",
        commonMiddleware.checkTheLoginStatusForAjax,
        creditCardController.getCardIssuerForRelation
    )
    /* The above code is a route for a POST request. The route is "/cardIssuersInApplication". The
    route is handled by the applicationController.getCardIssuersPresentInCardApplications function. */
    app.post(
        "/cardIssuersInApplication",
        commonMiddleware.checkTheLoginStatusForAjax,
        applicationController.getCardIssuersPresentInCardApplications
    )
    /* The above code is a route that is used to get credit cards by issuer. */
    app.post(
        "/creditcardbyissuer-ajax",
        commonMiddleware.checkTheLoginStatusForAjax,
        creditCardController.getCreditcardsByIssuerAjax
    )
    /* The above code is a route for ajax call"/cardapplicationsnameforrelation" . */
    app.get(
        "/cardapplicationsnameforrelation",
        commonMiddleware.checkTheLoginStatusForAjax,
        userController.getCardApplicationsForRelation
    )

    /* The above code is a route for ajax call "/referralnamesforrelation" . */
    app.get(
        "/referralnamesforrelation",
        commonMiddleware.checkTheLoginStatusForAjax,
        userController.getRefferalNamesForRelation
    )

    /* ===========>>>>>>>>>    Notifications Scheduling routes are going to be  here....   <<<<<<<<<<<======================= */

    /* Creating a route for the schedule-notifications page. */
    app.get(
        "/schedule-notifications",
        commonMiddleware.checkTheLoginStatus,
        notificationController.scheduleNotificationsPage
    )

    /* Creating a route for the view-scheduled-notifications page. */
    app.get(
        "/view-scheduled-notifications",
        commonMiddleware.checkTheLoginStatus,
        notificationController.viewScheduledNotificationsPage
    )

    /* The above code is a route handler for the POST request. It is a route handler for the route
    "/schedule-notfications-formdata". It is a route handler for the route
    "/schedule-notfications-formdata" and it is a route handler for the route
    "/schedule-notfications-formdata". */
    app.post(
        "/schedule-notifications-formdata",
        commonMiddleware.checkTheLoginStatusForAjax,
        notificationController.postScheduleNotificationFormData
    )

    /* The above code is a route for the view-scheduled-notifications-data page. */
    app.post(
        "/view-scheduled-notifications-data",
        commonMiddleware.checkTheLoginStatusForAjax,
        notificationController.getScheduledNotificationsData
    )

    /* ===========>>>>>>>>>    Admin User routes here....   <<<<<<<<<<<======================= */

    // admin users here...

    /* The above code is a route that is used to get the data for the admin users page. */
    app.get(
        "/admin-users-data",
        commonMiddleware.checkTheLoginStatusForAjax,
        adminUsers.getUserAdminData
    )

    /* Creating a route for the admin-users page. */
    app.get(
        "/admin-users",
        commonMiddleware.checkTheLoginStatus,
        adminUsers.userAdminList
    )

    /* A route for the admin user roles. */
    app.get(
        "/admin-user-roles",
        commonMiddleware.checkTheLoginStatusForAjax,
        adminUsers.getUserAdminRoles
    )

    /* Adding a new admin user. */
    app.post(
        "/admin-add-new-user",
        commonMiddleware.checkTheLoginStatusForAjax,
        adminUsers.addNewAdminUser
    )

    /* The above code is a route that is used to update a user. */
    app.post(
        "/admin-update-user",
        commonMiddleware.checkTheLoginStatusForAjax,
        adminUsers.updateAdminUser
    )

    /* Adding a new role to the database. */
    app.post(
        "/admin-add-role",
        commonMiddleware.checkTheLoginStatusForAjax,
        adminUsers.addNewRole
    )

    // permissions here....
    /* Getting all the permissions from the database. */
    app.get(
        "/admin-permission",
        commonMiddleware.checkTheLoginStatus,
        adminUsers.getAllPermissions
    )

    /* A route that is used to get all the permissions data. */
    app.get(
        "/admin-permission-data",
        commonMiddleware.checkTheLoginStatus,
        adminUsers.getAllPermissionsData
    )

    /* Creating a new route for the admin to create a new permission. */
    app.post(
        "/admin-post-new-permission",
        commonMiddleware.checkTheLoginStatusForAjax,
        adminUsers.postNewPermission
    )

    /* The above code is a route for updating the permission data of a user. */
    app.post(
        "/admin-update-permission",
        commonMiddleware.checkTheLoginStatusForAjax,
        adminUsers.updatePermissionDataController
    )

    /* The above code is a route for the admin to remove a permission from a user. */
    app.post(
        "/admin-remove-permssion",
        commonMiddleware.checkTheLoginStatusForAjax,
        adminUsers.removePermission
    )


    // admin user roles routes header....


    /* Getting the admin-roles-page. */
    app.get(
        "/admin-roles-page",
        commonMiddleware.checkTheLoginStatus,
        adminUsers.getUserAdminRolesPageUi
    )


    ////////////////////////////////////////////

    ///////SEQUENCES////////////////

    /* Creating a route for the card issuer sequence UI. */
    app.get(
        "/card-issuer-sequences",
        sequenceController.cardIssuerSequenceUI
    )

    /* Creating a route for the credit card sequence UI. */
    app.get(
        "/credit-card-sequences",
        sequenceController.creditCardSequenceUI
    )
    /* A GET request to the route /apply-now-card-issuers. It is calling the getCardIssuersWithApplyNow
    function in the sequenceController.js file. */
    app.get(
        "/apply-now-card-issuers",
        sequenceController.getCardIssuersWithApplyNow
    )
    /* Creating a route for the card issuers sequence. */
    app.get(
        "/card-issuers-sequence",
        sequenceController.getCardIssuersSequence
    )
    /* The above code is a POST request to the credit-cards-sequence route. It is calling the
    getCreditCardsSequenceByCardIssuer function in the sequenceController.js file. */
    app.post(
        "/credit-cards-sequence",
        sequenceController.getCreditCardsSequenceByCardIssuer
    )
    /* Updating the sequence of the card issuers. */
    app.put(
        "/update-card-issuer-sequence",
        sequenceController.updateCardIssuersSequence
    )

    /* A GET request to the route "/apply-now-credit-card" and it is calling the function
    getCreditCardsWithApplyNow from the sequenceController. */
    app.get(
        "/apply-now-credit-card",
        sequenceController.getCreditCardsWithApplyNow
    )
    /* Updating the credit card apply sequence. */
    app.put(
        "/update-credit-card-apply-sequence",
        sequenceController.updateCreditCardsApplySequence
    )
    /* Updating the sequence of the credit cards. */
    app.put(
        "/update-credit-card-sequence",
        sequenceController.updateCreditCardsSequence
    )
    /* The above code is creating a route for the uploadFileController.uploadFile function. */
    app.post(
        "/uploadFile",
        // uploadFileController.uploadToSpaces,
        uploadFileController.uploadFile
    )



    /* =============>>>>>>>>>>>  CIBIL CONDITIONS ROUTES HERE..........  <<<<<<<<<<<<================= */


    /* Rendering the card-issuers-cibil-conditions page. */
    app.get(
        "/card-issuers-cibil-conditions",
        commonMiddleware.checkTheLoginStatus,
        cibilConditionsController.renderCardIssuersCibilConditions
    );

    app.get(
        "/card-issuers-cibil-conditions-add-new",
        commonMiddleware.checkTheLoginStatus,
        cibilConditionsController.renderCardIssuersCibilConditionsAddNew
    );
    app.post(
        "/card-issuers-cibil-conditions-add-new-ajex",
        commonMiddleware.checkTheLoginStatus,
        cibilConditionsController.addNewDataAjex
    );

    app.post(
        "/credit-card-cibil-conditions-add-new-ajex",
        commonMiddleware.checkTheLoginStatus,
        cibilConditionsController.addNewCreditCardDataAjex
    );

    /* Rendering the credit-cards-cbil-conditions page. */
    app.get(
        "/credit-cards-cibil-conditions",
        commonMiddleware.checkTheLoginStatus,
        cibilConditionsController.renderCreditCardsCibilConditions
    );

    app.get(
        "/credit-cards-cibil-conditions-add-new",
        commonMiddleware.checkTheLoginStatus,
        cibilConditionsController.renderCreditCardsCibilConditionsAddNew
    );


    /* ===========>>>>>>>>>    Invalid routes here....   <<<<<<<<<<<======================= */

    /* This is a catch all route. If the user enters a URL that does not match any of the routes above,
    this route will be executed. */
    app.get("*", function (req, res, next) {
        res.render("error/notFound")
    })
}