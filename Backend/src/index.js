import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { server } from './app.js';

dotenv.config({
    path:'./.env'
});
console.log(process.env.MONGODB_URI);


connectDB().then(()=>{
    server.listen(process.env.PORT||8000,()=>{
        console.log(`server connected at PORT:${process.env.PORT}`);
    });
}).catch((e)=>{
    console.log("MongoDb connection error!!! ",e);
});