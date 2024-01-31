import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const verifyJWT=async(req,_,next)=>{// we can write _ in place of res if res is not used 
    try {
        console.log(req);
        const token=req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer","");
        if(!token){
            throw new ApiError(401,"Unauthorithzed request");
        }
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user=await User.findById(decodedToken?._id).select("-password");
    
        if(!user){
            throw new ApiError(401,"Invalid Access token");
        }
    
        req.user=user;
        next();
    }catch(error) {
        throw new ApiError(401,error?.message||"Invalid access Token");
    }

}