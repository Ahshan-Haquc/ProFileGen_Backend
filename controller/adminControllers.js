const UserModel = require('../models/userSchema')
const UserCVModel = require('../models/userCVSchema')

//default error sent in try-catch error find
const catchErrorSentInErrorHandler=()=>{
    console.log("error in backend admin controller in catch block is : ",error)
        res.status(500);
        throw new Error();
}

const fetchAdminDashboard = async (req, res)=>{
    try {
        // Fetch data for the admin dashboard
        const dashboardData = {
            usersCount: await UserModel.countDocuments(),
            totalCVs: await UserCVModel.countDocuments()
        };
        //now i want to fetch users who are registered within recent 30 days
        const recentUsers = await UserModel.find({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
        res.status(200).json({ ...dashboardData, recentUsers, success:true });
    } catch (error) {
        catchErrorSentInErrorHandler();
    }
}

const fetchManageUsersData= async(req,res)=>{
    console.log("Request recieved in backend");
    try {
        const fetchData={
            totalUsers:0,
            totalActiveUsers:0,
            totalInactiveUsers:0,
            totalBlockedUsers:0,
            userData:[]
        }
        const users = await UserModel.find();
        if(!users){
            res.status(404);
            throw new Error("No users found");
        }
        fetchData.totalUsers=users.length;
        users.forEach(element => {
            if (element.status === 'active') {
                fetchData.totalActiveUsers++;
            } else if (element.status === 'inactive') {
                fetchData.totalInactiveUsers++;
            } else if (element.status === 'blocked') {
                fetchData.totalBlockedUsers++;
            }
            fetchData.userData.push({
                id:element._id,
                name:element.name,
                email:element.email,
                status:element.status,
                registrationDate:element.createdAt,
                role:element.role
            })
        });
        res.status(200).json({ ...fetchData, success:true });
    } catch (error) {
        catchErrorSentInErrorHandler();
    }
}

const deleteUser = async(req, res)=>{
    console.log("Request recieved in backend for delete user");
    try {
        const {id} = req.params;
        console.log(id);
        await UserModel.deleteOne({_id:id});

        res.status(200).json({success:true,})
    } catch (error) {
        catchErrorSentInErrorHandler();
    }
}
const blockUser = async(req, res)=>{
    console.log("running block user")
    try {
        const {id} = req.params;
        const user = await UserModel.findByIdAndUpdate(
            id,
            { status: "blocked" },
            { new: true }
        );

        res.status(200).json({success:true,})
    } catch (error) {
        catchErrorSentInErrorHandler();
    }
}
const unblockUser = async(req, res)=>{
    console.log("running unblock user")
    try {
        const {id} = req.params;
        const user = await UserModel.findByIdAndUpdate(
            id,
            { status: "active" },
            { new: true }
        );

        res.status(200).json({success:true,})
    } catch (error) {
        catchErrorSentInErrorHandler();
    }
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { name, email, role, status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    catchErrorSentInErrorHandler();
  }
};

module.exports = { fetchAdminDashboard, fetchManageUsersData, updateUser, deleteUser, blockUser, unblockUser };