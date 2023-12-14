const admin = require('../service/adminservice')
const messages = require('../messages/telecaller');
const bcrypt = require('bcrypt')
let saltRounds = 10;
const accountblock = require('../mail/deleteemail');
const telecaller = require('../messages/telecaller');
const ExcelJS = require('exceljs');




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
        status: 201,
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

  const { username, passsword, email } = req.body;

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
        status: 201,
        data: result.data,
        token: result.token,
      });

    });
  } catch (error) {
    console.error('Error logging in telecaller:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
};




const userdelete = async (req, res) => {
  const { userId, is_deleted } = req.body;

  try {
    if (req.user.role !== 'admin') {
      throw {
        status: 403,
        error: 'Forbidden. Only admin can remove telecaller.'
      };
    }

    if (is_deleted !== 0 && is_deleted !== 1) {
      throw {
        status: 400,
        error: 'Invalid is_deleted value. It must be either 0 or 1.'
      };
    }

    admin.deletetellecalller(is_deleted, userId, (error, result) => {
      if (error) {
        console.error('Error updating telecaller status:', error);
        throw {
          status: 500,
          error: 'Failed to update telecaller status.'
        };
      }

      console.log('telecaller status updated successfully');

      if (is_deleted === 1) {
        accountblock.sendaccountinfo(result.email);
      }

      res.status(201).json({
        status: 201,
        message: 'telecaller delete permanently notify on email'
      });
    });
  } catch (error) {
    res.status(error.status || 500).json(error);
  }
};




const getdataclientwithca = async (req, res) => {
  const userId = req.user.id;
  console.log('USERID', userId);

  try {
    if (req.user.role === 'admin') {
      const clientdata = await admin.getalldataofclient();

      if (clientdata) {
        res.status(201).json({
          message: "Data fetched successfully",
          status: 201,
          data: clientdata
        });
      } else {
        const responseMessage = 'No data found for the provided ID telecaller id.';
        res.status(404).json({
          message: responseMessage,
          status: 404
        });
      }
    } else if (req.user.role === 'telecaller') {
      const clientdata = await admin.getbyteleId(userId);

      if (clientdata) {
        res.status(201).json({
          message: "Data fetched successfully",
          status: 201,
          data: clientdata
        });
      } else {
        const responseMessage = 'No data found for the provided ID telecaller id.';
        res.status(404).json({
          message: responseMessage,
          status: 404
        });
      }
    } else {
      return res.status(403).json({ status: 403, error: 'Forbidden for regular users' });
    }
  } catch (error) {
    console.error('Error in getdataclientwithca:', error);
    res.status(500).json({
      message: 'Internal server error',
      status: 500
    });
  }
};



const getexcelshheetdata = async (req, res) => {
  const userid = req.user.id;
  const userRole = req.user.role;
  console.log('udfshdfsd', userid, userRole)
  try {
    let excelFilePath;

    if (userRole === 'admin') {
      excelFilePath = await admin.getexcelalldata(userRole);
    }
    else if (userRole === 'telecaller') {
      excelFilePath = await admin.clientdatainexcelsheet(userid);
    }
    else {
      throw new Error('Unauthorized access'); //
    }

    const excelFileName = `user_data_${new Date().getTime()}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename="${excelFileName}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.sendFile(excelFilePath);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error generating or serving Excel file');
  }
};
const getcallstatus = async (req, res) => {
  try {
    const { callStatus } = req.body;
    const validStatusValues = ['cold_lead', 'hot_lead', 'prospective_client', 'ghost_client', 'negative_client', 'close_status'];

    if (!validStatusValues.includes(callStatus)) {
      throw {
        status: 400,
        error: 'Invalid callStatus value. It must be one of: cold_lead, hot_lead, prospective_client, ghost_client, negative_client, close_status.'
      };
    }

    const hotLeads = await admin.getdatawithstatus(callStatus);

    if (hotLeads.length === 0) {
      res.status(404).json({
        message: 'No data found for this lead',
        status: 404,
      });
    } else {
      res.status(200).json({
        message: 'Call status leads retrieved successfully',
        status: 200,
        data: hotLeads,
      });
    }
  } catch (error) {
    console.error(error);

    if (error.status === 400) {
      res.status(400).json({ error: 'Bad Request: ' + error.error });
    } else {
      res.status(500).json({ error: 'Internal Server Error: An error occurred during hot leads retrieval.' });
    }
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  telecallerregister,
  logintellecaller,
  userdelete,
  getdataclientwithca,
  getexcelshheetdata,
  getcallstatus
}