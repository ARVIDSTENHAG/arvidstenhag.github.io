const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

/*
  Serve entire root folder (which now contains the portfolio) as static root
*/
app.use(express.static(path.join(__dirname, '../')));

/*
  Root route → index.html
*/
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});