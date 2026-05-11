import express from "express";
import userAccessPermission from "../middleware/authUserPermision";
import { adminSignup, googleLogin, userSignup, userLogin , userLogout, checkUserAuth, checkAuth} from "../controller/auth";

const authRouter = express.Router();

authRouter.post("/userSignup", userSignup);
authRouter.post("/admin/signup", adminSignup);
authRouter.post("/googleLogin", googleLogin)

authRouter.post("/userLogin", userLogin);

authRouter.get("/userLogout", userAccessPermission, userLogout);

authRouter.get("/me", userAccessPermission, checkUserAuth);

authRouter.get("/", checkAuth);

export default authRouter;