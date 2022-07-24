import express from "express";
import asyncHandler from "express-async-handler";
import {protect,admin} from "../middleware/AuthMiddleware.js";
import Product from "../models/ProductModel.js";

const productRoute = express.Router();

//GET ALL PRODUCTS
productRoute.get("/", asyncHandler(
    async (req, res) => {
        const pageSize = 3;
        const page = Number(req.query.pageNumber) || 1;
        const keyword = req.query.keyword ? {
            name: {
                $regex: req.query.keyword,
                $options: "i"
            }
        }
            : {};
        const count = await Product.countDocuments({ ...keyword })
        const products = await Product.find({ ...keyword }).limit(pageSize).skip(page * (page - 1)).sort({ _id: -1 });
        res.json({ products, page, pages: Math.ceil(count / pageSize) });
    },
),
);


//GET PRODUCT BY ID
productRoute.get("/:id", asyncHandler(
    async (req, res) => {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404);
            //.json({message:"Product Not Found"})
            throw new Error("Service not Found");
        }
    }
)
);
//GET PRODUCT BY ID
productRoute.post("/:id/review", protect,
    asyncHandler(
        async (req, res) => {
            const { rating, comment } = req.body
            const product = await Product.findById(req.params.id);
            if (product) {
                const alreadyReviewed = product.review.find((r) => r.user.toString() === req.user._id);
                if (alreadyReviewed) {
                    res.status(400)
                    throw new Error("Product already reviewed")
                }
                const review = {
                    name: req.user.name,
                    rating: Number(rating),
                    comment,
                    user: req.user._id,
                };
                product.reviews.push(review);
                product.numReviews = product.reviews.length
                product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                    product.reviews.length

                await product.save()

                res.status(201).json({ message: "Review Added" })
            } else {
                res.status(404);
                //.json({message:"Product Not Found"})
                throw new Error("Product not Found");
            }
        }
    )
);


//Delete
productRoute.delete("/:id",protect,admin, asyncHandler(
    async (req, res) => {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.remove()
            res.json({message:"Service deleted"});
        } else {
            res.status(404);
            //.json({message:"Product Not Found"})
            throw new Error("Service not Found");
        }
    }
)
);

//Add Product
productRoute.post("/",protect,admin, asyncHandler(
    async (req, res) => {
        const{name,description}=req.body
        const productExist = await Product.findOne({name});
        if (productExist) {
            res.status(400);
            throw new Error("Service name already in use");
        } else {
            const product=new Product({
                name,description,
                user:req.user._id,
            });
            if(product){
                const createdProduct=await product.save();
                res.status(201).json(createdProduct);
            }else{
                res.status(400);
                //.json({message:"Product Not Found"})
                throw new Error("Invalid service Data");
            }
           
        }
    }
)
);

//Edit Product
productRoute.put("/:id",protect,admin, asyncHandler(
    async (req, res) => {
        const{name,description}=req.body
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name=name;
            
            product.description=description;
          
            const updatedProduct=await product.save();
                res.json(updatedProduct);
        } else {
            res.status(404);
                throw new Error("Service Not Found");
           
        }
    }
)
);

export default productRoute;