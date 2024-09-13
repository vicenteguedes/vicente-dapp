"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initViemClient = exports.viemClient = void 0;
const viem_1 = require("viem");
const initViemClient = () => {
    if (exports.viemClient) {
        return exports.viemClient;
    }
    exports.viemClient = (0, viem_1.createPublicClient)({
        transport: (0, viem_1.http)("https://sepolia.drpc.org"),
    });
};
exports.initViemClient = initViemClient;
