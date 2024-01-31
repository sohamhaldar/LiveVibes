import { io } from "../app.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import webrtc from 'wrtc';
import { Stream } from "../models/stream.model.js";


let stream;
let webCamstreamMap=new Map();
let screenSharestreamMap=new Map();




const registerUser=async(req,res,next)=>{
    try {
        const {username,email,password}=req.body;
        console.log(req.file?.path);
        if(
            [email,username,password].some((field)=>field?.trim()==="")
        ){
            throw new ApiError(400,"All fields are required",);
        }
        const existedUser=await User.findOne({
            $or:[{username},{email}],
        })
        if(existedUser){
            throw new ApiError(409,"User with email or username already exists");
        }
    
        //from multer functionality
        const avatarLocalPath=req.file?.path;
        console.log(avatarLocalPath);
        let avatar;
        if(avatarLocalPath){
            avatar=await uploadOnCloudinary(avatarLocalPath);
            if(!avatar){
                throw new ApiError(400,"Avatar file is required");
            }
        }
        
    
        const user= await User.create({
            avatar:avatar?.url,
            email,
            password,
            username:username.toLowerCase()
        });
    
        const createdUser=await User.findById(user._id).select(
            "-password -refreshToken"
        ); //it excludes the terms in createdUser
    
        if(!createdUser){
            throw new ApiError(500,"Something went wrong while registering the user");
        }
    
    
        res.status(201).json(
            new ApiResponse(200,createdUser,"User registered succesfully")
        )
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json(new ApiResponse(error.statusCode, error.message));
        }else{
            res.status(500).json(new ApiResponse(500, "Something went wrong"));
        }
    }
}

const loginUser=async(req,res,next)=>{
    try{
        // console.log(req.body);
        const{username,password}=req.body;
        if(!username){
            throw new ApiError(400,"Username is required");
        }
        const user=await User.findOne({username});
        if(!user){
            throw new ApiError(404,"User does not exist"); 
        }
        
        const isPasswordValid=await user.isPasswordCorrect(password);
        if(!isPasswordValid){
            throw new ApiError(401,"Invalid User credentials");
        }
        const accessToken=await user.generateAccessToken();
        const loggedInUser=await User.findById(user._id).select("-password -refreshToken");
        const options={
            httpOnly:true,
            secure:true
        }
        return res.status(200).cookie("accessToken",accessToken,options).json(new ApiResponse(200,{
            user:loggedInUser,accessToken
        },
        "User logged In succesfully"))
    }catch(error){
        if (error instanceof ApiError) {
            res.status(error.statusCode).json(new ApiResponse(error.statusCode, error.message));
        }else{
            res.status(500).json(new ApiResponse(500, "Something went wrong"));
        }
    }
}
const watch=async(req,res,next)=>{
    try{
        const {webCamsdp,screenSharesdp,streamId}=req.body;
        const webCampeer = new webrtc.RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
        const screenSharepeer = new webrtc.RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
        io.on('connection',(socket)=>{
            socket.join(streamId);
            
        })
        
        let cam;let screen;
        webCamstreamMap.forEach((value, key) => {
            if(key == streamId ){
                cam=value;
            };
        });
        cam?.getTracks().forEach((track)=>webCampeer.addTrack(track,cam));
        screenSharestreamMap.forEach((value, key) => {
            if(key == streamId ){
                console.log(value);
                screen=value;
            };
        });
        screen?.getTracks().forEach((track)=>screenSharepeer.addTrack(track,screen));
        const webCamdesc = new webrtc.RTCSessionDescription(webCamsdp);
        webCampeer.setRemoteDescription(webCamdesc).catch(e => console.log(e));
        const screenSharedesc = new webrtc.RTCSessionDescription(screenSharesdp);
        await screenSharepeer.setRemoteDescription(screenSharedesc);
        const webCamanswer = await webCampeer.createAnswer(); 
        await webCampeer.setLocalDescription(webCamanswer);
        const screenShareanswer = await screenSharepeer.createAnswer();
        await screenSharepeer.setLocalDescription(screenShareanswer);
        const payload = {
            webCamsdp: webCampeer.localDescription,
            screenSharesdp:screenSharepeer.localDescription,
        }
        res.json(payload);

        
    }catch (error){
        next(error);
    }
}

