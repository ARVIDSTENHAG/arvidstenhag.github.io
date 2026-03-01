const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

/*
  Serve entire portfolio folder as static root
*/
app.use(express.static(path.join(__dirname, '../portfolio')));

/*
  Root route → portfolio/index.html
*/
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../portfolio/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});