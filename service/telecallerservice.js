const db = require("../config/database");

function insertclientdata(
  userId,
  client_name,
  company_name,
  gst_no,
  dob_client,
  client_anniversary,
  call_schedule_date,
  call_status,
  attach_file,
  caId
) {
  return new Promise((resolve, reject) => {
    const query = `
        INSERT INTO client_data_report 
        (tellecaller_id, client_name, company_name, gst_no, dob_client, client_anniversary, call_schedule_date, call_status, attach_file, ca_id)
        VALUES (?, ?, ?,?,?,?,?,?,?,?)
      `;
    db.query(
      query,
      [
        userId,
        client_name,
        company_name,
        gst_no,
        dob_client,
        client_anniversary,
        call_schedule_date,
        call_status,
        attach_file,
        caId,
      ],
      (err, result) => {
        if (err) {
          console.error("Error in insertclientdata query:", err);

          if (err.code === "404") {
            reject("Specific error occurred in insertclientdata query.");
          } else {
            reject(err);
          }
        } else {
          resolve(result.insertId);
        }
      }
    );
  });
}

function insertcadata(
  userId,
  ca_name,
  ca_number,
  ca_accountant_name,
  ca_company_name,
  ca_accountant_number
) {
  return new Promise((resolve, reject) => {
    const query = `
        INSERT INTO client_ca_data
        (tellecaller_id, ca_name, ca_number, ca_accountant_name, ca_company_name, ca_accountant_number)
        VALUES (?, ?, ?,?,?,?)
      `;
    db.query(
      query,
      [
        userId,
        ca_name,
        ca_number,
        ca_accountant_name,
        ca_company_name,
        ca_accountant_number,
      ],
      (err, result) => {
        if (err) {
          console.error("Error in insertAddress query:", err);

          if (err.code === "404") {
            reject("Specific error occurred in insertcadata query.");
          } else {
            reject(err);
          }
        } else {
          resolve(result.insertId);
        }
      }
    );
  });
}

