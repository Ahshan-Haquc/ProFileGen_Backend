"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminControllers_1 = require("../controller/adminControllers");
const adminRouter = express_1.default.Router();
adminRouter.get("/dashboard", adminControllers_1.fetchAdminDashboard);
adminRouter.get("/manageUsers", adminControllers_1.fetchManageUsersData);
adminRouter.put("/updateUser/:id", adminControllers_1.updateUser);
adminRouter.delete("/deleteUser/:id", adminControllers_1.deleteUser);
adminRouter.patch("/blockUser/:id", adminControllers_1.blockUser);
adminRouter.patch("/unblockUser/:id", adminControllers_1.unblockUser);
exports.default = adminRouter;
