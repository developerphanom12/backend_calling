const db = require('../config/database')

function clientdata(clientdata, userId) {
    return new Promise((resolve, reject) => {
        const { tellecaller_id, client_name, company_name, gst_no, dob_client, client_anniversary, call_schedule_date, call_status, attach_file } = clientdata;
        const query = `
        INSERT INTO client_data_report 
        (tellecaller_id, client_name, company_name,gst_no,dob_client,client_anniversary,call_schedule_date,call_status,attach_file)
        VALUES (?, ?, ?,?,?,?,?,?,?)
      `;

        db.query(query, [tellecaller_id, client_name, company_name, gst_no, dob_client, client_anniversary, call_schedule_date, call_status, attach_file], (error, result) => {
            if (error) {
                reject(error);
                console.error('Error add client:', error);
            } else {
                const insertclientdata = {
                    id: result.insertId,
                    client_name,
                    company_name,
                    gst_no,
                    dob_client,
                    client_anniversary,
                    call_schedule_date,
                    call_status,
                    attach_file
                };
                resolve(insertclientdata);
                console.log('client data addd successfully', insertclientdata);
            }
        });
    });
}


function clientdata_CA(clientdataCA) {
    return new Promise((resolve, reject) => {
        const { tellecaller_id,
            ca_name,	
            ca_number,	
            ca_accountant_name,	
            ca_company_name,
            ca_accountant_number } = clientdataCA;
        const query = `
        INSERT INTO client_ca_data
        (tellecaller_id, ca_name, ca_number,ca_accountant_name,ca_company_name,ca_accountant_number)
        VALUES (?, ?, ?,?,?,?)
      `;

        db.query(query, [tellecaller_id, ca_name, ca_number, ca_accountant_name,ca_company_name,ca_accountant_number], (error, result) => {
            if (error) {
                reject(error);
                console.error('Error add data  of ca  :', error);
            } else {
                const insertclientdata = {
                    id: result.insertId,
                    ca_name,
                    ca_number,
                    ca_accountant_name,
                    ca_company_name,
                    ca_accountant_number
                };
                resolve(insertclientdata);
                console.log('CA data addd successfully', insertclientdata);
            }
        });
    });
}



module.exports = {
    clientdata,
    clientdata_CA,
    
}
