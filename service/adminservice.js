const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const db = require('../config/database')
const sendemail = require('../mail/tellcallersendemail')
const ExcelJS = require('exceljs');
const path = require('path')

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


const deletetellecalller = (is_deleted, id, callback) => {
  const selectQuery = 'SELECT email FROM tellecaler_data WHERE id = ?';
  const updateQuery = 'UPDATE tellecaler_data SET is_deleted = ? WHERE id = ?';
  try {
    db.query(selectQuery, [id], (selectError, results) => {

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
      db.query(updateQuery, [is_deleted, id], (updateError, updateResult) => {
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
        c.id as cd,
        c.client_name,
        c.company_name,
        c.call_status,
        u.id,
        u.username,
        un.ca_id,
        un.ca_name
      FROM client_data_report c
      LEFT JOIN tellecaler_data u ON c.tellecaller_id = u.id
      LEFT JOIN client_ca_data un ON c.ca_id = un.ca_id
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
      } else {
        const clientsData = results.map(result => ({
          cd: result.cd,
          client_name: result.client_name,
          company_name: result.company_name,
          call_status: result.call_status,
          user: {
            id: result.id,
            username: result.username
          },
          ca: {
            ca_id: result.ca_id,
            ca_name: result.ca_name
          }
        }));

        if (clientsData.length === 0) {
          resolve(null);
        } else {
          resolve(clientsData);
          console.log('Data retrieved successfully');
        }
      }
    });
  });
}


function getbyteleId(userId) {
  return new Promise((resolve, reject) => {
    const query = `
    SELECT DISTINCT
    c.id as cd,
    c.client_name,
    c.company_name,
    c.call_status,
    u.id,
    u.username,
    un.ca_id,
    un.ca_name
  FROM client_data_report c
  LEFT JOIN tellecaler_data u ON c.tellecaller_id = u.id
  LEFT JOIN client_ca_data un ON c.ca_id = un.ca_id
  WHERE c.tellecaller_id = ?;
    `;

    db.query(query, [userId], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
      } else {
        const clientsData = results.map(result => ({
          cd: result.cd,
          client_name: result.client_name,
          company_name: result.company_name,
          call_status: result.call_status,
          user: {
            id: result.id,
            username: result.username
          },
          ca: {
            ca_id: result.ca_id,
            ca_name: result.ca_name
          }
        }));

        if (clientsData.length === 0) {
          resolve(null);
        } else {
          resolve(clientsData);
          console.log('Data retrieved successfully');
        }
      }
    });
  });
}

// getalldataofclient()
//     .then((result) => {
//         if (result) {
//             console.log('Data:', result);
//         } else {
//             console.log('No data found.');
//         }
//     })
//     .catch((error) => {
//         console.error('Error:', error);
//     });

const excelFileDirectory = path.join(__dirname, 'uploadss');


