import express from "express";

const router = express.Router();

router.get("/message/:name", (req, res) => {
  return res.json({ message: `hello ${req.params.name}` });
});

router.get("/status", (_, res) => {
  return res.json({ ok: true });
});

export { router };
