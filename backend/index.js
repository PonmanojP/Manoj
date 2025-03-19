const express = require('express');
const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');
const { parseString } = require('xml2js');
const { Parser } = require('fast-xml-parser');
const LogModel = require('./models/LogModel');

const app = express();
app.use(express.json());

// Connect to Neo4j
const neo4jDriver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'password')
);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/iot-dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware to convert JSON to XML
function jsonToXml(json) {
  const parser = new Parser({ format: true });
  return parser.parse(json);
}

// Middleware to convert XML to JSON
function xmlToJson(xml) {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// Log an Action
app.post('/log-action', async (req, res) => {
  const jsonData = req.body;

  // Convert JSON to XML
  const xmlData = jsonToXml(jsonData);

  // Parse XML back to JSON for processing
  const parsedData = await xmlToJson(xmlData);

  const { action, device, appliance, batteryCharge, user, activeDevices, status } = parsedData;

  // Log in MongoDB
  const log = new LogModel({
    action,
    device,
    appliance,
    timestamp: new Date(),
    battery_charge: batteryCharge,
    user,
    active_devices: activeDevices,
    status,
  });
  await log.save();

  // Update Neo4j
  const session = neo4jDriver.session();
  await session.run(
    `MATCH (d:Device {name: $device}), (a:Appliance {name: $appliance})
     MERGE (d)-[r:${action.toUpperCase()}]->(a)
     SET r.timestamp = datetime()`,
    { device, appliance }
  );
  session.close();

  res.status(200).send('Action logged successfully');
});

// Retrieve History
app.get('/history', async (req, res) => {
  // Query MongoDB for logs
  const logs = await LogModel.find().sort({ timestamp: -1 });

  // Query Neo4j for relationships
  const session = neo4jDriver.session();
  const result = await session.run(
    `MATCH (d:Device)-[r]->(a:Appliance)
     RETURN d.name AS device, type(r) AS action, a.name AS appliance`
  );
  session.close();

  // Combine data and convert to XML
  const combinedData = { logs, relationships: result.records };
  const xmlResponse = jsonToXml(combinedData);

  res.status(200).send(xmlResponse);
});

app.listen(3000, () => console.log('Server running on port 3000'));