const admin = require('../service/adminservice')
const messages = require ('../messages/telecaller');
const bcrypt = require('bcrypt')
let saltRounds = 10;

const handleServerError = (res, error) => {
  console.error('Internal server error:', error);
  res.status(500).json({ error: 'Internal server error' });
};



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
  


  const telecallerregister = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden for regular users' });
    }
    console.log('User Role:', req.user.role);

    const { username, passsword, email} = req.body;

    try {
        const telecallerdata = await admin.telecallerregister({
          username,
          passsword,
          email,
          
        });


        res.status(messages.USER_API.USER_CREATE.status).json({
            message: messages.USER_API.USER_CREATE.message,
            data: telecallerdata
        });
    } catch (error) {
      console.error('Error register in telecaller:', error);
      res.status(500).json({ error: 'An internal server error occurred' });
    }
};






const logintellecaller = async (req, res) => {
  const { username, passsword } = req.body;
  try {
    admin.logintellecaller(username, passsword, (err, result) => {
      if (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: 'An internal server error occurred' });
      }

      if (result.error) {
        return res.status(401).json({ error: result.error });
      }


      res.status(201).json({
        message: 'telecaller login success',
        status :201,
        data: result.data,
        token: result.token,
      });

    });
  } catch (error) {
    console.error('Error logging in telecaller:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
};







  module.exports = {
    registerAdmin,
    loginAdmin,
    telecallerregister,
    logintellecaller
  }