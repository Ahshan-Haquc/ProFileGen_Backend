const CVmodel = require("../models/userCVSchema")

const deleteSectionData = async (req, res, next) => {
    try {
        console.log("working here")
        const sectionName = req.body.sectionName;
        console.log(sectionName)
        await CVmodel.updateOne(
            { userId: req.userInfo._id },
            { $set: { [sectionName]: [] } }
        );
        
        const updatedCV = await CVmodel.findOne({userId: req.userInfo._id}) ;

        res.status(200).json({updatedCV, message: "Deleted successfully"})
    } catch (error) {
        console.log("Error in deleting section data : ",error);
        next(error);
    }
}

module.exports = {deleteSectionData};