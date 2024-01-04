const  express = require('express')
const router = express.Router();
const telecallerCOntroller = require('../controller/telecallercontroller');
const authenticateToken = require('../auhtentication/authentication');
const { upload } = require('../multer/multer');
const { validatesharedata } = require('../validation/middleware');


router.post('/addclientdata',authenticateToken,upload.single('attach_file'), telecallerCOntroller.Clientdata)

 router.get('/addCAdata/:id',authenticateToken, telecallerCOntroller.getTotalSalesPerWeekAndMonth)

 router.get('/admincheckaalsales',authenticateToken, telecallerCOntroller.checkadminallsales)

 router.get('/getbyid/:cd', authenticateToken, telecallerCOntroller.getdatatelleId)

 router.get('/getbyids/:id', authenticateToken, telecallerCOntroller.getUpcomingINweek)

 router.post('/sharedata',authenticateToken, validatesharedata ,telecallerCOntroller.shareData)

 router.get('/refrencedata', authenticateToken, telecallerCOntroller.shareData)


module.exports = router;
