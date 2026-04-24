const UserCV = require('../models/userCVSchema')

const addNewSection=async (req,res,next)=>{
    try {
        const userCV = await UserCV.findOne({_id : req.body.cvId})
        if(!userCV) return res.status(400).json({message:"New section not added!"})
        
        userCV.otherSection.push({sectionName: req.body.sectionName});
        const updatedCV = await userCV.save();

        res.status(200).json({updatedCV, message:"New section added!"})
    } catch (error) {
        console.log("catch is catching error : ",error);
        next(error);
    }
}

const deleteSection = async (req, res, next) => {
  try {
    const userCV = await UserCV.findOne({ _id : req.body.cvId });
    if (!userCV) {
      return res.status(400).json({ error: "User CV not found" });
    }

    const index = req.body.sectionIndex;
    if (index < 0 || index >= userCV.otherSection.length) {
      return res.status(400).json({ error: "Invalid section index" });
    }

    userCV.otherSection.splice(index, 1);
    const updatedCV = await userCV.save();

    res.status(200).json({ updatedCV, message: "Section deleted successfully!" });
  } catch (err) {
    console.log("Error deleting section:", err);
    next(err);
  }
};

// Add a value to a specific section
const addSectionValue = async (req, res, next) => {
  try {
    const { sectionIndex, newValue } = req.body;
    const userCV = await UserCV.findOne({ _id : req.body.cvId });

    if (!userCV) return res.status(404).json({ error: "User CV not found" });

    if (sectionIndex < 0 || sectionIndex >= userCV.otherSection.length) {
      return res.status(400).json({ error: "Invalid section index" });
    }

    userCV.otherSection[sectionIndex].sectionValues.push(newValue);
    const updatedCV = await userCV.save();

    res.status(200).json({ updatedCV, message: "Content added successfully!" });
  } catch (err) {
    console.error("Error adding section value:", err);
    next(err);
  }
};

// Delete a value from a section
const deleteSectionValue = async (req, res, next) => {
  try {
    const { sectionIndex, valueIndex } = req.body;
    const userCV = await UserCV.findOne({ _id : req.body.cvId });

    if (!userCV) return res.status(404).json({ error: "User CV not found" });

    if (
      sectionIndex < 0 ||
      sectionIndex >= userCV.otherSection.length ||
      valueIndex < 0 ||
      valueIndex >= userCV.otherSection[sectionIndex].sectionValues.length
    ) {
      return res.status(400).json({ error: "Invalid index" });
    }

    userCV.otherSection[sectionIndex].sectionValues.splice(valueIndex, 1);
    const updatedCV = await userCV.save();

    res.status(200).json({ updatedCV, message: "Content deleted successfully!" });
  } catch (err) {
    console.error("Error deleting section value:", err);
    next(err);
  }
};

module.exports ={addNewSection, deleteSection, addSectionValue, deleteSectionValue};