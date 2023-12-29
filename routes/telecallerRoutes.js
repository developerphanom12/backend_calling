const  express = require('express')
const router = express.Router();
const telecallerCOntroller = require('../controller/telecallercontroller');
const authenticateToken = require('../auhtentication/authentication');
const { upload } = require('../multer/multer');


router.post('/addclientdata',authenticateToken,upload.single('attach_file'), telecallerCOntroller.Clientdata)

 router.get('/addCAdata/:id',authenticateToken, telecallerCOntroller.getTotalSalesPerWeekAndMonth)

 router.get('/admincheckaalsales',authenticateToken, telecallerCOntroller.checkadminallsales)

 router.get('/getbyid/:cd', authenticateToken, telecallerCOntroller.getdatatelleId)
module.exports = router;
