const router = require('express').Router();
const planillaController = require('../controller/planillaController');

router.get('/', planillaController.getPlanillas);
router.post('/add', planillaController.createPlanilla);
router.put('/update/:id', planillaController.updatePlanilla);
router.delete('/delete/:id', planillaController.deletePlanilla);
router.get('/pdf/:id', planillaController.generarPdf);

module.exports = router;