const mongoose = require("mongoose");

const otherSectionSchema = new mongoose.Schema(
  {
    sectionName: String,
    sectionValues: [String],
  },
  { _id: false }
);

const UserCVSchema = mongoose.Schema(
  {
    title: { type: String, default: `My CV - ${new Date().toLocaleDateString()}` }, // defalut CV name with date
    name: { type: String, default: "Enter Your Name" },
    profession: { type: String, default: "Enter Your Profession" },
    images: { type: String , default : "https://images.pexels.com/photos/8378733/pexels-photo-8378733.jpeg"},
    description: { type: String, default: "Enter Your Description" },
    phoneNumber: { type: String, default: "Enter Your Phone Number" },
    emailId: { type: String, default: "Enter Your Email" },
    linkedInId: { type: String, default: "Enter Your LinkedIn" },
    githubId: { type: String, default: "Enter Your GitHub" },
    portfolioLink: { type: String, default: "Enter Your Portfolio Link" },
    address: { type: String, default: "Enter Your Address" },

    skills: { type: Object },

    projects: [{ type: Object }],
    experience: [{ type: Object }],
    education: [{ type: Object }],
    achievement: [{ type: String }],
    activities: [{ type: String }],
    reference: [{ type: Object }],
    otherSection: [otherSectionSchema],

    template: {
      type: String,
      enum: ["Formal", "OneColumn", "Modern"],
      default: "Formal",
    },

    isFavorite: {
      type: Boolean,
      default: false,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const UserCVModel = mongoose.model("CV", UserCVSchema);
module.exports = UserCVModel;
