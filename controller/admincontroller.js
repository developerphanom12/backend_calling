const admin = require('../service/adminservice')
const messages = require ('../messages/')
const registerAdmin = async (req, res) => {

    try {
      const { username, password } = req.body;
  
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const adminId = await admin.adminregister({ username, password: hashedPassword });
  
      res.status(201).json({
        message: 'Admin registration successful',
        status: 201,
        data: adminId
      });
    } catch (error) {
      console.error('Error registering admin:', error);
      res.status(500).json({ error: 'Failed to register admin' });
    }
  
  }
  



const loginAdmin = async (req, res) => {
    const { username, password } = req.body;
    try {
      admin.loginadmin(username, password, (err, result) => {
        if (err) {
          console.error('Error:', err);
          return res.status(500).json({ error: 'An internal server error occurred' });
        }
  
        if (result.error) {
          return res.status(401).json({ error: result.error });
        }
  
  
        res.status(201).json({
          message: 'admin login success',
          status :201,
          data: result.data,
          token: result.token,
        });
  
      });
    } catch (error) {
      console.error('Error logging in admin:', error);
      res.status(500).json({ error: 'An internal server error occurred' });
    }
  };
  











  module.exports = {
    registerAdmin,
    loginAdmin
  }