const router = require('express').Router();
const usersController = require('../controller/userController');

router.get('/', usersController.listarUsuarios);
router.put('/update/:id', usersController.updateUsuario);
router.delete('/delete/:id', usersController.eliminarUsuario);

module.exports = router;