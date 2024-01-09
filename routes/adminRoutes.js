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

router.get('/getalldataclient', authenticateToken, admincontroller.getdataclientwithca)

router.get('/getexcelsheetdata', authenticateToken, admincontroller.getexcelshheetdata)

router.get('/callstatuscheck/:callStatus',authenticateToken, admincontroller.getcallstatus)

router.get('/getalltelle', authenticateToken, admincontroller.alltellecaller)

router.get('/callcount', authenticateToken,admincontroller.getAllCallStatusCount)

router.get('/getweekdata',authenticateToken, admincontroller.getUpcomingmeeting)

router.get('/refrencedata', authenticateToken, admincontroller.getdataSHare)

router.get('/getallrecv', authenticateToken, admincontroller.getallrecievr)

router.get('/getshareidmatch', admincontroller.Sharedatawhereid)


module.exports = router;