const broadcast=async(req,res,next)=>{ 
    try{
        const {webCamsdp,screenSharesdp,title,peer_number,sdp}=req.body;
        console.log(req.body);
        
        if(peer_number==2){
        const webCampeer = new webrtc.RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
        const screenSharepeer = new webrtc.RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
        webCampeer.addTransceiver("video",{direction: "recvonly"});
        screenSharepeer.addTransceiver("video",{direction: "recvonly"});
        
        const thumbnailPath=req.file?.path;
        // console.log(thumbnailPath);
        let thumbnail;
        if(thumbnailPath){
            thumbnail=await uploadOnCloudinary(thumbnailPath);
            if(!thumbnail){
                throw new ApiError(400,"Thumbnail file is required");
            }
        }
        const streamInstance=await Stream.create({  
            title:title,
            owner: req.user._id,
            thumbnail:thumbnail?.url
        });
        const streamId=streamInstance._id;
        const { _id: stringId } = streamId;
        screenSharepeer.ontrack = (e) => {
            console.log(e);
            stream=e.streams[0];
            screenSharestreamMap.set(stringId,e.streams[0]);
        };
        webCampeer.ontrack = (e) => {
            console.log(e);
            webCamstreamMap.set(stringId,e.streams[0]);
        };
        //////////
        // io.on('connection',(socket)=>{
        //     socket.join(stringId);
        //     socket.on('msg',()=>{
        //         socket.emit('hello');
        //     });
        //     socket.on('hello',(ev)=>{
        //         console.log(ev)
        //     })
            // socket.broadcast.emit('hello user:'+socket.id);
            // io.emit("socket joined:");
            
        // });
        const webCamdesc = new webrtc.RTCSessionDescription(JSON.parse(webCamsdp));
        webCampeer.setRemoteDescription(webCamdesc).catch(e => console.log(e));
        const screenSharedesc = new webrtc.RTCSessionDescription(JSON.parse(screenSharesdp));
        await screenSharepeer.setRemoteDescription(screenSharedesc);
        const webCamanswer = await webCampeer.createAnswer(); 
        await webCampeer.setLocalDescription(webCamanswer);
        const screenShareanswer = await screenSharepeer.createAnswer();
        await screenSharepeer.setLocalDescription(screenShareanswer);
        const payload = {
            webCamsdp: webCampeer.localDescription,
            screenSharesdp:screenSharepeer.localDescription,
            stringId
        }
        res.json(payload);
    }else{
        const peer = new webrtc.RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
        peer.addTransceiver("video",{direction: "recvonly"});
        const thumbnailPath=req.file?.path;
        // console.log(thumbnailPath);
        let thumbnail;
        if(thumbnailPath){
            thumbnail=await uploadOnCloudinary(thumbnailPath);
            if(!thumbnail){
                throw new ApiError(400,"Thumbnail file is required");
            }
        }
        const streamInstance=await Stream.create({  
            title:title,
            owner: req.user._id,
            thumbnail:thumbnail?.url
        });
        const streamId=streamInstance._id;
        const { _id: stringId } = streamId;
        peer.ontrack = (e) => {
            console.log(e);
            stream=e.streams[0];
            webCamstreamMap.set(stringId,e.streams[0]);
        };
        ///////
        // io.on('connection',(socket)=>{
        //     socket.on('hello',(ev)=>{
        //         console.log(ev)
        //     })
        //     socket.join(stringId);
        //     socket.on('msg',()=>{
        //         socket.emit('hello');
        //     });
            
        //     socket.broadcast.emit('hello user:'+socket.id);  
        //     // io.emit("socket joined:");
            
        // });
        const desc = new webrtc.RTCSessionDescription(JSON.parse(sdp));
        peer.setRemoteDescription(desc).catch(e => console.log(e));
        const answer = await peer.createAnswer(); 
        await peer.setLocalDescription(answer);
        const payload = {
            sdp: peer.localDescription,
            stringId
        }
        res.json(payload);


    }
        
    }catch(error){
        next(error)
    }
}

const streamList=async(req,res,next)=>{
    try{
        const streams=await Stream.aggregate([
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"ownerInfo"
                },
            },
            {
                $addFields:{
                    ownerName:{
                        "$arrayElemAt":["$ownerInfo.username",0]
                    }
                },
            },
            {
                $project:{
                    _id:1,
                    ownerName:1,
                    title:1,
                    thumbnail:1     
                }
            }
        ]);
        console.log(streams);
        res.status(200).json(streams);    
    }catch(error){
        next(error);
    }
}
const streamEnded=async(req,res,next)=>{  
    try{
        const {streamId}=req.body;
        console.log(streamId);
        const deletedUser=await Stream.findByIdAndDelete(streamId);
        res.status(200).json({
            message:`Stream with id ${streamId}} has been ended`
        })
    } catch (error) {
        next(error);
    }
}


export {registerUser,loginUser,broadcast,streamList,watch,streamEnded}

