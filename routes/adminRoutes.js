const  express = require('express')
const router = express.Router();
const admincontroller = require('../controller/admincontroller');
const { validatetelecaller } = require('../validation/middleware');
const authenticateToken = require('../auhtentication/authentication');




router.post('/register', admincontroller.registerAdmin);


router.post('/login', admincontroller.loginAdmin);


router.post('/telecallereg',validatetelecaller,authenticateToken, admincontroller.telecallerregister);



router.post('/telecallerlogin', admincontroller.logintellecaller);


router.post('/deleteuser', authenticateToken, admincontroller.userdelete)

module.exports = router;