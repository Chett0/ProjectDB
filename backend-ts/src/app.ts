import { Request, Response } from "express";
const express = require('express');
const app = express();

app.use(express.json()); // Parse JSON request bodies

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
