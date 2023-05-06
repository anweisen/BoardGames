import express from "express";
import expressWs from "express-ws";

const {app, getWss, applyTo} = expressWs(express());

app.use((req, res, next) => {
  console.log(req.method, req.path);
  next()
})

import cors from "./routes/cors";
app.use(cors)
app.use(express.json());

import index from "./routes/index";
import gateway from "./routes/gateway";
app.use("/", index);
app.use("/gateway", gateway);

const port = 5000; // TODO
app.listen(port, () => {
  console.log(`HTTP Server listening on port ${port} / http://localhost:${port}`);
});
