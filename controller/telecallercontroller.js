const { compareSync } = require('bcrypt');
const telecaller = require('../service/telecallerservice')
const moment = require('moment-timezone');
const salesdata = require('../salesdatafxn/sales')


const Clientdata = async (req, res) => {
    const userId = req.user.id;

    if (req.user.role !== 'telecaller') {
        return res.status(403).json({ error: 'Forbidden for regular users' });
    }
    const { tellecaller_id, client_name, company_name, gst_no, dob_client, client_anniversary, call_schedule_date, call_status, attach_file, ca_data } = req.body;

    try {
        const userid = await telecaller.insertclientdata(
            userId,
            client_name,
            company_name,
            gst_no,
            dob_client,
            client_anniversary,
            call_schedule_date,
            call_status,
            attach_file,
            null
        );

        const caId = await telecaller.insertcadata(
            userId,
            ca_data.ca_name,
            ca_data.ca_number,
            ca_data.ca_accountant_name,
            ca_data.ca_company_name,
            ca_data.ca_accountant_number
        );

        await telecaller.updatecadata(userid, caId);

        res.status(200).json({
            message: 'Data added successfully',
            status: 200,
        });
    } catch (error) {
        console.error(error);

        if (error.code === 'SOME_SPECIFIC_ERROR_CODE') {
            res.status(400).json({ error: 'Bad Request: Some specific error occurred.' });
        } else {
            res.status(500).json({ error: 'Internal Server Error: An error occurred during user registration.' });
        }
    }
};



const getTotalSalesPerWeekAndMonth = async (req, res) => {
    const telecallerId = req.params.id;
    const userSelection = req.query.selection;
    console.log("weeeeeheheh", userSelection);

    try {
        let salesData;

        if (userSelection === 'today') {
            const today = moment().tz('YourTimeZone').format('YYYY-MM-DD');
            console.log('dateeee', today);
            salesData = await telecaller.getTotalSalesPerDay(telecallerId, today);

            if (salesData.length === 0) {
                return res.status(404).json({ success: false, error: 'No sales data found for today' });
            }
        }
        else {
            salesData = await telecaller.getTotalSalesPerWeekAndMonth(telecallerId);
        }

        const organizedData = salesdata.organizeDataBySelection(salesData, userSelection);

        res.status(201).json({ success: true, data: organizedData });
    } catch (error) {
        console.error('Error fetching sales data:', error);

        if (error) {
            res.status(404).json({ success: false, error: 'No sales data found' });
        } else if (error) {
            res.status(400).json({ success: false, error: error.message });
        } else {
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }
};






module.exports = {
    Clientdata,
    getTotalSalesPerWeekAndMonth,
}