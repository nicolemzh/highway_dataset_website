const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());

const externalDiskPath = "/Volumes/My Passport/ROS Trajectory Processed Data/";

app.use('/external', express.static(externalDiskPath));

// api call for all datasets
app.get('/api/datasets', (req, res) => {
  const baseURL = `http://localhost:${PORT}`;
  const datasets = fs.readdirSync(externalDiskPath)
    .filter((folder) => fs.lstatSync(path.join(externalDiskPath, folder)).isDirectory())
    .map((folder) => ({
      id: folder,
      name: `${folder}`,
      preprocessed: `${baseURL}/external/${folder}/${folder}_preprocessed.csv`,
      wave: `${baseURL}/external/${folder}/${folder}_waves.csv`,
      time_velocity_graph: `${baseURL}/external/${folder}/${folder}_time_velocity_graph.png`,
      time_acceleration_graph: `${baseURL}/external/${folder}/${folder}_time_acceleration_graph.png`,
    }));

  res.json(datasets);
});

// api call for waves id (lat/long info)
app.get('/api/waves/:id', (req, res) => {
  const datasetId = req.params.id;
  const waveFilePath = path.join(externalDiskPath, datasetId, `${datasetId}_waves.csv`);

  const waves = [];
  if (fs.existsSync(waveFilePath)) {
    fs.createReadStream(waveFilePath)
      .pipe(csv())
      .on('data', (row) => {
        const lat = parseFloat(row.lat);
        const long = parseFloat(row.long);
        
        // Check if lat and long are valid numbers (i.e., not NaN or null)
        if (!isNaN(lat) && !isNaN(long)) {
          waves.push({ wave_id: parseInt(row.wave_id), lat: lat, long: long });
        }
      })
      .on('end', () => {
        res.json(waves);
      })
      .on('error', (err) => {
        console.error('Error reading wave CSV file:', err);
        res.status(500).json({ error: 'Error fetching wave data' });
      });
  } else {
    res.status(404).json({ error: 'Wave file not found' });
  }
});


// api call for processed id (lat/long info)
app.get('/api/preprocessed/:id', (req, res) => {
  const datasetId = req.params.id;
  const preprocessedFilePath = path.join(externalDiskPath, datasetId, `${datasetId}_preprocessed.csv`);

  const preprocessed = [];
  if (fs.existsSync(preprocessedFilePath)) {
    fs.createReadStream(preprocessedFilePath)
      .pipe(csv())
      .on('data', (row) => {
        const lat = parseFloat(row.lat);
        const long = parseFloat(row.long);
        
        // Check if lat and long are valid numbers (i.e., not NaN or null)
        if (!isNaN(lat) && !isNaN(long)) {
          preprocessed.push({ lat: lat, long: long });
        }
      })
      .on('end', () => {
        res.json(preprocessed);
      })
      .on('error', (err) => {
        console.error('Error reading preprocessed CSV file:', err);
        res.status(500).json({ error: 'Error fetching preprocessed data' });
      });
  } else {
    res.status(404).json({ error: 'Preprocessed file not found' });
  }
});



app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
