import "./App.css";
import React, { useState, useEffect } from "react";

function App() {
  const [identifications, setIdentifications] = useState([]);

  useEffect(() => {
    // Connect to WebSocket server using dynamic host and correct path
    const ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      const newIdentifications = JSON.parse(event.data);

      // Update identifications state with new data
      setIdentifications((prevIdentifications) => [
        ...prevIdentifications,
        ...newIdentifications,
      ]);
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="App">
      <h1>Appliance Identifications Dashboard</h1>
      <table border="1">
        <thead>
          <tr>
            <th>Serial Number</th>
            <th>Appliance Type</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {identifications.map((identification, index) => (
            <tr key={index}>
              <td>{identification.serial_number}</td>
              <td>{identification.appliance_type}</td>
              <td>
                {new Date(identification.timestamp * 1000).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
