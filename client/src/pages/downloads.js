import React, { useState, useEffect } from 'react';
import DatasetTable from '../components/dataset_table';
import { Link } from 'react-router-dom';

function Downloads() {
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/datasets')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Datasets fetched:", data);
        setDatasets(data);
      })
      .catch((err) => {
        console.error("Error fetching datasets:", err);
      });
  }, []);  

  return (
    <div className="downloads">
      <h1>Downloads Page</h1>
      <div style={{ margin: '0 auto', maxWidth: '1300px', textAlign: 'left', lineHeight: '1.6', color: '#555', fontSize: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          ‼️ Dataset names follow the format <code>yyyy-mm-dd-hh-mm-ss</code>, indicating the date and time the ROS device was turned on.
        </div>
        <p>
          <strong>Download Links:</strong> Use the "Download Preprocessed Data" or "Download Wave Data" links for each dataset to save the data as a CSV.<br />
          <strong>Maps:</strong> Below the links are interactive maps created with Leaflet, visualizing the trajectory of each trip. The wave map uses different 
          colors to distinguish between waves.<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ⚠️ We only started collecting GPS data at the beginning on July, 2024. Some downloadable datasets 
          do not have GPS coordinates and map visualizations may not be available. <br />
          <strong>Time Series:</strong> Click on the images in the "Time Series" column to view detailed velocity and acceleration 
          plots. These time series also highlight portions categorized as waves by our algorithm and pinpoint specific points with significant oscillations.
        </p>
      </div>

      <DatasetTable datasets={datasets} />
      <div style={{ textAlign: 'center', marginBottom: '10px' }} > Return to the Home Page by clicking on the button below. 
        <Link to="/">
        <button>Go to Introduction</button>
      </Link>
      </div>
    </div>
  );
}

export default Downloads;
