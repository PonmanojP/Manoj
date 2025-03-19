import React, { useEffect, useState } from 'react';
const { XMLParser } = require('fast-xml-parser');

function Dashboard() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/history')
      .then((res) => res.text())
      .then((xmlData) => {
        const parser = new XMLParser();
        const jsonData = parser.parse(xmlData);
        setLogs(jsonData.logs);
      });
  }, []);

  return (
    <div>
      <h1>Device Activity History</h1>
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Device</th>
            <th>Appliance</th>
            <th>Timestamp</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index}>
              <td>{log.action}</td>
              <td>{log.device}</td>
              <td>{log.appliance}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;