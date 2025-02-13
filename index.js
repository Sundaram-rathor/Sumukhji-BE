
import express from 'express'
import cors from 'cors'

import * as dotenv from 'dotenv'
dotenv.config({ path: './.env'})
import {UserRouter} from './routes/UserRoutes.js'
import  {AdminRouter}  from './routes/AdminRoutes.js'

const corsOption = {
    domain:[`${process.env.FRONTEND_URI}`]
}
const app = express();
app.use(express.json());
app.use(cors(corsOption))


app.get('/', (req, res)=>{

    res.json({
        message:"home route"
    })
})

app.use('/api/v1/user',UserRouter)
app.use('/api/v1/admin',AdminRouter)

app.listen(process.env.PORT || 3000, ()=>{
    console.log("server running at : ",process.env.PORT)
})