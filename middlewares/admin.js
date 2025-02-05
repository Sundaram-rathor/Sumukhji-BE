import jwt from 'jsonwebtoken'
import { UserModel } from '../models/db.js'
export const adminAuth = (req,res,next)=>{

    const token = req.headers.token

    if(!token){
        res.json({
            message:'access denied'
        })
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err,data)=>{

        if(err){
          return  res.json({message:'access not granted'})
        }

        const user = await UserModel.find({_id:data.userId})
        if(user.email == 'rathorsundaram50@gmail.com'){
            req.userId = data.userId
            next()
        }else{
            res.json({
                message:'not authorised for admin access'
            })
        }
    })

}