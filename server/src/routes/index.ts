import express from "express";
import {getLobbyItems} from "../lobby/controller";

const router = express.Router();

router.get("/lobbies", (req, res) => {
  res.json(getLobbyItems())
})

export default router;