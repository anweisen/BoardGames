import express from "express";

const app = express();

const port = 5000; // TODO
app.listen(port, () => {
  console.log(`HTTP Server listening on port ${port} / http://localhost:${port}`);
});
