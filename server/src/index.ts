import express from "express";
import expressWs from "express-ws";

const { app, getWss, applyTo } = expressWs(express());

app.ws("/gateway/:id", (ws, req) => {
})

const port = 5000; // TODO
app.listen(port, () => {
  console.log(`HTTP Server listening on port ${port} / http://localhost:${port}`);
});
