const mongoose = require('mongoose')
const UserModel = require('../models/userSchema')
const bcrypt = require('bcrypt')

const adminSignup = async (req,res)=>{
    try {
        const {email} = req.body;
        const password = await bcrypt.hash(req.body.password, 10);
        const role="admin";

    if(!email || !password || !role){
        res.status(400);
        throw new Error();
    }
    const user = await UserModel.findOne({email});
    if(user){
        res.status(400).json({success:false, message:"Try with another email account."});
    }else{
        const Admin = new UserModel({
            email, password, role
        })
        const data= await Admin.save();
        res.status(201).json({success:true, message:"Admin created succesfully"});
    }
    } catch (error) {
        res.status(500).json({message:"server error",error})
    }
}

module.exports = {
    adminSignup
}