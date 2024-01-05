const { compareSync } = require("bcrypt");
const telecaller = require("../service/telecallerservice");
const moment = require("moment-timezone");
const { YourSpecificError } = require("../error/error");

const Clientdata = async (req, res) => {
  const userId = req.user.id;

  if (req.user.role !== "telecaller") {
    return res.status(403).json({ error: "Forbidden for regular users" });
  }
  const {
    tellecaller_id,
    client_name,
    company_name,
    gst_no,
    dob_client,
    client_anniversary,
    call_schedule_date,
    call_status,
    attach_file,
    ca_data,
  } = req.body;

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
      message: "Data added successfully",
      status: 200,
    });
  } catch (error) {
    if (error instanceof YourSpecificError) {
      return res.status(400).json({
        status: 400,
        error: "An error occurred while processing your request.",
      });
    }

    if (error.name === "UnauthorizedError") {
      return res.status(401).json({
        status: 401,
        error: "Unauthorized access",
      });
    }

    console.error("Internal Server Error:", error);

    res.status(500).json({
      status: 500,
      error: "An unexpected error occurred. Please try again later.",
    });
  }
};


const getTotalSalesPerWeekAndMonth = async (req, res) => {
  const telecallerId = req.params.id;
  const userSelection = req.query.selection;
  const selectedMonth = req.query.month;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden for regular users" });
  }
  console.log("User Role:", req.user.role);

  try {
    let salesData;

    if (userSelection === "today") {
      const today = moment().tz("YourTimeZone").format("YYYY-MM-DD");
      console.log("dateeee", today);

      salesData = await telecaller.getTotalSalesPerDay(telecallerId, today);

      if (salesData.length === 0) {
        return res
          .status(404)
          .json({ status: 404, error: "No sales data found for today" });
      }
    } else if (userSelection === "last7days") {
      const last7DaysData = await telecaller.getSalesDataForLastNDays(
        telecallerId,
        7
      );
      if (last7DaysData.length === 0) {
        return res
          .status(404)
          .json({
            status: 404,
            error: "No sales data found for the last 7 days",
          });
      }
      salesData = last7DaysData;
    } else {
      salesData = await telecaller.getTotalSalesPerWeekAndMonth(
        telecallerId,
        selectedMonth
      );
      if (salesData.length === 0) {
        return res
          .status(404)
          .json({
            status: 404,
            error: `No sales data found for ${selectedMonth} month`,
          });
      }
    }

    res.status(201).json({
      success: 201,
      data: salesData,
    });
  } catch (error) {
    if (error instanceof YourSpecificError) {
      return res.status(400).json({
        status: 400,
        error: "An error occurred while processing your request.",
      });
    }

    if (error.name === "UnauthorizedError") {
      return res.status(401).json({
        status: 401,
        error: "Unauthorized access",
      });
    }

    console.error("Internal Server Error:", error);

    res.status(500).json({
      status: 500,
      error: "An unexpected error occurred. Please try again later.",
    });
  }
};

const checkadminallsales = async (req, res) => {
    const userSelection = req.query.selection;
    const selectedMonth = req.query.month;
    const selectedYear = req.query.year;
  
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden for regular users" });
    }
    console.log("User Role:", req.user.role);
  
    try {
      let salesData;
  
      if (userSelection === "today") {
        const today = moment().tz("YourTimeZone").format("YYYY-MM-DD");
        console.log("dateeee", today);
  
        salesData = await telecaller.checkadminperdaysales(today);
  
        if (salesData.length === 0) {
          return res
            .status(404)
            .json({ status: 404, error: "No sales data found for today" });
        }
      } else if (userSelection === "last7days") {
        const last7DaysData = await telecaller.admincheckget7dayssales(7);
        if (last7DaysData.length === 0) {
          return res
            .status(404)
            .json({
              status: 404,
              error: "No sales data found for the last 7 days",
            });
        }
        salesData = last7DaysData;
      } else if (!isNaN(selectedYear)) {
        salesData = await telecaller.adminchecksalesBYYear(selectedYear);
        if (salesData.length === 0) {
          return res
            .status(404)
            .json({
              status: 404,
              error: `No sales data found for the year ${selectedYear}`,
            });
        }
      }  else {
        salesData = await telecaller.admincheckbymonthallsales(selectedMonth);
        if (salesData.length === 0) {
          return res
            .status(404)
            .json({
              status: 404,
              error: `No sales data found for ${selectedMonth} month`,
            });
        }
      }
  
      res.status(201).json({
        success: 201,
        data: salesData,
      });
    } catch (error) {
        if (error instanceof YourSpecificError) {
          return res.status(400).json({
            status: 400,
            error: "An error occurred while processing your request.",
          });
        }
    
        if (error.name === "UnauthorizedError") {
          return res.status(401).json({
            status: 401,
            error: "Unauthorized access",
          });
        }
    
        console.error("Internal Server Error:", error);
    
        res.status(500).json({
          status: 500,
          error: "An unexpected error occurred. Please try again later.",
        });
      }
    };
    
