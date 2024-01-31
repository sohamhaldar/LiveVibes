import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {createServer} from 'http';
import {Server} from 'socket.io';
const app=express();
const server=createServer(app);
const io=new Server(server,{
    cors:{
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
});

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
  });
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

io.on("connection", (socket) => {
    console.log('user '+socket.id);

    socket.on("join", (streamId) => {
        console.log('streamId: ',streamId);
        socket.join(streamId);
        console.log("User Joined Room: " + streamId);
    });
    socket.on('msg',(msg)=>{
        console.log('msg from '+socket.id+" "+msg);
        io.to(msg.streamId).emit('new msg',msg); 
    });
    socket.on('stream ended',(msg)=>{
        io.to(msg.streamId).emit('end',msg);
    })
    
});


import userRouter from './routes/user.routes.js';

app.use('/user',userRouter);
// http://localhost:8000/user/register

export {server,io};