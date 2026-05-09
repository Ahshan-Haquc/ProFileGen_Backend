"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unblockUser = exports.blockUser = exports.deleteUser = exports.updateUser = exports.fetchManageUsersData = exports.fetchAdminDashboard = void 0;
const userSchema_1 = __importDefault(require("../models/userSchema"));
const userCVSchema_1 = __importDefault(require("../models/userCVSchema"));
const catchErrorSentInErrorHandler = (res, error) => {
    console.error("error in backend admin controller in catch block is : ", error);
    res.status(500).json({ success: false, message: "Server error" });
};
const fetchAdminDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dashboardData = {
            usersCount: yield userSchema_1.default.countDocuments().exec(),
            totalCVs: yield userCVSchema_1.default.countDocuments().exec(),
        };
        const recentUsers = yield userSchema_1.default.find({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }).exec();
        res.status(200).json(Object.assign(Object.assign({}, dashboardData), { recentUsers, success: true }));
    }
    catch (error) {
        catchErrorSentInErrorHandler(res, error);
    }
});
exports.fetchAdminDashboard = fetchAdminDashboard;
const fetchManageUsersData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Request received in backend");
    try {
        const fetchData = {
            totalUsers: 0,
            totalActiveUsers: 0,
            totalInactiveUsers: 0,
            totalBlockedUsers: 0,
            userData: [],
        };
        const users = yield userSchema_1.default.find().exec();
        if (!users.length) {
            res.status(404).json({ success: false, message: "No users found" });
            return;
        }
        fetchData.totalUsers = users.length;
        users.forEach((element) => {
            if (element.status === "active") {
                fetchData.totalActiveUsers++;
            }
            else if (element.status === "inactive") {
                fetchData.totalInactiveUsers++;
            }
            else if (element.status === "blocked") {
                fetchData.totalBlockedUsers++;
            }
            fetchData.userData.push({
                id: element._id.toString(),
                name: element.name,
                email: element.email,
                status: element.status,
                registrationDate: element.createdAt,
                role: element.role,
            });
        });
        res.status(200).json(Object.assign(Object.assign({}, fetchData), { success: true }));
    }
    catch (error) {
        catchErrorSentInErrorHandler(res, error);
    }
});
exports.fetchManageUsersData = fetchManageUsersData;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Request received in backend for delete user");
    try {
        const { id } = req.params;
        yield userSchema_1.default.deleteOne({ _id: id }).exec();
        res.status(200).json({ success: true });
    }
    catch (error) {
        catchErrorSentInErrorHandler(res, error);
    }
});
exports.deleteUser = deleteUser;
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("running block user");
    try {
        const { id } = req.params;
        yield userSchema_1.default.findByIdAndUpdate(id, { status: "blocked" }, { new: true }).exec();
        res.status(200).json({ success: true });
    }
    catch (error) {
        catchErrorSentInErrorHandler(res, error);
    }
});
exports.blockUser = blockUser;
const unblockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("running unblock user");
    try {
        const { id } = req.params;
        yield userSchema_1.default.findByIdAndUpdate(id, { status: "active" }, { new: true }).exec();
        res.status(200).json({ success: true });
    }
    catch (error) {
        catchErrorSentInErrorHandler(res, error);
    }
});
exports.unblockUser = unblockUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, email, role, status } = req.body;
        const updatedUser = yield userSchema_1.default.findByIdAndUpdate(id, { name, email, role, status }, { new: true }).exec();
        if (!updatedUser) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        res.json({ success: true, user: updatedUser });
    }
    catch (error) {
        catchErrorSentInErrorHandler(res, error);
    }
});
exports.updateUser = updateUser;
