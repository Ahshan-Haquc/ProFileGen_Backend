import type { Request, Response } from "express";
import UserModel from "../models/userSchema";
import UserCVModel from "../models/userCVSchema";

const catchErrorSentInErrorHandler = (res: Response, error: unknown): void => {
  console.error("error in backend admin controller in catch block is : ", error);
  res.status(500).json({ success: false, message: "Server error" });
};

const fetchAdminDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const dashboardData = {
      usersCount: await UserModel.countDocuments().exec(),
      totalCVs: await UserCVModel.countDocuments().exec(),
    };

    const recentUsers = await UserModel.find({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }).exec();

    res.status(200).json({ ...dashboardData, recentUsers, success: true });
  } catch (error) {
    catchErrorSentInErrorHandler(res, error);
  }
};

const fetchManageUsersData = async (req: Request, res: Response): Promise<void> => {
  console.log("Request received in backend");

  try {
    const fetchData = {
      totalUsers: 0,
      totalActiveUsers: 0,
      totalInactiveUsers: 0,
      totalBlockedUsers: 0,
      userData: [] as Array<{
        id: string;
        name: string;
        email: string;
        status: string;
        registrationDate: Date;
        role: string;
      }>,
    };

    const users = await UserModel.find().exec();
    if (!users.length) {
      res.status(404).json({ success: false, message: "No users found" });
      return;
    }

    fetchData.totalUsers = users.length;

    users.forEach((element) => {
      if (element.status === "active") {
        fetchData.totalActiveUsers++;
      } else if (element.status === "inactive") {
        fetchData.totalInactiveUsers++;
      } else if (element.status === "blocked") {
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

    res.status(200).json({ ...fetchData, success: true });
  } catch (error) {
    catchErrorSentInErrorHandler(res, error);
  }
};

const deleteUser = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  console.log("Request received in backend for delete user");
  try {
    const { id } = req.params;
    await UserModel.deleteOne({ _id: id }).exec();
    res.status(200).json({ success: true });
  } catch (error) {
    catchErrorSentInErrorHandler(res, error);
  }
};
const blockUser = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  console.log("running block user");
  try {
    const { id } = req.params;
    await UserModel.findByIdAndUpdate(id, { status: "blocked" }, { new: true }).exec();
    res.status(200).json({ success: true });
  } catch (error) {
    catchErrorSentInErrorHandler(res, error);
  }
};
const unblockUser = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  console.log("running unblock user");
  try {
    const { id } = req.params;
    await UserModel.findByIdAndUpdate(id, { status: "active" }, { new: true }).exec();
    res.status(200).json({ success: true });
  } catch (error) {
    catchErrorSentInErrorHandler(res, error);
  }
};

const updateUser = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body as {
      name?: string;
      email?: string;
      role?: string;
      status?: string;
    };

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { name, email, role, status },
      { new: true }
    ).exec();

    if (!updatedUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    catchErrorSentInErrorHandler(res, error);
  }
};

export { fetchAdminDashboard, fetchManageUsersData, updateUser, deleteUser, blockUser, unblockUser };
