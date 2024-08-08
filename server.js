const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const glide = require("@glideapps/tables");

const deviceRegistrationTable = glide.table({
    token: process.env.GLIDE_API_TOKEN,
    app: "3NS0DhxzYXaoZwaKdBxr",
    table: "native-table-9q8MHb4W7VucpC1cBGao",
    columns: {
        deviceId: { type: "string", name: "Name" },
        deviceName: { type: "string", name: "qExjY" },
        eventName: { type: "string", name: "GBXIB" },
        startTime: { type: "string", name: "hWlst" },
        endTime: { type: "string", name: "y7K3x" },
        distance: { type: "string", name: "SXZ41" },
        status: { type: "string", name: "HPznC" },
        owner: { type: "string", name: "a5GHF" },
        mailId: { type: "string", name: "mtyXt" }
    }
});

// Function to update a row
async function updateDeviceRegistration(deviceRegistrationID, updatedData) {
    try {
        const result = await deviceRegistrationTable.update(deviceRegistrationID, updatedData);
        return result;
    } catch (error) {
        throw new Error('Error updating row: ' + error.message);
    }
}

// Endpoint to get event details from Glide Table
app.get('/getEventDetails/:eventId', async (req, res) => {
    const { eventId } = req.params;

    try {
        const response = await axios.post('https://api.glideapp.io/api/function/queryTables', {
            appID: "3NS0DhxzYXaoZwaKdBxr",
            queries: [
                {
                    tableName: "native-table-9q8MHb4W7VucpC1cBGao",
                    filters: {
                        "Uet7T": { equals: eventId }
                    }
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GLIDE_API_TOKEN}`,
            },
        });

        if (response.data.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const eventDetails = response.data[0];
        res.status(200).json(eventDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to update distance and status
app.post('/updateEvent', async (req, res) => {
    const { DeviceID, Distance, Status } = req.body;

    // Validate required fields
    if (!DeviceID || !Distance || !Status) {
        return res.status(400).json({ error: 'DeviceID, Distance, and Status are required' });
    }

    try {
        // Fetch existing event data
        const fetchResponse = await axios.post('https://api.glideapp.io/api/function/queryTables', {
            appID: "3NS0DhxzYXaoZwaKdBxr",
            queries: [
                {
                    tableName: "native-table-9q8MHb4W7VucpC1cBGao",
                    filters: {
                        "Name": { equals: DeviceID }
                    }
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GLIDE_API_TOKEN}`,
            },
        });

        if (fetchResponse.data.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        const deviceDetails = fetchResponse.data[0];
        // print(deviceDetails);
        const rowId = deviceDetails['rows'][0]['$rowID'];

        // Update the Glide table with new distance and status
        const updatedData = {
            SXZ41: Distance, // Assuming SXZ41 is the correct column for distance
            HPznC: Status    // Assuming HPznC is the correct column for status
        };

        const updateResult = await updateDeviceRegistration(rowId, updatedData);

        res.status(200).json(updateResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
