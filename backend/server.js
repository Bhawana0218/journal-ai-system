
const express = require("express");
require('events').EventEmitter.defaultMaxListeners = 20;

const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const journalRoutes = require('./routes/journalRoutes');

const app = express();

connectDB();


app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("AI Journal API Running");
});

// app.use('/api', journalRoutes); 

app.use('/api', (req,res,next)=>{
  console.log("API hit:", req.method, req.url);
  next();
});

app.use('/api', journalRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✓`);
});