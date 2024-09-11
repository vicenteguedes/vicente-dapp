"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = void 0;
const body_parser_1 = require("body-parser");
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const createServer = () => {
    const app = (0, express_1.default)();
    app
        .disable("x-powered-by")
        .use((0, morgan_1.default)("dev"))
        .use((0, body_parser_1.urlencoded)({ extended: true }))
        .use((0, body_parser_1.json)())
        .use((0, cors_1.default)())
        .use("/api", routes_1.router);
    return app;
};
exports.createServer = createServer;
