import React, { useState, useEffect } from 'react';
import humanImage from '../assets/human.svg';
import monitorImage from '../assets/monitor.svg';
import { useNavigate } from 'react-router-dom';

const LandingPage=()=>{
    const navigate=useNavigate();
    return(
        <>
            <div className='bg-gradient-to-r from-cyan-400 to-blue-500 h-[88vh] w-screen flex justify-center items-center p-4'>
                <div className='bg-neutral-200 w-2/6 h-3/6 m-2 rounded-md drop-shadow-lg hover:bg-neutral-300' onClick={()=>{navigate('/streamer')}}>
                    <img src={humanImage} alt="" className='w-full h-4/6'/>
                    <h1 className='my-2 text-center font-semibold text-xl'>Stream Mode</h1>

                </div>
                <div className='bg-neutral-200 w-2/6 h-3/6 m-2 rounded-md drop-shadow-lg hover:bg-neutral-300' onClick={()=>{navigate('/streams')}}>
                    <img src={monitorImage} alt="" className='w-full h-4/6'/>
                    <h1 className='my-2 text-center font-semibold text-xl'>View Mode</h1>

                </div>

            </div>
        </>
    )

}

export default LandingPage;