import "./App.css";
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

function App() {
  const [identifications, setIdentifications] = useState([]);
  const [applianceCounts, setApplianceCounts] = useState({});

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

      // Update appliance counts
      setApplianceCounts((prevCounts) => {
        const counts = { ...prevCounts };
        newIdentifications.forEach((identification) => {
          const type = identification.appliance_type;
          counts[type] = (counts[type] || 0) + 1;
        });
        return counts;
      });
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
    };

    return () => {
      ws.close();
    };
  }, []);

  // Prepare data for the bar chart
  const applianceTypes = Object.keys(applianceCounts);
  const counts = Object.values(applianceCounts);

  // Generate a color for each appliance type
  const colors = applianceTypes.map(() => getRandomColor());

  const barChartData = {
    labels: applianceTypes,
    datasets: [
      {
        label: "Appliance Counts",
        data: counts,
        backgroundColor: colors,
      },
    ],
  };

  // Chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            if (Number.isInteger(value)) {
              return value;
            }
          },
        },
      },
    },
  };

  // Function to generate random colors
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <div className="App">
      <h1>Appliance Identifications Dashboard</h1>
      <div className="chart-container">
        <Bar data={barChartData} options={barChartOptions} />
      </div>
      <table border="1">
        <thead>
          <tr>
            <th>Serial Number</th>
            <th>Appliance Type</th>
            <th>Timestamp</th>
            <th>Damage</th>
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
              <td>{identification.damage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
