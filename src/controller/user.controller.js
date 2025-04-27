import { User } from "../models/user.model.js";


export const getAllUsers = async(req,res) => {
    try{
        const currentUser = req.auth.userId;
        const users = await User.find()

        res.status(201).json(users);

    } catch(err){
        console.log(err.message)
    }
}