const getdatatelleId = async (req, res) => {
  try {
    const cd = req.params.cd;
    console.log("sdfsdfsdf", cd);

    if (!cd) {
      return res.status(400).json({
        message: "please provide postid",
        status: 400,
      });
    }
    let dataId;
    dataId = await telecaller.getalldataByid(cd);

    if (dataId.length > 0) {
      res.status(201).json({
        message: "data fetched successfully",
        status: 201,
        data: dataId,
      });
    } else {
      const responseMessage = "No datafound for the provided ID.";
      res.status(404).json({
        message: responseMessage,
        status: 404,
      });
    }
  } catch (error) {
    if (error instanceof YourSpecificError) {
      return res.status(400).json({
        status: 400,
        error: "An error occurred while processing your request.",
      });
    }

    if (error.name === "UnauthorizedError") {
      return res.status(401).json({
        status: 401,
        error: "Unauthorized access",
      });
    }

    console.error("Internal Server Error:", error);

    res.status(500).json({
      status: 500,
      error: "An unexpected error occurred. Please try again later.",
    });
  }
};


 
const getUpcomingINweek = async (req, res) => {
  try {
    const cd = req.params.id;
    console.log("sdfsdfsdf", cd);

    if (!cd) {
      return res.status(400).json({
        message: "please provide postid",
        status: 400,
      });
    }
    let dataId;
    dataId = await telecaller.getAllWeekdata(cd);

    if (dataId.length > 0) {
      res.status(201).json({
        message: "data fetched successfully",
        status: 201,
        data: dataId,
      });
    } else {
      const responseMessage = "No datafound for the provided ID.";
      res.status(404).json({
        message: responseMessage,
        status: 404,
      });
    }
  } catch (error) {
    if (error instanceof YourSpecificError) {
      return res.status(400).json({
        status: 400,
        error: "An error occurred while processing your request.",
      });
    }

    if (error.name === "UnauthorizedError") {
      return res.status(401).json({
        status: 401,
        error: "Unauthorized access",
      });
    }

    console.error("Internal Server Error:", error);

    res.status(500).json({
      status: 500,
      error: "An unexpected error occurred. Please try again later.",
    });
  }
};



const shareData = async (req, res) => {
  const userId = req.user.id;

  try {
    if (req.user.role !== "telecaller") {
      return res.status(403).json({ error: "Forbidden for regular users" });
    }

    const { sender_id, reciever_id, share_id } = req.body;

    const result = await telecaller.sharingdata(userId, reciever_id, share_id);

    res.status(200).json({
      message: result,
      status: 200,
    });
  } catch (error) {
    if (error instanceof YourSpecificError) {
      return res.status(400).json({
        status: 400,
        error: "An error occurred while processing your request.",
      });
    }

    if (error.name === "UnauthorizedError") {
      return res.status(401).json({
        status: 401,
        error: "Unauthorized access",
      });
    }

    console.error("Internal Server Error:", error);

    res.status(500).json({
      status: 500,
      error: "An unexpected error occurred. Please try again later.",
    });
  }
};

const checkTelleById = async (req, res) => {
  const userSelection = req.query.selection;
  const selectedMonth = req.query.month;
  const selectedYear = req.query.year;
  const userId = req.user.id;

  if (req.user.role !== "telecaller") {
    return res.status(403).json({ error: "Forbidden for regular users" });
  }
  console.log("User Role:", req.user.role);

  try {
    let salesData;

    if (userSelection === "today") {
      const today = moment().tz("YourTimeZone").format("YYYY-MM-DD");
      console.log("dateeee", today);

      salesData = await telecaller.checktelleSaleBYid(userId,today);

      if (salesData.length === 0) {
        return res
          .status(404)
          .json({ status: 404, error: "No sales data found for today" });
      }
    } else if (userSelection === "last7days") {
      const last7DaysData = await telecaller.tellesales7days(7,userId);
      if (last7DaysData.length === 0) {
        return res
          .status(404)
          .json({
            status: 404,
            error: "No sales data found for the last 7 days",
          });
      }
      salesData = last7DaysData;
      console.log("salesdttatata",last7DaysData)
    } else if (!isNaN(selectedYear)) {
      salesData = await telecaller.telleSalesbyYear(userId,selectedYear);
      if (salesData.length === 0) {
        return res
          .status(404)
          .json({
            status: 404,
            error: `No sales data found for the year ${selectedYear}`,
          });
      }
    } else {
      salesData = await telecaller.admincheckbymonthallsales(selectedMonth);
      if (salesData.length === 0) {
        return res
          .status(404)
          .json({
            status: 404,
            error: `No sales data found for ${selectedMonth} month`,
          });
      }
    }

    res.status(201).json({
      success: 201,
      data: salesData,
    });
  } catch (error) {
    if (error instanceof YourSpecificError) {
      return res.status(400).json({
        status: 400,
        error: "An error occurred while processing your request.",
      });
    }

    if (error.name === "UnauthorizedError") {
      return res.status(401).json({
        status: 401,
        error: "Unauthorized access",
      });
    }

    console.error("Internal Server Error:", error);

    res.status(500).json({
      status: 500,
      error: "An unexpected error occurred. Please try again later.",
    });
  }
};

module.exports = {
  Clientdata,
  getTotalSalesPerWeekAndMonth,
  checkadminallsales,
  getdatatelleId,
  getUpcomingINweek,
  shareData,
  checkTelleById
};