async function clientdatainexcelsheet(userid) {
  try {
    const query = `
    SELECT DISTINCT
      a.client_name,
      a.company_name,
      a.call_schedule_date,
      a.call_status,
      u.id AS tellecaller_id,
      u.username,
      c.ca_name,
      c.ca_number,
      c.ca_accountant_number,
      c.ca_id
    FROM client_data_report a
    INNER JOIN tellecaler_data u ON a.tellecaller_id = u.id
    LEFT JOIN client_ca_data c ON a.ca_id = c.ca_id	
    WHERE u.id = ?
    ;`;

    const queryPromise = new Promise((resolve, reject) => {
      db.query(query, [userid], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const results = await queryPromise;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('AllApplications');

    worksheet.columns = [
      { header: 'Client Name', key: 'client_name' },
      { header: 'Company Name', key: 'company_name' },
      { header: 'Schedule Date', key: 'call_schedule_date' },
      { header: 'Call Status', key: 'call_status' },
      { header: 'CA Name', key: 'ca_name' },
      { header: 'CA Phone Number', key: 'ca_number' },
      { header: 'CA id Number', key: 'ca_id' },


    ];

    results.forEach((row) => {
      const rowData = {
        client_name: row.client_name,
        company_name: row.company_name,
        call_schedule_date: row.call_schedule_date,
        call_status: row.call_status,
        ca_name: row.ca_name,
        ca_number: row.ca_number,
        ca_id: row.ca_id
      };
      worksheet.addRow(rowData);
    });

    const excelFileName = `all_applications_${new Date().getTime()}.xlsx`;
    const excelFilePath = path.join(excelFileDirectory, excelFileName);

    await workbook.xlsx.writeFile(excelFilePath);

    console.log(`Excel file saved as ${excelFilePath}`);
    return excelFilePath;
  } catch (error) {
    console.error('Error executing or saving Excel file:', error);
    throw error;
  }
}



async function getexcelalldata(userRole) {
  try {
    const query = `
    SELECT DISTINCT
      a.client_name,
      a.company_name,
      a.call_schedule_date,
      a.call_status,
      u.id AS tellecaller_id,
      u.username,
      c.ca_name,
      c.ca_number,
      c.ca_accountant_number,
      c.ca_id
    FROM client_data_report a
    INNER JOIN tellecaler_data u ON a.tellecaller_id = u.id
    LEFT JOIN client_ca_data c ON a.ca_id = c.ca_id	
    ;`;
    const queryPromise = new Promise((resolve, reject) => {
      db.query(query, [userRole], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const results = await queryPromise;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('AllApplications');

    worksheet.columns = [
      { header: 'Client Name', key: 'client_name' },
      { header: 'Company Name', key: 'company_name' },
      { header: 'Schedule Date', key: 'call_schedule_date' },
      { header: 'Call Status', key: 'call_status' },
      { header: 'CA Name', key: 'ca_name' },
      { header: 'CA Phone Number', key: 'ca_number' },
      { header: 'CA id Number', key: 'ca_id' },


    ];

    results.forEach((row) => {
      const rowData = {
        client_name: row.client_name,
        company_name: row.company_name,
        call_schedule_date: row.call_schedule_date,
        call_status: row.call_status,
        ca_name: row.ca_name,
        ca_number: row.ca_number,
        ca_id: row.ca_id
      };
      worksheet.addRow(rowData);
    });

    const excelFileName = `all_applications_${new Date().getTime()}.xlsx`;
    const excelFilePath = path.join(excelFileDirectory, excelFileName);

    await workbook.xlsx.writeFile(excelFilePath);

    console.log(`Excel file saved as ${excelFilePath}`);
    return excelFilePath;
  } catch (error) {
    console.error('Error executing or saving Excel file:', error);
    throw error;
  }
}


function getdatawithstatus(callStatus) {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT DISTINCT
          c.id,
          c.username,
          u.id AS telecaller_id,
          u.client_name,
          u.call_schedule_date,
          u.call_status,
          un.ca_id,
          un.ca_name
        FROM  tellecaler_data c
        LEFT JOIN client_data_report u ON c.id = u.tellecaller_id
        LEFT JOIN client_ca_data un ON u.ca_id = un.ca_id
        WHERE u.call_status = ?
      `;

    db.query(query, [callStatus], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
      } else {
        const hotLeads = results.map(result => ({
          telecaller_id: result.telecaller_id,
          username: result.username,
          client_data: {
            client_name: result.client_name,
            call_schedule_date: result.call_schedule_date,
            call_status: result.call_status,
          },
          clientCA_data: {
            client_id: result.ca_id,
            ca_name: result.ca_name,
          },
        }));

        resolve(hotLeads);
        console.log(' leads retrieved successfully');
      }
    });
  });
};



function getdataWIthtelleid(callStatus,UserId) {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT DISTINCT
          c.id,
          c.username,
          u.id AS telecaller_id,
          u.client_name,
          u.call_schedule_date,
          u.call_status,
          un.ca_id,
          un.ca_name
        FROM  tellecaler_data c
        LEFT JOIN client_data_report u ON c.id = u.tellecaller_id
        LEFT JOIN client_ca_data un ON u.ca_id = un.ca_id
        WHERE u.call_status = ? AND u.teLlecaller_id = ?
      `;

    db.query(query, [callStatus,UserId], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
      } else {
        const hotLeads = results.map(result => ({
          telecaller_id: result.telecaller_id,
          username: result.username,
          client_data: {
            client_name: result.client_name,
            call_schedule_date: result.call_schedule_date,
            call_status: result.call_status,
          },
          clientCA_data: {
            client_id: result.ca_id,
            ca_name: result.ca_name,
          },
        }));

        resolve(hotLeads);
        console.log(' leads retrieved successfully');
      }
    });
  });
};


function getAlltellecalller() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * 
      FROM tellecaler_data WHERE is_deleted = 0
    
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
      } else  {
        resolve(results)
      };
    })
  })
}




