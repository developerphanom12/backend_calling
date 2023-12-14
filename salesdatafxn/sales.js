
function organizeDataWeekWise(salesData) {
    const organizedData = salesData.reduce((acc, entry) => {
        const week = entry.week;

        if (!acc[week]) {
            acc[week] = {
                weekNumber: week,
                totalSales: 0,
                data: [],
            };
        }

        acc[week].totalSales += entry.total_sales;
        acc[week].data.push(entry);

        return acc;
    }, {});

    return Object.values(organizedData);
}

function organizeDataMonthWise(salesData) {
    const organizedData = salesData.reduce((acc, entry) => {
        const month = entry.month;

        if (!acc[month]) {
            acc[month] = {
                monthNumber: month,
                totalSales: 0,
                data: [],
            };
        }

        acc[month].totalSales += entry.total_sales;
        acc[month].data.push(entry);

        return acc;
    }, {});

    return Object.values(organizedData);
}


function organizeDataday(salesData) {
    const organizedData = salesData.reduce((acc, entry) => {
        const day = entry.day;

        if (!acc[day]) {
            acc[day] = {
                monthNumber: day,
                totalSales: 0,
                data: [],
            };
        }

        acc[day].totalSales += entry.total_sales;
        acc[day].data.push(entry);

        return acc;
    }, {});

    return Object.values(organizedData);
}

function organizeDataBySelection(salesData, selection) {
    if (selection === 'week') {
        return organizeDataWeekWise(salesData);
    } else if (selection === 'month') {
        return organizeDataMonthWise(salesData);
    } else if (selection === 'day') {
        return organizeDataday(salesData);
    }
    else {
        return salesData;
    }
}



module.exports = {
    organizeDataWeekWise,
    organizeDataMonthWise,
    organizeDataday,
    organizeDataBySelection
}