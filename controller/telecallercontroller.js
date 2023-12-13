const telecaller = require('../service/telecallerservice')



const Clientdata = async (req, res) => {
    if (req.user.role !== 'telecaller') {
        return res.status(403).json({ error: 'Forbidden for regular users' });
    }
    const userId = req.user.id;
    console.log("jdhfgfdjgdhfd", userId)
    const { tellecaller_id, client_name,company_name, gst_no,dob_client, client_anniversary, call_schedule_date,call_status,attach_file } = req.body;
    const imagePath = req.file.filename;

    try {
        const clientdata = await telecaller.clientdata({
            tellecaller_id: userId,
            client_name,
            company_name,
            gst_no,
            dob_client,
            client_anniversary,
            call_schedule_date,
            call_status,
            attach_file : imagePath
        });


        res.status(201).json({
            message: "client data add successfully",
            status : 201,
            data: clientdata
        });
    } catch (error) {
        if (error) {
            res.status(401).json({ status :401, error: error.message });
        }
    }
};





const clientCAdata = async (req, res) => {
    if (req.user.role !== 'telecaller') {
        return res.status(403).json({ error: 'Forbidden for regular users' });
    }

   
    const userId = req.user.id;
    console.log("jdhfgfdjgdhfd", userId)

    const { tellecaller_id,
            ca_name,	
            ca_number,	
            ca_accountant_name,	
            ca_company_name,
            ca_accountant_number
        } = req.body;

    try {
        const clientdataCA = await telecaller.clientdata_CA({
            tellecaller_id: userId,
            ca_name,
            ca_number,
            ca_accountant_name,
            ca_company_name,
            ca_accountant_number
        });


        res.status(201).json({
            message: "client  CA data add successfully",
            status : 201,
            data: clientdataCA
        });
    } catch (error) {
        if (error) {
            res.status(401).json({ status :401, error: error.message });
        }
    }
};






module.exports = {
    Clientdata,
    clientCAdata,
    
}