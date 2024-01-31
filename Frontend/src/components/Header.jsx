import React, { useState, useEffect } from 'react';
import Logo from '../assets/Logo_hd.png';
import useStore from '../store/store.js';

const Header=()=>{
    const username=useStore((state)=>state.user_name);
    const userAvatar=useStore((state)=>state.user_avatar);
    return(
        <>
            <header className='w-screen bg-slate-200 h-[12vh] shadow sticky z-50 top-0 flex justify-center'>
                    <div className='w-[60%] flex justify-end'>
                        <img src={Logo} className='w-[25%] h-[90%]'/>
                    </div>
                    
                    <div className='w-[40%] flex justify-end'>
                        <div className='flex justify-center items-center mx-1'>
                            <img src={userAvatar} className='h-[80%]' style={{clipPath:"circle()"}}/>
                        </div>
                        <div className='flex justify-center items-center mx-1 p-1'>
                            <p className="text-2xl font-semibold text-slate-700">{username}</p>
                        </div>
                        

                    </div>
            </header>
        </>
    )
}

export default Header;