const  express = require('express')
const router = express.Router();
const telecallerCOntroller = require('../controller/telecallercontroller');
const { validateclientdata, validatecadata } = require('../validation/middleware');
const authenticateToken = require('../auhtentication/authentication');
const { upload } = require('../multer/multer');


router.post('/addclientdata',authenticateToken,upload.single('attach_file'), telecallerCOntroller.Clientdata)

// router.post('/addCAdata',authenticateToken,validatecadata, telecallerCOntroller.clientCAdata)


module.exports = router;
