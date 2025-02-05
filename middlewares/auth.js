import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { UserModel } from '../models/db.js';
dotenv.config();

export const auth = (req,res,next)=>{
    const token = req.headers.token;
    
    
    if(!token){
       return res.json({
            message:"access denied !!"
        })
    }

    jwt.verify(token, process.env.JWT_SECRET,async (err, data)=>{
        if(err) return res.json({message:'access denied'})
        console.log(data)

        req.userId = data.userId;
        
        next();
    })


}