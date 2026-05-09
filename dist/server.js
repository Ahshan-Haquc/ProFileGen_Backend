"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routers_1 = __importDefault(require("./routes/routers"));
const adminRouters_1 = __importDefault(require("./routes/adminRouters"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./routes/subscriptionRoutes"));
const databaseConnect_1 = __importDefault(require("./config/databaseConnect"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.set("trust proxy", 1);
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://profilegen-cv-maker-frontend.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use("/uploads", express_1.default.static("uploads"));
app.use("/", routers_1.default);
app.use("/", authRoutes_1.default);
app.use("/admin", adminRouters_1.default);
app.use("/subscription", subscriptionRoutes_1.default);
app.post("/test-body", (req, res) => {
    console.log("req.body:", req.body);
    res.json({ body: req.body });
});
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : "3000";
(0, databaseConnect_1.default)();
app.use(errorHandler_1.default);
app.listen(Number(port), () => {
    console.log("Server running on port: ", port);
});
exports.default = app;
