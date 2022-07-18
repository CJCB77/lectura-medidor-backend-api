const Router = require('express').Router;
const router = Router();
const registrosController = require('../controller/registrosController');

//Multer para subir imagenes
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    }
    , filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname)
    }
})

const upload = multer({ storage: storage });

router.get('/',registrosController.getRegistros);
router.get('/complete',registrosController.getRegistroCompleto);
router.post('/add',upload.single('imagen'),registrosController.createRegistro);

router.get('/:id',registrosController.getRegistroById);
router.put('/update/:id',registrosController.updateRegistro)
router.delete('/delete/:id',registrosController.deleteRegistro);


                                

module.exports = router;