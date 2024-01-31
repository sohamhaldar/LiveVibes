import { Router } from "express";
import { broadcast, loginUser, registerUser, streamEnded, streamList, watch } from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router=Router();
router.route("/register").post(
    upload.single('avatar'),
    registerUser
    )
router.route('/login').post(loginUser);
router.route('/getStreams').get(streamList);
router.route('/start').post(upload.single('thumbnail'),broadcast);
router.route('/watch').post(watch);
router.route('/ended').post(streamEnded);

export default router;    