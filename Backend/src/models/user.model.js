import mongoose,{Schema} from "mongoose";// destructured Schema here to avoid writing mongoose.Schema everywhere
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema=Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        avatar:{
            type:String, //cloudinary url as said by Hitesh sir
            default:'https://littlejohnremodeling.com/wp-content/uploads/2023/01/human-human-avatar-male-icon-with-png-and-vector-format-for-free-19807-300x204.png',
        },
        coverImage:{
            type:String//cloudinary url
        },
        // watchHistory:[
        //     {
        //         type:Schema.Types.ObjectId,
        //         ref:"Video"
        //     }
        // ],
        password:{
            type:String,
            required:[true,"Password is required"]
        },

    },
    {
        timeStamps:true,
    }
)

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    this.password=await bcrypt.hash(this.password,10);//the number here gives hash round/salt
    next();

}) //dont write the callback here using arrow function as we dont know normally the reference in arrow fn. 
//to get clear explaination watch user and video model video of hitesh chodhary sir from chai-backend

userSchema.methods.isPasswordCorrect=async function (password){
    return await bcrypt.compare(password,this.password);
}
userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};


export const User=mongoose.model("User",userSchema);