function getallshareidmatch() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * 
      FROM  client_data_report WHERE is_deleted = 0
    
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
      } else  {
        resolve(results)
      };
    })
  })
}
const getClientDataForCurrentWeek = (currentWeekStartDate,currentWeekEndDate) => {
  return new Promise((resolve, reject) => {
    
    const query = `
      SELECT *
      FROM client_data_report 
      WHERE call_schedule_date BETWEEN ? AND ?
    `;

    db.query(query, [currentWeekStartDate, currentWeekEndDate]  , (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};



function getsharedata(userId) {
  return new Promise((resolve, reject) => {
    const query = `
    SELECT DISTINCT
      c.id as cd,
      c.reciever_id,
      c.share_id,
      ac.id as cd,
      ac.company_name,
      ac.client_name,
      ac.call_schedule_date,
      ac.tellecaller_id,
      ac.call_status,
      u.id,
      u.username
    FROM sharing_data c
    LEFT JOIN client_data_report ac ON c.share_id = ac.tellecaller_id
    LEFT JOIN tellecaler_data u ON c.share_id = u.id
    WHERE c.reciever_id = ? AND ac.call_status = c.call_status;
  `;
  
    db.query(query, [userId], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
      } else {
        const clientsData = results.map(result => ({
          cd: result.cd,
          reciever_id: result.reciever_id,
          share:{
            cd: result.cd,
            call_status: result.call_status,
            company_name :result.company_name,
            client_name: result.client_name,
            call_schedule_date : result.call_schedule_date
          },
          user: {
            id: result.reciever_id,
            username: result.username
          },
          
        }));

        if (clientsData.length === 0) {
          resolve(null);
        } else {
          resolve(clientsData);
          console.log('Data retrieved successfully');
        }
      }
    });
  });
}


const getclientdatabyidWeek = (currentWeekStartDate,currentWeekEndDate,userId)  => {
  return new Promise((resolve, reject) => {
    
    const query = `
      SELECT *
      FROM client_data_report 
      WHERE tellecaller_id = ? AND call_schedule_date BETWEEN ? AND ?
    `;

    db.query(query, [currentWeekStartDate, currentWeekEndDate,userId]  , (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};



function getallshareidmatchids() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        au.id AS cds,
        au.username,
        MIN(c.client_name) AS client_name
      FROM client_data_report c
      LEFT JOIN tellecaler_data au ON c.tellecaller_id = au.id
      GROUP BY au.id, au.username;
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        reject(error);
      } else {
        const data = results.map((row) => ({
          cds: row.cds,
          username: row.username,
          client_name: row.client_name,
        }));

        resolve(data);

        console.log("All data retrieved successfully");
      }
    });
  });
}

module.exports = {
      adminregister,
      loginadmin,
      telecallerregister,
      logintellecaller,
      deletetellecalller,
      getalldataofclient,
      getbyteleId,
      clientdatainexcelsheet,
      getexcelalldata,
      getdatawithstatus,
      getAlltellecalller,
      getClientDataForCurrentWeek,
      getsharedata,
      getclientdatabyidWeek,
      getdataWIthtelleid,
      getallshareidmatch,
      getallshareidmatchids
    };

