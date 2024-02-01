import React, { useState, useEffect ,useRef} from 'react';
import useStore from '../store/store.js';
import axios from 'axios';
import ReactPlayer from 'react-player';
import {io} from 'socket.io-client';


const WatchStream=()=>{
    const streamId = useStore((state) => state.selectedStreamId);
    const stream=useStore((state)=>state.currentStream);
    const username=useStore((state)=>state.user_name);
    const userAvatar=useStore((state)=>state.user_avatar);
    const[streamstatus, setStreamstatus] = useState(true);
    const screenStream=useRef(new MediaStream([]));
    const [localStream,setLocalStream]=useState(null);
    const webcam=useRef(new MediaStream([]));
    const[isLoading,setloading]=useState(true);
    const[loading,setLoading]=useState(true);
    const [msg,setMsg]=useState('');
    const [comments,setComments]=useState([]);
    const socket=useRef();
    const sendMsg=async(e)=>{
        e.preventDefault();
        const payload={
            "username":username,
            "message": msg.trim(),
            "avatar":userAvatar,
            "streamId":streamId,
            "isOwner":false
        }
        socket.current.emit('msg',payload);
    }

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SERVER_LINK);
        socket.current=newSocket;
        newSocket.on("connect", () => {
            console.log('socket connected'+newSocket.id); 
        })
        newSocket.on('hello',(ev)=>{
            console.log(ev);
            newSocket.emit('hello');
        })
        newSocket.on("disconnect", () =>{
            console.log('socket disconnected: '+newSocket.id); 
        });
        newSocket.on('new msg',(m)=>{
            setComments((prevComments) => [...prevComments, m]);
            console.log(m);
        });
        newSocket.on('end',(m)=>{
            /// implement stop stream
            setLocalStream(null);
            setStreamstatus(false);
            webcam.current=null;
            screenStream.current=null;
            setloading(true);
            setLoading(true);    
        })
        newSocket.emit('join',streamId);
        newSocket.emit('hello guys i entered:'+newSocket.id);

        return () => {
        newSocket.disconnect();
        };
    }, []);
    const watch=async()=>{
        try{
            setloading(true);
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
            webCampeer.addTransceiver("video",{direction: "recvonly"});
            screenSharepeer.addTransceiver("video",{direction: "recvonly"});
            webCampeer.addTransceiver("audio",{direction: "recvonly"});
            screenSharepeer.addTransceiver("audio",{direction: "recvonly"});
            webCampeer.ontrack = (e) => {
                setLocalStream(e.streams[0]);
                webcam.current=e.streams[0];
                setloading(false)
                // setLoading(false)
                console.log(webcam.current)
            };
            screenSharepeer.ontrack = (e) => {
                setLocalStream(e.streams[0]);
                screenStream.current=e.streams[0];
                setLoading(false)
                console.log(screenStream.current)
            };
            
            const webCamoffer = await webCampeer.createOffer();
            const screenShareoffer = await screenSharepeer.createOffer();
            await webCampeer.setLocalDescription(webCamoffer);
            await screenSharepeer.setLocalDescription(screenShareoffer);
            const payload={
                webCamsdp: webCampeer.localDescription,
                screenSharesdp:screenSharepeer.localDescription,
                streamId
            }
            const {data } = await axios.post(`${import.meta.env.VITE_SERVER_LINK}/user/watch`, payload,{withCredentials:true}); 
            console.log(data);
            const webCamdesc = new RTCSessionDescription(data.webCamsdp);
            webCampeer.setRemoteDescription(webCamdesc).catch(e => console.log(e));
            const screenSharedesc = new RTCSessionDescription(data.screenSharesdp);
            screenSharepeer.setRemoteDescription(screenSharedesc).catch(e => console.log(e));
            
            console.log(webCampeer);
            console.log(screenSharepeer);
            // setloading(false);
    
        }catch(error){
            console.log(error);
        }
    }
    useEffect(()=>{
        watch();
    },[])


    return( 
        <>
             <div className='bg-gradient-to-r from-cyan-400 to-blue-500 h-[88vh] w-screen flex-col justify-center items-center p-2 overflow-y-auto'>
                <div className='flex justify-center items-center p-2 h-[75%] w-full '>
                    <div className=' bg-slate-200 h-[90%] w-3/6 m-5 rounded-lg flex'> 
                    {
                        !isLoading&&!loading?(
                            <> 
                            <ReactPlayer url={screenStream.current} width={"70%"} height={"100%"} playing/>
                        <ReactPlayer url={webcam.current} width={'20%'} height={'40%'} playing/>   
                            </> 
                            
                        ):(!isLoading||!loading?((!isLoading&&(<ReactPlayer url={webcam.current} width={"100%"} height={"100%"} playing/>))||
                            (!loading&&(<ReactPlayer url={screenStream.current} width={"100%"} height={"100%"} playing/>)))
                            :(isLoading&&loading&&(
                                <div className='w-full h-full flex justify-center items-center'>
                                    {streamstatus?(<p className=' text-slate-300 bg-sky-600 rounded-lg p-2'>Please wait</p>):(<p className=' text-slate-300 bg-sky-600 rounded-lg p-2'>Stream Ended</p>)}
                                </div>
                            ))
                        )
                    }
                    </div>
                    <div className='bg-slate-200 h-5/6 w-2/6 m-5 rounded-lg flex justify-center items-center'>
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
                    </div>
                </div>
                <div className='h-[25%] w-full flex justify-center items-center' >
                    <div className=' flex-wrap flex-col space-y-8 justify-center p-1 items-center bg-slate-200 w-3/6 m-5 h-[80%] rounded-lg'>
                        <div>
                            <h1 className='font-bold tracking-wide text-lg mx-2'>{stream.title}</h1>
                        </div>
                        <div>
                            <p className='font-semibold text-slate-700 mx-2'>{stream.owner}</p>
                        </div>
                    </div>
                    <div className='w-2/6 h-[80%] m-5'>

                    </div>
                </div>
                
            </div>
        </>
    )
}

export default WatchStream;