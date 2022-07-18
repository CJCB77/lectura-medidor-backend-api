const router = require('express').Router();
const viviendaController = require('../controller/viviendaController');

router.get('/', viviendaController.getViviendas);
router.post('/add', viviendaController.createVivienda);
router.get('/:id', viviendaController.getViviendaById);
router.put('/update/:codigo', viviendaController.updateVivienda);
router.delete('/delete/:id', viviendaController.deleteVivienda);

module.exports = router;