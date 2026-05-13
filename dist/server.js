"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const databaseConnect_1 = __importDefault(require("./config/databaseConnect"));
dotenv_1.default.config();
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : "3000";
(0, databaseConnect_1.default)();
app_1.default.listen(Number(port), () => {
    console.log("Server running on port: ", port);
});
