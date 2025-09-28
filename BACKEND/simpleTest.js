// simpleTest.js
const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'Test server is running!' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});