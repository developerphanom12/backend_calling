const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const db = require('../config/database')
const sendemail = require('../mail/tellcallersendemail')


function adminregister(adminData) {
  return new Promise((resolve, reject) => {
    const insertSql = `INSERT INTO admin(username, password, role) 
                           VALUES (?, ?, ?)`;

    const values = [
      adminData.username,
      adminData.password,
      'admin'
    ];

    db.query(insertSql, values, (error, result) => {
      if (error) {
        console.error('Error adding admin:', error);
        reject(error);
      } else {
        const adminId = result.insertId;

        const selectSql = 'SELECT * FROM admin WHERE id = ?';
        db.query(selectSql, [adminId], (selectError, selectResult) => {
          if (selectError) {
            console.error('Error retrieving admin data:', selectError);
            reject(selectError);
          } else {
            const adminData = selectResult[0];
            resolve(adminData);
          }
        });
      }
    });
  });
}






function loginadmin(username, password, callback) {
  const query = 'SELECT * FROM admin  WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      return callback(err, null);
    }

    if (results.length === 0) {
      return callback(null, { error: 'Invalid user' });
    }

    const user = results[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return callback(null, { error: 'Invalid password' });
    }
  
    const secretKey = 'secretkey';
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey);
    console.log('token', token)
    return callback(null, {
      data: {

        id: user.id,
        username: user.username,
        password: user.password,
        role: user.role,
        token: token,

      }
    });
  });
}



async function telecallerregister(telecaller) {
  return new Promise((resolve, reject) => {
    const { username, passsword, email } = telecaller;

    // Hash the password
    bcrypt.hash(passsword, 10, (err, hashedPassword) => {
      if (err) {
        reject(err);
        logger.error('Error hashing password:', err);
      } else {
        const query = `
              INSERT INTO tellecaler_data 
              (username,passsword,email)
              VALUES (?, ?, ?)      
              `;

        db.query(query, [username, hashedPassword, email,], (error, result) => {
          if (error) {
            reject(error);
            console.error('Error registering telecaller:', error);
          } else {
            const insertedStaff = {
              id: result.insertId,
              username,
              passsword: hashedPassword,
              email,
              

            };

            sendemail.sendRegistrationEmail(email, username, passsword);

            resolve(insertedStaff);
            console.log('telecaller registered successfully', insertedStaff);
          }
        });
      }
    });
  });
}



function logintellecaller(username, passsword, callback) {
  const query = 'SELECT * FROM tellecaler_data  WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      return callback(err, null);
    }

    if (results.length === 0) {
      return callback(null, { error: 'Invalid user' });
    }

    const user = results[0];

    const passwordMatch = await bcrypt.compare(passsword, user.passsword);

    if (!passwordMatch) {
      return callback(null, { error: 'Invalid password' });
    }

    if (user.is_deleted === 1) {
      return callback(null, { error: 'User not found' });
  }
  if (user.is_approved !== 1) {
      return callback(null, { error: 'You are not approved at this moment' });
  }

    const secretKey = 'secretkey';
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey);
    console.log('token', token)
    return callback(null, {
      data: {
        id: user.id,
        username: user.username,
        password: user.passsword,
        role: user.role,
        token: token,

      }
    });
  });
}


const deletetellecalller = (is_deleted, userId, callback) => {
  const selectQuery = 'SELECT email FROM tellecaler_data WHERE id = ?';
  const updateQuery = 'UPDATE tellecaler_data SET is_deleted = ? WHERE id = ?';
  try {
    db.query(selectQuery, [userId], (selectError, results) => {

      if (selectError) {
        console.error('Select error:', selectError);
        return callback({ status: 500, error: 'Failed to delete telecaller.' });
      }

      if (!results || results.length === 0 || !results[0].email) {
        console.error('Telecaller not found or email structure is unexpected:', results);
        return callback({ error: 'Telecaller not found' });
      }

      const email = results[0].email;
      console.log('email', email)
      db.query(updateQuery, [is_deleted, userId], (updateError, updateResult) => {
        if (updateError) {
          console.error('Error updating telecaller status:', updateError);
          return callback({ status: 500, error: 'Failed to update telecaller status.' });
        }

        if (updateResult.affectedRows === 0) {
          console.error('Telecaller not found in the update:', updateResult);
          return callback({ error: 'Telecaller not found' });
        }

        callback(null, { email, message: 'Telecaller deleted successfully' });
      });

    });
  } catch (error) {
    res.status(error.status || 500).json(error);
  }
};



function getalldataofclient() {
  return new Promise((resolve, reject) => {
      const query = `
      SELECT DISTINCT
          c.id,
          c.username,
          u.id,
          u.tellecaller_id AS id,
          u.client_name,
          u.call_schedule_date,
          u.call_status,
          un.ca_id,
          un.tellecaller_id AS id,
          un.ca_name
      FROM  tellecaler_data c
      LEFT JOIN client_data_report u ON c.id = u.tellecaller_id
      LEFT JOIN client_ca_data un ON c.id = un.tellecaller_id
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        console.error('Error getting data by ID:', error); // Log the error
      } else {
        if (results.length === 0) {
          resolve(null);
        } else {
          const userWithAddress = {
            user_id: results[0].id,
            username: results[0].username,
            client_data: {
              client_name:results[0].client_name,
              call_schedule_date:results[0].call_schedule_date,
              call_status:results[0].call_status,
            },
            clientCA_data:{
               client_id : results[0].ca_id,
               ca_name : results[0].ca_name
            }
          };
          resolve(userWithAddress);
          console.log('data retrieved by ID successfully');
        }
      }
    });
  });
};
module.exports = {
  adminregister,
  loginadmin,
  telecallerregister,
  logintellecaller,
  deletetellecalller,
  getalldataofclient
};
