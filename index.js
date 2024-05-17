const express = require('express');




// Imports the Google Analytics Data API client library.
const { BetaAnalyticsDataClient } = require('@google-analytics/data');



const app = express();


app.use(express.json());

let analyticsDataClient = new BetaAnalyticsDataClient();


app.get('/endpoint', async (req, res) => {
    const propertyid=req.query.propertyid;
    // const private_key=req.query.private_key;
    // const client_email=req.query.client_email;
    // let key={"private_key":private_key, "client_email":client_email}
    // console.log(key)
     process.env.GOOGLE_APPLICATION_CREDENTIALS ="./keyfile.json";
    // process.env.GOOGLE_APPLICATION_CREDENTIALS ="./keyfile.json";
   
    
    // analyticsDataClient = new BetaAnalyticsDataClient({
    //     credentials: {
    //         private_key,
    //         client_email
    //     }
    // });
 
    try {
        // Call the runReport function
        const result=await runReport(propertyid);
        console.log(result.all_data.length)
        res.status(200).send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while generating the report');
    }
});


async function runReport(propertyid) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60);
    const formattedStartDate = startDate.toISOString().slice(0, 10);
    console.log(formattedStartDate)
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyid}`,
        dateRanges: [
            {
                startDate: formattedStartDate,
                endDate: 'today',
            },
        ],
        dimensions:[
            {
                name: 'date'
            },
        ],
        metrics:[
            {
                name: 'activeUsers'
            },
            {
                name: 'screenPageViews'
            },
            {
                name: 'sessions'
            },
            {
                name:"newUsers"
            }
            // {
            //     name:"totalUsers" // Add total users metric
            // }
        ]
    });

    // console.log('Report result:');



    const allData = response.rows.map(row => {
        const date = row.dimensionValues[0].value;
        const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`; // Format date as "YYYY-MM-dd"
        const activeUsers = parseInt(row.metricValues[0].value);
        const screenPageViews = parseInt(row.metricValues[1].value);
        const sessions = parseInt(row.metricValues[2].value);
        const newUsers = parseInt(row.metricValues[3].value);
        // const users = parseInt(row.metricValues[4].value); // Extract users metric

      

        return {
            views: screenPageViews,
            sessions: sessions,
            users: activeUsers,
            newusers: newUsers,
           
            date: formattedDate // Use formatted date
        };
    });
// Sort the objects by date in descending order
allData.sort((a, b) => new Date(b.date) - new Date(a.date)); 
    return({ all_data: allData});
}



//  runReport().catch(console.error);
 const PORT = process.env.PORT || 3000;
 app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
 });