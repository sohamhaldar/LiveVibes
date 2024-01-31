import React from 'react';
import { useEffect,useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import useStore from '../store/store.js';
import { useNavigate } from 'react-router-dom';

const Login=()=>{
    const [userName,setUserName]=useState('');
    const [password,setPassword]=useState('');
    const navigate=useNavigate();
    const saveUsername=useStore((state)=>state.setUserName);
    const saveAvatar=useStore((state)=>state.setUserAvatar);
    const goToSignIn=()=>{
        navigate('/signin')
    }
    const sendRequest=async()=>{
        try{
            if(!(password&&userName)){
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
            const {data}=await axios.post(`${import.meta.env.VITE_SERVER_LINK}/user/login`,{ username:userName,password},{withCredentials:true});
            const response=data.data;
            console.log(response);
            saveUsername(response.user.username);
            saveAvatar(response.user.avatar);

            toast.success("Logged in succesfully",{
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                position:"top-center",
                theme:'light'
              });
              setTimeout(()=>{
                navigate('/landing')
              },1000)

            // console.log(response);
            
        }catch(error) {
            console.log(error);
            toast.error(error.response.data,{
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
        <ToastContainer/>
            <div className='bg-gradient-to-r from-cyan-400 to-blue-500 h-[88vh] w-screen flex flex-col justify-center items-center'>
                <div className='bg-neutral-200 w-2/6 h-4/6 rounded-lg flex items-center p-4 flex-col justify-center'>
                    <h1 className='text-3xl font-sans font-semibold tracking-wide '>LOGIN</h1>
                    <div className='p-4 w-5/6 h-4/6 flex flex-col space-y-1'>
                        <div className='m-2 w-full p-2'>
                            <p className='mx-2  text-slate-700 font-medium'>Username</p>
                            <input type="text" className='w-full rounded-md h-5/6 px-2' value={userName} onChange={(e)=>setUserName(e.target.value)}/>
                        </div>
                        <div className='m-2 w-full p-2'>
                            <p className='mx-2 text-slate-700 font-medium'>Password</p>
                            <input type="password" className='w-full rounded-md h-5/6 px-2' value={password} onChange={(e)=>setPassword(e.target.value)}/>
                        </div>
                    </div>
                    <button className=' font-semibold tracking-wide font-sans text-slate-300 border-cyan-500 border-solid border-2 p-2 rounded-lg px-10 bg-cyan-500 hover:bg-cyan-600' onClick={sendRequest}>Login</button>
                    

                </div>
                <div className='w-2/6 flex justify-end'>
                    <p className='text-slate-800 tracking-wide font-semibold text-center m-1'>Don't have an account?</p>
                    <p className='text-slate-300 tracking-wide font-bold text-xl hover:text-slate-400 hover:cursor-pointer' onClick={goToSignIn}>Sign Up</p>
                </div>
            </div>

        </>
    )
}

export default Login;





