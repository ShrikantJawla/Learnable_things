let factoryController = require('../controller/factoryController')
let router = require('express').Router()

router.get('/fields', factoryController.getAllFieldsController)
router.put('/update-table', factoryController.updateTableById)
router.put('/update-tele-table', factoryController.updateTeleTableById)
router.get('/distinctValues', factoryController.getDistinctValuesController)
router.post('/permit-all', factoryController.permitAll)
router.post('/permit-by-id', factoryController.permitById)
router.post('/add-remove-telecallers-permissions', factoryController.addOrRemovePermissionsFromTelecallers)
router.post('/add-remove-single-telecaller-permission', factoryController.addOrRemovePermissionFromSingleTelecaller)
router.post('/reassign-telecaller-permission', factoryController.reassignPermissionsFromTeleCallers);
router.get('/get-tele-application-data-by-id', factoryController.getApplicationDataById)

// SMS & SMS Templates Routes
router.post('/send-status-sms', factoryController.sendStatusSms);
router.post('/send-status-sms-icici', factoryController.sendStatusSmsIcici);
router.post('/get-sms-template', factoryController.getSmsTemplate);
router.post('/add-sms-template', factoryController.addSmsTemplate);
router.post('/edit-sms-template', factoryController.editSmsTemplate);
router.post('/delete-sms-template', factoryController.deleteSmsTemplate);

// Get User 
router.get('/get-user', factoryController.getUser);

// Route to punch in tele callers
router.post('/daily-punch-in' , factoryController.dailyPunchIn)
module.exports = router