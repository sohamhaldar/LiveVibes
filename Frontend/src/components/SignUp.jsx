import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import plus_icon from '../assets/plus_icon.png'
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from 'react-router-dom';


const SignUp=()=>{
    const [avatar,setAvatar]=useState(null);
    const[avatarUrl,setAvatarUrl]=useState(null);
    const[email,setEmail]=useState('');
    const[password,setPassword]=useState('');
    const[userName,setUserName]=useState('');
    const navigate=useNavigate();
    const goToLogIn=()=>{
        navigate('/login');
    }
    useEffect(()=>{
        if(avatar){
            setAvatarUrl(URL.createObjectURL(avatar))
        }
        
    },[avatar]);
    const sendRequest=async()=>{
        try{
            if(!(email&&password&&userName)){
                toast.error("Enter all the fields",{
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    position:"top-center",
                    theme:'light'
                  });
                console.log("Enter all the fields");
                return;
            }
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if(!emailRegex.test(email)){
                console.log("Invalid email format")
                toast.error("Invalid email format",{
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    position:"top-center",
                    theme:'light'
                  });
                return;
            }
            const formData = new FormData();
            formData.append('avatar', avatar);
            console.log(avatar)
            formData.append('username', userName);
            formData.append('password', password);
            formData.append('email', email);

            const response=await axios.post(`${import.meta.env.VITE_SERVER_LINK}/user/register`,formData)
            console.log(response);
            toast.success("Registered succesfully",{
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                position:"top-center",
                theme:'light'
              });
              setTimeout(()=>{
                navigate('/login')
              },2000)
              
            
        }catch(error){
            console.log(error);
            toast.error(error.response.data.data,{
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                position:"top-center",
                theme:'light'
              });
            
        }
    }


    return(
        <>
            <ToastContainer />
            <div className='bg-gradient-to-r from-cyan-400 to-blue-500 h-[88vh] w-screen flex justify-center items-center flex-col'>
                <div className='bg-neutral-200 w-2/6 h-[90%] rounded-lg flex items-center p-2 flex-col justify-center'>
                    <h1 className='text-3xl font-sans font-semibold tracking-wide '>SIGNUP</h1>
                    <div className='p-2 w-5/6 h-5/6 flex flex-col space-y-1'>
                        <div className='m-2 w-full p-2 h-[28%] flex justify-center relative'>
                            <div style={{clipPath:"circle()"}} className='group relative flex justify-center items-center h-[100%] hover:cursor-pointer' onClick={() => document.getElementById('avatar-input').click()}>
                                <input id='avatar-input' type="file" style={{display:'none'}}  onChange={(e)=>setAvatar(e.target?.files[0])}/>
                                <img src={avatarUrl?avatarUrl:"https://littlejohnremodeling.com/wp-content/uploads/2023/01/human-human-avatar-male-icon-with-png-and-vector-format-for-free-19807-300x204.png"} style={{clipPath:"circle()"}}  className='w-auto h-20 group-hover:blur-sm group-hover:brightness-100 group-hover:invert-[20%]'/>
                                <img src={plus_icon} style={{clipPath:"circle()"}} className='w-auto h-8 absolute opacity-0 group-hover:opacity-70' />
                            </div>    
                        </div>
                        <div className='m-2 w-full p-2'>
                            <p className='mx-2  text-slate-700 font-medium'>Email</p>
                            <input type="email" className='w-full rounded-md h-5/6 px-2' value={email} onChange={(e)=>setEmail(e.target.value)}/>
                        </div>
                        
                        <div className='m-2 w-full p-2'>
                            <p className='mx-2  text-slate-700 font-medium'>Username</p>
                            <input type="text" className='w-full rounded-md h-5/6 px-2' value={userName} onChange={(e)=>setUserName(e.target.value)}/>
                        </div>
                        <div className='m-2 w-full p-2'>
                            <p className='mx-2 text-slate-700 font-medium'>Password</p>
                            <input type="password" className='w-full rounded-md h-5/6 px-2' value={password} onChange={(e)=>setPassword(e.target.value)}/>
                        </div>
                        
                    </div>
                    <button className=' font-semibold tracking-wide font-sans text-slate-300 border-cyan-500 border-solid border-2 m-2 p-2 rounded-lg px-10 bg-cyan-500 hover:bg-cyan-600' onClick={sendRequest}>SignUp</button>
                    
                </div>
                <div className='w-2/6 flex justify-end'>
                    <p className='text-slate-800 tracking-wide font-semibold text-center m-1'>Have an account?</p>
                    <p className='text-slate-300  font-bold text-xl hover:text-slate-400 hover:cursor-pointer' onClick={goToLogIn}>Log In Now</p>
                </div>
            </div>
        </>
    );
}

export default SignUp;
