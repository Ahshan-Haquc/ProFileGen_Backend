import express from "express";
import { fetchAdminDashboard, fetchManageUsersData, updateUser, deleteUser, blockUser, unblockUser } from "../controller/adminControllers";

const adminRouter = express.Router();

adminRouter.get("/dashboard", fetchAdminDashboard);
adminRouter.get("/manageUsers", fetchManageUsersData);
adminRouter.put("/updateUser/:id", updateUser);
adminRouter.delete("/deleteUser/:id", deleteUser);
adminRouter.patch("/blockUser/:id", blockUser);
adminRouter.patch("/unblockUser/:id", unblockUser);

export default adminRouter;
