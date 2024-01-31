import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/store.js';

const StreamComponent=({title,owner,img,id})=>{
    const addStreamId = useStore((state) => state.setStreamId);
    const addCurrentStream=useStore((state)=>state.setCurrentStream);
    const navigate=useNavigate();
    const sendRequest=async()=>{
        addStreamId(id);
        addCurrentStream({
            title:title,
            owner:owner
        })
        navigate('/watch');
    }

    return(
        <>
            <div className='bg-slate-200 h-[25%] w-11/12 rounded-xl flex hover:bg-slate-300 hover:cursor-pointer' onClick={sendRequest}>
                    <div className='w-[20%] h-[90%] m-2'>
                        <img src={img} className='w-full h-full object-cover border-solid border-cyan-400 border-2' />
                    </div>
                    <div className=' h-[90%] m-2 flex-col space-y-8 p-2 flex-wrap'>
                        <div>
                            <h1 className='font-bold tracking-wide text-lg'>{title}</h1>
                        </div>
                        <div>
                            <p className='font-semibold text-slate-700'>{owner}</p>
                        </div>
                        
                    </div>

                </div>
        </>
    )
}
export default StreamComponent;