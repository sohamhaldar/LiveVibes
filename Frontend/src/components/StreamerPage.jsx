import React, { useState, useEffect,useCallback, useRef,useMemo } from 'react';
import ReactPlayer from 'react-player';
import axios from 'axios'; 
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import useStore from '../store/store.js';
import camera_on from '../assets/camera_on.png';
import camera_off from '../assets/camera_off.png';
import mic_on from '../assets/mic_on.png';
import mic_off from '../assets/mic_off.png';
import screenshare_on from '../assets/screenshare_on.png';
import screenshare_off from '../assets/screenshare_off.png';
import io from 'socket.io-client';


import plus_icon from '../assets/plus_icon.png'
 
const StreamerPage=()=>{
    const addStream = useStore((state) => state.addStream);
    const store = useStore((state) => state.localStream);
    const [streamId,setStreamId]=useState('');
    const username=useStore((state)=>state.user_name);
    const userAvatar=useStore((state)=>state.user_avatar);
    const[screenShare,setShareScreen]=useState(false);
    const[userVideo, setuserVideo] = useState(false);
    const [audio, setAudio] = useState(false);
    const screenStream=useRef(new MediaStream([]));
    const localStream=useRef(new MediaStream([]));
    const webcam=useRef(new MediaStream([]));
    const [thumbnail,setThumbnail]=useState('');
    const[thumbnailUrl,setThumbnailUrl]=useState(null);
    const [title,setTitle]=useState('');
    const[isLoading,setloading]=useState(true);
    const [streamstatus,setStreamstatus]=useState(false);
    // const [socket, setSocket] = useState(null);
    const socket = useMemo(
        () =>
          io(import.meta.env.VITE_SERVER_LINK, {
            withCredentials: true,
          }),
        []
      );
/////////////////////

    const [msg,setMsg]=useState('');
    const [comments,setComments]=useState([]);
    const sendMsg=async(e)=>{
        e.preventDefault();
        console.log(streamId);
        const payload={
            "username":username,
            "message": msg.trim(),
            "avatar":userAvatar,
            "streamId":streamId,
            "isOwner":true
        }
        socket.emit('msg',payload);
    };
    const stopStream=async()=>{
        const payload={
            "streamId":streamId,
            "isOwner":true
        }
        socket.emit('stream ended',payload);
        if(userVideo){
            toggleVideo();
        }
        if(audio){
            toggleAudio();
        }
        if(screenShare){
            toggleScreen();
        }
        webcam.current=new MediaStream([]);;
        screenStream.current=new MediaStream([]);
        const {data}=await axios.post(`${import.meta.env.VITE_SERVER_LINK}/user/ended`, {streamId},{withCredentials:true}); 
        console.log(data);
    }
    useEffect(() => {
        socket.on("connect", () => {
            console.log('socket connected'+socket.id); 
          })
        socket.on('hello',(ev)=>{
            console.log(ev);
        });
        socket.on('new msg',(m)=>{
            setComments((prevComments) => [...prevComments, m]);
            console.log(m);
        })
        socket.on("disconnect", () =>{
            console.log('socket disconnected: '+socket.id); 
        });
        

        return () => {
            socket.disconnect();
        };
    }, []);
    

    useEffect(()=>{
        if(thumbnail){
            setThumbnailUrl(URL.createObjectURL(thumbnail))
        }
        
    },[thumbnail]);

    const toggleVideo=async()=>{
        addWebcam();
        setuserVideo((previousState)=>!previousState);
    }
    const toggleScreen=async()=>{
        addScreen();
        setShareScreen((previousState)=>!previousState);
    }
    const toggleAudio=async()=>{
        setAudio((previousState)=>!previousState);
    }

    const addWebcam=async()=>{
        if(!userVideo){
            if(audio){
                const web=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
                web.name="webcam";
                webcam.current=web;
            }else{
                const web=await navigator.mediaDevices.getUserMedia({video:true});
                web.name="webcam";
                webcam.current=web;
            }
            console.log(webcam.current);
            webcam.current.getTracks().forEach((track) => {
                track.name="WEBCAM";
            });
            const stream=new MediaStream([...webcam.current.getTracks(),...screenStream.current.getTracks()]);
            localStream.current=stream;
            addStream(stream);
        }else{
            webcam.current.getTracks().forEach((track) => {
                console.log(track)
                track.stop()
            });
            webcam.current=new MediaStream([]);
        }
    }

    const addScreen=async()=>{
        if(!screenShare){
            setloading(true);
            const screen=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true});
            screenStream.current=screen;
            screenStream.current.getTracks().forEach((track) => {
                track.name="SCREENSHARE";
            });
            const stream=new MediaStream([...webcam.current.getTracks(),...screenStream.current.getTracks()]);
            localStream.current=stream;
            addStream(stream);
            setloading(false);

        }else{
            screenStream.current.getTracks().forEach((track) => {
                console.log(track)
                track.stop()
            });
            screenStream.current=new MediaStream([]);
        }
        localStream.current.getTracks().forEach((track) => {
            console.log(track)
        });
    }
    
    const e=async()=>{
        const {data}=await axios.post(`${import.meta.env.VITE_SERVER_LINK}/user/ended`, {streamId},{withCredentials:true}); 
        console.log(data);
    }
    useEffect(()=>{
        const stream=new MediaStream([...webcam.current.getTracks(),...screenStream.current.getTracks()]);
        localStream.current=stream;
        addStream(stream);
    },[audio,userVideo,screenShare]);

    const startStream=async()=>{
        console.log(store);
        try{
            if(userVideo&&screenShare){
            const webCampeer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: "stun:stun.stunprotocol.org"
                    }
                ]
            });
            const screenSharepeer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: "stun:stun.stunprotocol.org"
                    }
                ]
            });

            webcam.current.getTracks().forEach((track)=>{
                track.name="WEBCAM";
                webCampeer.addTrack(track,webcam.current);
            });
            screenStream.current.getTracks().forEach((track)=>{
                track.name="SCREENSHARE";
                screenSharepeer.addTrack(track,screenStream.current);
            });
            const webCamoffer = await webCampeer.createOffer();
            const screenShareoffer = await screenSharepeer.createOffer();
            await webCampeer.setLocalDescription(webCamoffer);
            await screenSharepeer.setLocalDescription(screenShareoffer);
            console.log(thumbnail);
            const formData = new FormData();
            formData.append('webCamsdp',JSON.stringify(webCampeer.localDescription));
            formData.append('screenSharesdp',JSON.stringify(screenSharepeer.localDescription));
            formData.append('thumbnail',thumbnail);
            formData.append('title',title);
            formData.append('peer_number',2);
            console.log(formData);

            const {data } = await axios.post(`${import.meta.env.VITE_SERVER_LINK}/user/start`, formData,{withCredentials:true}); 
            console.log(data);
            const webCamdesc = new RTCSessionDescription(data.webCamsdp);
            webCampeer.setRemoteDescription(webCamdesc).catch(e => console.log(e));
            const screenSharedesc = new RTCSessionDescription(data.screenSharesdp);
            screenSharepeer.setRemoteDescription(screenSharedesc).catch(e => console.log(e));
            console.log(webCampeer);
            console.log(screenSharepeer);
            if(webCampeer.connectionState=='new'||screenSharepeer.connectionState=='new'){
                console.log('Trying again')
                // startStream();
            }
            webCampeer.onicecandidate = (event) => {
                if (event.candidate === null) {
                  // ICE candidate gathering is complete
                  console.log("ICE gathering complete");
                  console.log(peer.connectionState);
                  // You can now print the connection state or perform other actions
                  if (peer.connectionState === "new") {
                    console.log("Trying again guys");
                    e();
                    startStream();
                  }
                }
              };
              screenSharepeer.onicecandidate = (event) => {
                if (event.candidate === null) {
                  // ICE candidate gathering is complete
                  console.log("ICE gathering complete");
                  console.log(peer.connectionState);
                  // You can now print the connection state or perform other actions
                  if (peer.connectionState === "new") {
                    console.log("Trying again guys");
                    e();
                    startStream();
                  }
                }
              };
            setStreamId(data.stringId);
            socket.emit("join",data.stringId);
        }else{
            const peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: "stun:stun.stunprotocol.org"
                    }
                ]
            });
            peer.onicecandidate = (event) => {
                if (event.candidate === null) {
                  // ICE candidate gathering is complete
                  console.log("ICE gathering complete");
                  console.log(peer.connectionState);
                  // You can now print the connection state or perform other actions
                  if (peer.connectionState === "new") {
                    console.log("Trying again guys");
                    e();
                    startStream();
                  }
                }
              };
            if(userVideo){
                webcam.current.getTracks().forEach((track)=>{
                    track.name="WEBCAM";
                    peer.addTrack(track,webcam.current);
                });
            }else{
                screenStream.current.getTracks().forEach((track)=>{
                    track.name="WEBCAM";
                    peer.addTrack(track,screenStream.current);
                });
            }
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            const formData = new FormData();
            formData.append('sdp',JSON.stringify(peer.localDescription));
            formData.append('thumbnail',thumbnail);
            formData.append('title',title);
            formData.append('peer_number',1);
            console.log(formData);
            const {data } = await axios.post(`${import.meta.env.VITE_SERVER_LINK}/user/start`, formData,{withCredentials:true}); 
            console.log(data);
            const desc = new RTCSessionDescription(data.sdp);
            await peer.setRemoteDescription(desc).catch(e => console.log(e));
            console.log(peer);
            socket.emit("join",data.stringId);
            setStreamstatus(true);
            setStreamId(data.stringId);
        }
        
            
        }catch(error) {
            console.log(error);
        }
    }


    return(
        <>
            <ToastContainer />
            <div className='bg-gradient-to-r from-cyan-400 to-blue-500 h-[88vh] w-screen flex-col justify-center items-center p-4 overflow-y-auto'>
                <div className='flex justify-center items-center p-2 h-[85%] w-full'>
                <div className=' bg-slate-200 h-5/6 w-3/6 m-2 rounded-lg flex justify-center items-center'>
                    {userVideo&&screenShare?(isLoading?(<>
                        <div className='h-full w-full flex justify-center items-center'>
                            <h1 className='tracking-wide text-slate-800 font-bold text-lg'>Please Wait....</h1>
                        </div>
                        <ReactPlayer url={webcam.current} width={"20%"} height={"40%"} playing/>
                        
                    </>):(<>
                        <ReactPlayer url={screenStream.current} width={"80%"} height={"100%"} playing/>
                        <ReactPlayer url={webcam.current} width={'20%'} height={'40%'} playing/>
                    </>)):(
                        (userVideo&&(<ReactPlayer url={webcam.current} width={"100%"} height={"100%"} playing/>))||
                        (screenShare&&(!isLoading?(<ReactPlayer url={screenStream.current} width={'100%'} height={'100%'} playing/>):(
                        <div className='h-full w-full flex justify-center items-center'>
                        <h1 className='tracking-wide text-slate-800 font-bold text-lg'>Please Wait....</h1>
                    </div> 
                    )))
                    )}
                    
                    
                    {!userVideo&&!screenShare&&(<h1 className=' text-slate-700 text-2xl bg-cyan-500 p-3 rounded-lg'>No Video</h1>)}
                </div>
                {!streamstatus?<div className='bg-slate-200 h-5/6 w-2/6 m-5 rounded-lg flex-col justify-center items-evenly'>
                    <div className='flex flex-col m-2 w-[90%] p-2'>
                        <p className='mx-2 text-slate-700 font-semibold tracking-wide'>Title</p>
                        <input type="text" className='m-1 p-1 px-2 rounded-lg' value={title} onChange={(e)=>setTitle(e.target.value)}/>
                    </div>
                    <div className='w-[95%] m-2 p-2'>
                        <p className='mx-1 text-slate-700 font-semibold tracking-wide'>Thumbnail</p>
                            <div style={{clipPath:"square()"}} title='Add Thumbnail' className='group relative flex justify-center items-center h-[100%] hover:cursor-pointer m-2' onClick={() => document.getElementById('avatar-input').click()}>
                                <input id='avatar-input' type="file" style={{display:'none'}}  onChange={(e)=>setThumbnail(e.target?.files[0])}/>
                                <img src={thumbnailUrl?thumbnailUrl:"https://littlejohnremodeling.com/wp-content/uploads/2023/01/human-human-avatar-male-icon-with-png-and-vector-format-for-free-19807-300x204.png"} style={{clipPath:"square()"}}  className=' border-cyan-500 border-2 rounded-lg w-auto h-20 group-hover:blur-sm group-hover:brightness-100 group-hover:invert-[20%]'/>
                                <img src={plus_icon} style={{clipPath:"square()"}} className='w-auto h-8 absolute opacity-0 group-hover:opacity-70' />
                            </div>
                    </div>
                    <div className='flex h-[20%] w-[95%] m-2 justify-evenly'>
                        <img className='m-2  bg-cyan-400 rounded-lg p-0.5 border-2 border-solid border-cyan-500 hover:bg-cyan-500 hover:cursor-pointer' title={userVideo?"Turn Off Camera":"Turn On Camera"} onClick={toggleVideo} src={userVideo?camera_on:camera_off}></img>
                        <img className='m-2  bg-cyan-400 rounded-lg p-0.5 border-2 border-solid border-cyan-500 hover:bg-cyan-500 hover:cursor-pointer' title={audio?"Turn Off Voice":"Turn On Voice"} onClick={toggleAudio} src={audio?mic_on:mic_off} ></img>
                        <img className='m-2  bg-cyan-400 rounded-lg p-0.5 border-2 border-solid border-cyan-500 hover:bg-cyan-500 hover:cursor-pointer' title={screenShare?"Turn Off ScreenShare":"Turn On ScreenShare"} onClick={toggleScreen} src={screenShare?screenshare_on:screenshare_off}></img>
                    </div>
                </div>:<div className='bg-slate-200 h-5/6 w-2/6 m-5 rounded-lg flex justify-center items-center'>
                        <div className='flex flex-col h-[95%] w-[95%] justify-center items-center'>
                        <div className='m-1 tracking-wide font-semibold text-lg'>Live Chats</div>
                        <div className=' w-[90%] h-[80%] bg-slate-500 m-1 rounded-md flex-col justify-center overflow-y-auto px-2'>
                        {
                            comments.map((comment, index) => (
                                <div key={index} id={index} className='max-w-[90%] bg-white rounded-md inline-block w-[90%] overflow-x-auto m-1'>
                                    <div className={`h-7 w-full flex ${comment.isOwner?'bg-cyan-400':'bg-slate-300'}`}>
                                        <img src={comment.avatar} className='m-1'/>
                                        <p className='m-1'>{comment.username}</p>
                                    </div>
                                    <div className='p-1'>{comment.message}</div>
                                </div>
                            ))
                        }
                        </div>
                        <div className='m-1 w-[90%]'>
                            <input className='w-[82%] p-2 rounded-md border-solid border-2 border-sky-400' type="text" placeholder='Write here' value={msg} onChange={(e)=>setMsg(e.target.value)} />
                            <button className=' m-0.5 w-[15%] bg-sky-400 p-2 rounded-md border-solid border-2 border-sky-500 hover:bg-sky-500' onClick={sendMsg}>Send</button>
                        </div>
                        </div>
                    </div>}
                </div>
                {!streamstatus?<div className='flex justify-center items-center'>
                    <button className=' bg-sky-800 text-slate-300 rounded-full p-4 px-6 tracking-wide font-semibold' onClick={startStream}>Start Stream</button>
                </div>:<div className='flex justify-center items-center'>
                    <button className=' bg-sky-800 text-slate-300 rounded-full p-4 px-6 tracking-wide font-semibold' onClick={stopStream}>Stop Stream</button>
                </div>}
                
            </div>
        </>
    )
}

export default StreamerPage;