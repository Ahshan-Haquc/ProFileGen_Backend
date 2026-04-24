const UserCVModel = require("../models/userCVSchema")

const getUserDashboardAllData = async (req, res)=>{
    try {
        const userAllCvs = await UserCVModel.find({userId: req.userInfo._id});
        const userFavoriteCvs = await UserCVModel.find({userId: req.userInfo._id, isFavorite: true});
        const lastUpdatedCv = await UserCVModel.findOne({userId: req.userInfo._id}).sort({updatedAt: -1});

        res.status(200).json({
            success: true,
            userAllCvs: userAllCvs,
            userFavoriteCvs: userFavoriteCvs,
            lastUpdatedCv: lastUpdatedCv
        });
    } catch (error) {
        console.error("Error fetching user dashboard data:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

module.exports = { getUserDashboardAllData }
