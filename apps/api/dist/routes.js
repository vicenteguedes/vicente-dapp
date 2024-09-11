"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
exports.router = router;
router.get("/message/:name", (req, res) => {
    return res.json({ message: `hello ${req.params.name}` });
});
router.get("/status", (_, res) => {
    return res.json({ ok: true });
});
