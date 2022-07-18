const router = require('express').Router();
const tareasController = require('../controller/tareasController');


router.get('/', tareasController.getTareas);
router.post('/add', tareasController.createTarea);
router.get('/:id', tareasController.getTareaById);
router.put('/update/:id', tareasController.updateTarea);
router.delete('/delete/:id', tareasController.deleteTarea);


module.exports = router;