function updatecadata(userId, caId) {
  return new Promise((resolve, reject) => {
    const query = "UPDATE client_data_report SET ca_id = ? WHERE id = ?";
    db.query(query, [caId, userId], (err, result) => {
      if (err) {
        console.error("Error in updatestudentaddress query:", err);

        if (err.code === "404") {
          reject("Specific error occurred in updatestudentaddress query.");
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });
}

async function getTotalSalesPerWeekAndMonth(telecallerId, month = null) {
  return new Promise(async (resolve, reject) => {
    let query = `
            SELECT
                DAY(created_at) AS day,
                WEEK(created_at) AS week,
                MONTH(created_at) AS month,
                DATE(created_at) AS date,
                COUNT(*) AS total_sales
            FROM
                client_data_report
            WHERE
                call_status = 'cold_lead'
                AND tellecaller_id = ?
        `;

    if (month) {
      query += ` AND MONTH(created_at) = ? `;
    }

    query += `
            GROUP BY
                day, week, month, date
            ORDER BY
                month, week, day, date;
        `;

    const queryParams = month ? [telecallerId, month] : [telecallerId];

    db.query(query, queryParams, (err, result) => {
      if (err) {
        console.error("Error in query:", err);

        if (err.code === "404") {
          reject("Specific error occurred in the query.");
        } else {
          reject(err);
        }
      } else {
        resolve(result);
      }
    });
  });
}

async function getSalesDataForLastNDays(telecallerId, n) {
  return new Promise(async (resolve, reject) => {
    const query = `
            SELECT
                DAY(created_at) AS day,
                WEEK(created_at) AS week,
                MONTH(created_at) AS month,
                DATE(created_at) AS date,
                COUNT(*) AS total_sales
            FROM
                client_data_report
            WHERE
                call_status = 'cold_lead'
                AND tellecaller_id = ?
                AND created_at >= CURDATE() - INTERVAL ? DAY
            GROUP BY
                day, week, month, date
            ORDER BY
                month, week, day, date;
        `;

    const queryParams = [telecallerId, n];

    db.query(query, queryParams, (err, result) => {
      if (err) {
        console.error("Error in query:", err);

        if (err.code === "404") {
          reject("Specific error occurred in the query.");
        } else {
          reject(err);
        }
      } else {
        resolve(result);
      }
    });
  });
}

async function getsaleprmonth(telecallerId, currentDateWithSelectedMonth) {
  return new Promise(async (resolve, reject) => {
    const query = `
            SELECT
                DAY(created_at) AS day,
                WEEK(created_at) AS week,
                MONTH(created_at) AS month,
                DATE(created_at) AS date,
                COUNT(*) AS total_sales
            FROM
                client_data_report
            WHERE
                call_status = 'cold_lead'
                AND tellecaller_id = ?
            GROUP BY
                day, week, month, date
            ORDER BY
                month, week, day, date;
        `;

    db.query(
      query,
      [telecallerId, currentDateWithSelectedMonth],
      (err, result) => {
        if (err) {
          console.error("Error in query:", err);

          if (err.code === "404") {
            reject("Specific error occurred in the query.");
          } else {
            reject(err);
          }
        } else {
          resolve(result);
        }
      }
    );
  });
}

async function getTotalSalesPerDay(telecallerId, date) {
  return new Promise(async (resolve, reject) => {
    const query = `
            SELECT
                DAY(created_at) AS day,
                WEEK(created_at) AS week,
                MONTH(created_at) AS month,
                DATE(created_at) AS date,
                COUNT(*) AS total_sales
            FROM
                client_data_report
            WHERE
                call_status = 'cold_lead'
                AND tellecaller_id = ?
                AND DATE(created_at) = ?
            GROUP BY
                day, week, month, date
            ORDER BY
                month, week, day, date;
        `;

    db.query(query, [telecallerId, date], (err, result) => {
      if (err) {
        console.error("Error in query:", err);

        if (err.code === "404") {
          reject("Specific error occurred in the query.");
        } else {
          reject(err);
        }
      } else {
        resolve(result);
      }
    });
  });
}

async function checkadminperdaysales(date) {
  return new Promise(async (resolve, reject) => {
    const query = `
            SELECT
                DAY(created_at) AS day,
                WEEK(created_at) AS week,
                MONTH(created_at) AS month,
                DATE(created_at) AS date,
                COUNT(*) AS total_sales
            FROM
                client_data_report
            WHERE
                call_status = 'close_status'
                AND DATE(created_at) = ?
            GROUP BY
                day, week, month, date
            ORDER BY
                month, week, day, date;
        `;

    db.query(query, [date], (err, result) => {
      if (err) {
        console.error("Error in query:", err);

        if (err.code === "404") {
          reject("Specific error occurred in the query.");
        } else {
          reject(err);
        }
      } else {
        resolve(result);
      }
    });
  });
}

async function admincheckget7dayssales(n) {
  return new Promise(async (resolve, reject) => {
    const query = `
            SELECT
                DAY(created_at) AS day,
                WEEK(created_at) AS week,
                MONTH(created_at) AS month,
                DATE(created_at) AS date,
                COUNT(*) AS total_sales
            FROM
                client_data_report
            WHERE
                call_status = 'close_status'
                AND created_at >= CURDATE() - INTERVAL ? DAY
            GROUP BY
                day, week, month, date
            ORDER BY
                month, week, day, date;
        `;

    const queryParams = [n];

    db.query(query, queryParams, (err, result) => {
      if (err) {
        console.error("Error in query:", err);

        if (err.code === "404") {
          reject("Specific error occurred in the query.");
        } else {
          reject(err);
        }
      } else {
        resolve(result);
      }
    });
  });
}

async function admincheckbymonthallsales(month = null) {
  return new Promise(async (resolve, reject) => {
    let query = `
            SELECT
                DAY(created_at) AS day,
                WEEK(created_at) AS week,
                MONTH(created_at) AS month,
                DATE(created_at) AS date,
                COUNT(*) AS total_sales
            FROM
                client_data_report
            WHERE
                call_status = 'close_status'
        `;

    if (month) {
      query += ` AND MONTH(created_at) = ? `;
    }

    query += `
            GROUP BY
                day, week, month, date
            ORDER BY
                month, week, day, date;
        `;

    const queryParams = month ? [month] : [];

    db.query(query, queryParams, (err, result) => {
      if (err) {
        console.error("Error in query:", err);

        if (err.code === "404") {
          reject("Specific error occurred in the query.");
        } else {
          reject(err);
        }
      } else {
        resolve(result);
      }
    });
  });
}

function getalldataByid(cd) {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT
            c.id AS cd,
            c.tellecaller_id,
            c.client_name,
            c.company_name,
            c.gst_no,
            c.dob_client,
            c.client_anniversary,
            c.call_schedule_date,
            c.call_status,
            c.attach_file,
            c.updated_at,
            a.ca_id,
            a.ca_name,
            a.ca_number,
            a.ca_accountant_name,
            a.ca_company_name,
            a.updated_at,
            au.id,
            au.username,
            au.email,
            au.role
            FROM client_data_report c
        LEFT JOIN client_ca_data a ON c.ca_id = a.ca_id
        LEFT JOIN  tellecaler_data au ON c.tellecaller_id = au.id
        WHERE c.id = ?;`;

    db.query(query, cd, (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        reject(error);
      } else {
        const data = results.map((row) => ({
          cd: row.cd,
          tellecaller_id: row.tellecaller_id,
          client_name: row.client_name,
          company_name: row.company_name,
          gst_no: row.gst_no,
          dob_client: row.dob_client,
          client_anniversary: row.client_anniversary,
          call_schedule_date: row.call_schedule_date,
          call_status: row.call_status,
          attach_file: row.attach_file,
          updated_at: row.updated_at,
          cadetails: {
            ca_id: row.ca_id,
            ca_name: row.ca_name,
            ca_number: row.ca_number,
            ca_accountant_name: row.ca_accountant_name,
            ca_company_name: row.ca_company_name,
            updated_at: row.updated_at,
          },
          user: {
            id: row.user_id,
            username: row.username,
            email: row.email,
            role: row.role,
          },
        }));

        resolve(data);

        console.log("All data retrieved successfully");
      }
    });
  });
}
// In your telecaller module
async function adminchecksalesBYYear(year = null) {
  return new Promise(async (resolve, reject) => {
    let query = `
      SELECT
      months.month_num AS month,
      COALESCE(COUNT(client_data_report.id), 0) AS total_sales
    FROM (
      SELECT 1 AS month_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
      UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
    ) AS months
    LEFT JOIN client_data_report ON months.month_num = MONTH(client_data_report.created_at)
                                 AND call_status = 'close_status'
                                 AND YEAR(client_data_report.created_at) = ? 
    GROUP BY months.month_num;    
      `;

    const queryParams = [year];

    db.query(query, queryParams, (err, result) => {
      if (err) {
        console.error("Error in query:", err);

        if (err.code === "404") {
          reject("Specific error occurred in the query.");
        } else {
          reject(err);
        }
      } else {
        resolve(result);
      }
    });
  });
}




function getAllWeekdata(cd) {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT
            c.id AS cd,
            c.tellecaller_id,
            c.client_name,
            c.company_name,
            c.gst_no,
            c.dob_client,
            c.client_anniversary,
            c.call_schedule_date,
            c.call_status,
            c.attach_file,
            c.updated_at,
            a.ca_id,
            a.ca_name,
            a.ca_number,
            a.ca_accountant_name,
            a.ca_company_name,
            a.updated_at,
            au.id,
            au.username,
            au.email,
            au.role
            FROM client_data_report c
        LEFT JOIN client_ca_data a ON c.ca_id = a.ca_id
        LEFT JOIN  tellecaler_data au ON c.tellecaller_id = au.id
        WHERE c.id = ?;`;

    db.query(query, cd, (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        reject(error);
      } else {
        const data = results.map((row) => ({
          id: row.cd,
          tellecaller_id: row.tellecaller_id,
          client_name: row.client_name,
          company_name: row.company_name,
          gst_no: row.gst_no,
          dob_client: row.dob_client,
          client_anniversary: row.client_anniversary,
          call_schedule_date: row.call_schedule_date,
          call_status: row.call_status,
          attach_file: row.attach_file,
          updated_at: row.updated_at,
          cadetails: {
            ca_id: row.ca_id,
            ca_name: row.ca_name,
            ca_number: row.ca_number,
            ca_accountant_name: row.ca_accountant_name,
            ca_company_name: row.ca_company_name,
            updated_at: row.updated_at,
          },
          user: {
            id: row.user_id,
            username: row.username,
            email: row.email,
            role: row.role,
          },
        }));

        resolve(data);

        console.log("All data retrieved successfully");
      }
    });
  });
}


function sharingdata(userId, reciever_id, share_id) {
  return new Promise((resolve, reject) => {
    const insertSql = `
      INSERT INTO sharing_data(sender_id, reciever_id, share_id) 
      VALUES (?, ?, ?)`;

    const values = [userId, reciever_id, share_id];

    db.query(insertSql, values, (error, result) => {
      if (error) {
        console.error('Error inserting data:', error);
        reject(error);
      } else {
        const adminId = result.insertId;

        if (adminId > 0) {
          const successMessage = 'Data share successful';
          resolve(successMessage);
        } else {
          const errorMessage = 'Data share failed';
          reject(errorMessage);
        }
      }
    });
  });
}
async function checktelleSaleBYid(date, userId) {
  return new Promise(async (resolve, reject) => {
    const query = `
            SELECT
                DAY(created_at) AS day,
                WEEK(created_at) AS week,
                MONTH(created_at) AS month,
                DATE(created_at) AS date,
                COUNT(*) AS total_sales
            FROM
                client_data_report 
            WHERE
                
                call_status = 'close_status'
                 AND tellecaller_id = ?
                AND DATE(created_at) = ?
            GROUP BY  
                day, week, month, date
            ORDER BY
                month, week, day, date;
        `;

    db.query(query, [date, userId], (err, result) => {
      console.log(date, userId)
      if (err) {
        console.error("Error in query:", err);

        if (err.code === "404") {
          reject("Specific error occurred in the query.");
        } else {
          reject(err);
        }
      } else {
        resolve(result);
        console.log(result)
      }
    });
  });
}




async function tellesales7days(userId,n) {
  return new Promise(async (resolve, reject) => {
    const query = `
            SELECT
                DAY(created_at) AS day,
                WEEK(created_at) AS week,
                MONTH(created_at) AS month,
                DATE(created_at) AS date,
                COUNT(*) AS total_sales
            FROM
                client_data_report
            WHERE
          
                call_status = 'close_status'
                AND tellecaller_id = ?
                AND created_at >= CURDATE() - INTERVAL ? DAY
            GROUP BY
                day, week, month, date
            ORDER BY
                month, week, day, date;
        `;

    const queryParams = [n,userId];

    db.query(query, queryParams, (err, result) => {
      if (err) {
        console.error("Error in query:", err);

        if (err.code === "404") {
          reject("Specific error occurred in the query.");
        } else {
          reject(err);
        }
      } else {
        resolve(result);
      }
    });
  });
}

async function telleSalesbyYear(year = null, userId) {
  return new Promise(async (resolve, reject) => {
    let query = `
      SELECT
      months.month_num AS month,
      COALESCE(COUNT(client_data_report.id), 0) AS total_sales
    FROM (
      SELECT 1 AS month_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
      UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
    ) AS months
    LEFT JOIN client_data_report ON months.month_num = MONTH(client_data_report.created_at)
                                 AND tellecaller_id = ?
                                 AND call_status = 'close_status'
                                 AND YEAR(client_data_report.created_at) = ? 
    GROUP BY months.month_num;    
      `;

    const queryParams = [year,userId];
console.log("sahgvsdghvsdhgsdghsdgfdsgfgfsdgfgfgfsdgffgsd", queryParams)
    db.query(query, queryParams, (err, result) => {
      if (err) {
        console.error("Error in query:", err);

        if (err.code === "404") {
          reject("Specific error occurred in the query.");
        } else {
          reject(err);
        }
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = {
  insertclientdata,
  insertcadata,
  updatecadata,
  getTotalSalesPerWeekAndMonth,
  getTotalSalesPerDay,
  getsaleprmonth,
  getSalesDataForLastNDays,
  checkadminperdaysales,
  admincheckget7dayssales,
  admincheckbymonthallsales,
  getalldataByid,
  adminchecksalesBYYear,
  getAllWeekdata,
  sharingdata,
  checktelleSaleBYid,
  tellesales7days,
  telleSalesbyYear
};
