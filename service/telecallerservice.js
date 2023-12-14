const db = require('../config/database')
function insertclientdata(userId, client_name, company_name, gst_no, dob_client, client_anniversary, call_schedule_date, call_status, attach_file, caId) {
    return new Promise((resolve, reject) => {
        const query = `
        INSERT INTO client_data_report 
        (tellecaller_id, client_name, company_name, gst_no, dob_client, client_anniversary, call_schedule_date, call_status, attach_file, ca_id)
        VALUES (?, ?, ?,?,?,?,?,?,?,?)
      `;
        db.query(query, [userId, client_name, company_name, gst_no, dob_client, client_anniversary, call_schedule_date, call_status, attach_file, caId], (err, result) => {
            if (err) {
                console.error('Error in insertclientdata query:', err);

                if (err.code === '404') {
                    reject('Specific error occurred in insertclientdata query.');
                } else {
                    reject(err);
                }
            } else {
                resolve(result.insertId);
            }
        });
    });
}

function insertcadata(userId, ca_name, ca_number, ca_accountant_name, ca_company_name, ca_accountant_number) {
    return new Promise((resolve, reject) => {
        const query = `
        INSERT INTO client_ca_data
        (tellecaller_id, ca_name, ca_number, ca_accountant_name, ca_company_name, ca_accountant_number)
        VALUES (?, ?, ?,?,?,?)
      `;
        db.query(query, [userId, ca_name, ca_number, ca_accountant_name, ca_company_name, ca_accountant_number], (err, result) => {
            if (err) {
                console.error('Error in insertAddress query:', err);

                if (err.code === '404') {
                    reject('Specific error occurred in insertAddress query.');
                } else {
                    reject(err);
                }
            } else {
                resolve(result.insertId);
            }
        });
    });
}

function updatecadata(userId, caId) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE client_data_report SET ca_id = ? WHERE id = ?';
        db.query(query, [caId, userId], (err, result) => {
            if (err) {
                console.error('Error in updatestudentaddress query:', err);

                if (err.code === '404') {
                    reject('Specific error occurred in updatestudentaddress query.');
                } else {
                    reject(err);
                }
            } else {
                resolve();
            }
        });
    });
}




module.exports = {

    insertclientdata,
    insertcadata,
    updatecadata
    
}
