import { Router } from "express";
import { ProductModel } from "../models/db.js"; 
import { adminAuth } from "../middlewares/admin.js"; 
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from "multer-storage-cloudinary";


const AdminRouter = Router();

cloudinary.config({
    cloud_name:'dnabcuxch',
    api_key:'233837129143259',
    api_secret:'lXvDWJ8gzniHVVDoiTvrjwDkE_8'
})

const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder: 'sumukhji',
        allowed_formats:['jpg','png','jpeg'],
        public_id: (req, file)=>file.originalname.split('.')[0]
    }
})





const uploads = multer({storage})

AdminRouter.get('/', (req, res) => {
    res.json({
        message: 'admin route !!!'
    });
});


AdminRouter.post('/createproduct', adminAuth, uploads.single('productImage'), async (req, res) => {
    // all text inputs
    const {title,description,price, stock, category,specification} = req.body;

    //file details
    const productImage = req.file;

    try {
        if(!title || !description || !price || !stock || !category || !productImage || !specification){
           return res.status(401).json({
                message:'all fields are required to create a new product'

            })
        }
        const newProduct = await ProductModel.create({
            name:title,
            description,
            price,
            category,
            stock,
            specification,
            image: `${req.file.path}`

        })

        return res.status(202).json({
            message:"product created successfully",
            newProduct
        })

    } catch (error) {
       return res.status(505).json({
            message:'something went wrong',
            errorMessage:error
        })
    }

    
});



export  {AdminRouter} ;
