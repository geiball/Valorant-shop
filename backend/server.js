const express = require('express');
const cors = require('cors');
require('dotenv').config();

const storeRouter = require('./routes/store');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/store', storeRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
