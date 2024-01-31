// store.js
import {create} from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const store = (set) => ({
  localStream:new MediaStream([]),
  selectedStreamId:null,
  user_avatar:'',
  user_name:'',
  currentStream:{},
  setCurrentStream: (stream) => {
    set(() => ({
      currentStream: stream,
    }));
  },
  addStream: (stream) => {
    set((state) => ({
      localStream: stream, 
    }));
  },
  removeStream: () => {
    set(() => ({
      localStream: new MediaStream([]),
    }));
  },
  setStreamId:(id)=>{
    set(()=>({
      selectedStreamId : id,
    }))
  },
  setUserName:(name)=>{
    set(()=>({
      user_name : name,
    }))
  },
  setUserAvatar:(avatar)=>{
    set(()=>({
      user_avatar : avatar,
    }))
  },
});

const useStore = create(devtools(store));
 
export default useStore;
