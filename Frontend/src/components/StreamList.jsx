import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StreamComponent from './StreamComponent';


const StreamList=()=>{
    const [data,setData]=useState(null);
    const[isLoading,setloading]=useState(true);
    const getStreams=async()=>{
        try{
            setloading(true)
            const {data}=await axios.get(`${import.meta.env.VITE_SERVER_LINK}/user/getStreams`);
            console.log(data);
            setData(data);
            setloading(false);
        }catch(error) {
           console.log(error); 
        }
    }
    useEffect(()=>{
        getStreams();
        console.log(data);
    },[]);


    return(
        <>
            <div className='bg-gradient-to-r from-cyan-400 to-blue-500 h-[88vh] w-screen flex-col justify-center items-center p-4 space-y-3 overflow-y-auto'>
                {!isLoading?(data.length!=0?data.map(item => (
                        <StreamComponent  key={item._id} title={item.title} img={item.thumbnail} owner={item.ownerName} id={item._id}/> 
                )):<div className='h-full w-full flex justify-center items-center'>
                        <h1 className='tracking-wide text-slate-800 font-bold text-3xl'>No Streams To Show</h1>
                    </div>):(
                    <div className='h-full w-full flex justify-center items-center'>
                        <h1 className='tracking-wide text-slate-800 font-bold text-lg'>Please Wait....</h1>
                    </div>    
                )}
            </div>
        </>
    )
}

export default StreamList;