const router = require('express').Router();
const clienteController = require('../controller/clienteController');

router.get('/',clienteController.getClientes);
router.post('/add',clienteController.createCliente);
router.put('/update/:id',clienteController.updateCliente);
router.delete('/delete/:id',clienteController.deleteCliente);

module.exports = router;