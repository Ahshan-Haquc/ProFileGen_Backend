const UserModel = require('../models/userSchema')
const CVmodel = require('../models/userCVSchema')

const updateUserCvTitle = async (req,res)=>{
    try {
        const { cvId, newTitle } = req.body;
        if (!cvId || !newTitle) {
            return res.status(400).json({ message: "All fields are required" });
        }

        await CVmodel.findByIdAndUpdate(cvId, { title: newTitle });
        res.status(200).json({ success: true, message: "CV title updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

const fetchUserDashboardData = async (req, res)=>{
    try {
        const userCVs = await CVmodel.find({userId: req.userInfo._id});

        res.status(200).json({
            success: true,
            userCVs: userCVs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

const createNewCv = async (req, res) => {
    try {
        const userNewCV = new CVmodel({
            userId: req.userInfo._id
        })
        const userCV = await userNewCV.save();
        res.status(201).json({success: true, userCV, message:"Your CV file created. Now you can add info."});
    } catch (error) {
        res.status(500);
        throw new Error();
    }
}

const deleteUserCv = async (req, res) => {
    try {
        const { cvId } = req.params;
        await CVmodel.findByIdAndDelete(cvId);

        const userCVs = await CVmodel.find({userId: req.userInfo._id});

        res.status(200).json({
            success: true,
            userCVs: userCVs,
            message: "CV deleted successfully."
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

const toggleFavorite = async (req, res) => {
    try {
        const { cvId } = req.params;
        const cv = await CVmodel.findById(cvId);
        if (!cv) {
            return res.status(404).json({ success: false, message: "CV not found" });
        }

        if(cv.isFavorite){
            await CVmodel.findByIdAndUpdate(cvId, { isFavorite: false });
            const userCVs = await CVmodel.find({userId: req.userInfo._id});
            return res.status(200).json({ success: true, userCVs, message: "CV removed from favorites" });
        } else {
            await CVmodel.findByIdAndUpdate(cvId, { isFavorite: true });
            const userCVs = await CVmodel.find({userId: req.userInfo._id});
            return res.status(200).json({ success: true, userCVs, message: "CV added to favorites" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

const fetchFavoriteCVsOnly = async (req, res)=>{
    try {
       const userCVs = await CVmodel.find({userId: req.userInfo._id, isFavorite: true});

        res.status(200).json({
            success: true,
            userCVs: userCVs
        });
    } catch (error) {
       res.status(500).json({ success: false, message: "Server Error" }); 
    }
}

const fetchCurrentWorkingCV = async (req,res)=>{
    const {cvId} = req.params;
try {
        const userCurrentCV = await CVmodel.findOne({_id: cvId});

        res.status(200).json({
            success: true,
            userCurrentCV
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

module.exports = {updateUserCvTitle, fetchUserDashboardData, createNewCv, deleteUserCv, toggleFavorite, fetchFavoriteCVsOnly, fetchCurrentWorkingCV};