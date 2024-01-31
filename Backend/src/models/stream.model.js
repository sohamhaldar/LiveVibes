import mongoose,{Schema} from "mongoose";

///add status to it tooo;
const streamSchema=Schema({
    title:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId, 
        ref:"User"
    },
    thumbnail:{
        type:String,
        default:"https://res.cloudinary.com/dnyi9ceiy/image/upload/v1706086629/LiveVibes/live-logo_vvuzxf.png"
    }
},{
    timeStamps:true
});


export const Stream=mongoose.model("Stream",streamSchema);