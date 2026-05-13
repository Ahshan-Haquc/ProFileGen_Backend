"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routers_1 = __importDefault(require("./routes/routers"));
const adminRouters_1 = __importDefault(require("./routes/adminRouters"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./routes/subscriptionRoutes"));
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
        "https://profilegen-cv-maker-frontend.vercel.app",
        "https://profilegen-frontend.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use("/uploads", express_1.default.static("uploads"));
app.use("/", routers_1.default);
app.use("/auth", authRoutes_1.default);
app.use("/admin", adminRouters_1.default);
app.use("/subscription", subscriptionRoutes_1.default);
app.post("/test-body", (req, res) => {
    console.log("req.body:", req.body);
    res.json({ body: req.body });
});
app.use(errorHandler_1.default);
exports.default = app;
