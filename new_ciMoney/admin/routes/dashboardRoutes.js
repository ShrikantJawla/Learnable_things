

const homeController = require('../controller/home/homeController');
const router = require('express').Router();



router.get('/', homeController.home);

// Getting Dashboard Data
router.post('/form-filled-info', function(req , res ){
    res.send([]);
});
router.post('/credit-card-info', homeController.creditCardInfo);
router.post('/get-bank-data', homeController.getBankData);

router.post('/get-tele-stats', homeController.getTeleStatsData);


module.exports = router;

