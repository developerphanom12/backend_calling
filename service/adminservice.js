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
                          phone_number,
                        
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



module.exports = {
  adminregister,
  loginadmin,
  telecallerregister,
  logintellecaller
}