import mongoose, { Document } from "mongoose";

export interface IOtherSection {
  sectionName: string;
  sectionValues: string[];
}

export interface IProject {
  projectName: string;
  projectDescription: string;
  projectToolsAndTechnologies: string;
}

export interface IExperience {
  organizationName: string;
  organizationAddress: string;
  joiningDate: string;
  endingDate: string;
  position: string;
  jobDescription: string;
}

export interface IEducation {
  educationQualification: string;
  educationInstitutionName: string;
  startingDate: string;
  endingDate: string;
}

export interface IReference {
  referenceName: string;
  referenceCompany: string;
  referenceEmail: string;
  referencePhone: string;
}

export interface IUserCV {
  title: string;
  name: string;
  profession: string;
  images: string;
  description: string;
  phoneNumber: string;
  emailId: string;
  linkedInId: string;
  githubId: string;
  portfolioLink: string;
  address: string;
  skills: Record<string, unknown>;
  projects: IProject[];
  experience: IExperience[];
  education: IEducation[];
  achievement: string[];
  activities: string[];
  reference: IReference[];
  otherSection: IOtherSection[];
  template: "Formal" | "OneColumn" | "Modern";
  isFavorite: boolean;
  userId: mongoose.Types.ObjectId;
}

export interface IUserCVDoc extends IUserCV, Document {}

const otherSectionSchema = new mongoose.Schema<IOtherSection>(
  {
    sectionName: { type: String, required: true },
    sectionValues: { type: [String], default: [] },
  },
  { _id: false }
);

const UserCVSchema = new mongoose.Schema<IUserCVDoc>(
  {
    title: { type: String, default: `Untitled CV - ${new Date().toLocaleDateString()}` },
    name: { type: String, default: "Enter Your Name" },
    profession: { type: String, default: "Enter Your Profession" },
    images: {
      type: String,
      default: "https://images.pexels.com/photos/8378733/pexels-photo-8378733.jpeg",
    },
    description: { type: String, default: "Enter Your Description" },
    phoneNumber: { type: String, default: "Enter Your Phone Number" },
    emailId: { type: String, default: "Enter Your Email" },
    linkedInId: { type: String, default: "Enter Your LinkedIn" },
    githubId: { type: String, default: "Enter Your GitHub" },
    portfolioLink: { type: String, default: "Enter Your Portfolio Link" },
    address: { type: String, default: "Enter Your Address" },
    skills: { type: Object, default: {} },
    projects: { type: [Object], default: [] },
    experience: { type: [Object], default: [] },
    education: { type: [Object], default: [] },
    achievement: { type: [String], default: [] },
    activities: { type: [String], default: [] },
    reference: { type: [Object], default: [] },
    otherSection: { type: [otherSectionSchema], default: [] },
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

const UserCVModel = mongoose.model<IUserCVDoc>("CV", UserCVSchema);
export default UserCVModel;

