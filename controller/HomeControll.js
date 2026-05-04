const CVmodel = require("../models/userCVSchema")

const updateUserProfile = async (req, res) => {
  try {
    const { userId, name, profession } = req.body;

    if (!userId || !name || !profession) {
      return res.status(400).json({ message: "All fields required" });
    }

    let updateData = { name, profession };

    if (req.file && req.file.path) {
      // Cloudinary auto provides a secure URL in req.file.path
      updateData.images = req.file.path;
    }

    await CVmodel.updateOne(
      { userId },
      { $set: updateData },
      { upsert: true }
    );

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

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

const updateDescription = async (req, res, next) => {
  try {
    const { cvId, userDescription } = req.body;
    if (!cvId || !userDescription) {
      return res.status(400).json({ message: "Input field not filled" });
    }
    await CVmodel.updateOne(
      { _id: cvId },
      {
        $set: {
          description: userDescription
        }
      }
    )
    res.status(200).json({ success: true, message: "Your description updated succesfully." });
  } catch (error) {
    next(error);
  }
}

const updateUserContact = async (req, res, next) => {
  try {
    const {
      cvId,
      phoneNumber,
      emailId,
      linkedInId,
      githubId,
      portfolioLink,
      address
    } = req.body;

    if (
      !cvId ||
      !phoneNumber ||
      !emailId ||
      !linkedInId ||
      !githubId ||
      !portfolioLink ||
      !address
    ) {
      return res.status(401).json({ message: "Input field not filled" });
    }

    await CVmodel.updateOne(
      { _id: cvId },
      {
        $set: {
          phoneNumber,
          emailId,
          linkedInId,
          githubId,
          portfolioLink,
          address
        }
      }
    );
    res.status(200).json({ success: true, message: "Your contact updated succesfully." });
  } catch (error) {
    next(error);
  }
}

const updateUserSkills = async (req, res) => {
  const { cvId, skills } = req.body;

  try {
    const userCV = await CVmodel.findOne({ _id: cvId });

    if (!userCV) {
      return res.status(404).json({ message: "User CV not found" });
    }

    userCV.skills = skills;

    await userCV.save();

    return res.status(200).json({ message: "Skills updated", updatedCV: userCV });
  } catch (error) {
    console.error("Error updating skills:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateUserProjects = async (req, res, next) => {
  try {
    const { cvId, projectName, projectDescription, projectToolsAndTechnologies } = req.body;
    if (!cvId || !projectName || !projectDescription || !projectToolsAndTechnologies) {
      return res.status(401).json({ message: "Input field not filled" });
    }
    const userCV = await CVmodel.findOne({ _id: cvId });
    if (!userCV) {
      return res.status(400).json({ message: "User cv not found" });
    }
    userCV.projects.push({ projectName, projectDescription, projectToolsAndTechnologies });
    await userCV.save();
    res.status(200).json({ updatedCV: userCV, message: "Your project updated succesfully." });
  } catch (error) {
    next(error);
  }
}

module.exports = { updateUserProfile, deleteSectionData, updateDescription, updateUserContact, updateUserSkills, updateUserProjects};