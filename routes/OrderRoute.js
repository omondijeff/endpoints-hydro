import express from "express";
import asyncHandler from "express-async-handler";
import {admin, protect} from "../middleware/AuthMiddleware.js";
import Order from "../models/OrderModel.js";


const orderRouter = express.Router();

//Create an Order
orderRouter.post("/", protect, asyncHandler(
    async (req, res) => {
        const { lat, lng, location, service } = req.body;
        const order = new Order({
            lat,
            lng,
            location,
            service,
            user: req.user._id,
        });
        if(order){
            const neworder =await order.save();
            res.status(201).json(neworder);
        }else{
            res.status(400);
            //.json({message:"Product Not Found"})
            throw new Error("Invalid product Data");
        }


    },
),
);

//ADMIN Get all orders
orderRouter.get("/admin/all", protect,admin, asyncHandler(
    async (req, res) => {
        const orders = await Order.find({}).sort({_id:-1}).populate("user", "name email");    
            res.json( orders );
    },
 ),
);

//Get Order By Id
orderRouter.get("/:id", protect, asyncHandler(
    async (req, res) => {
        const order = await Order.findById(req.params.id).populate(
            "user",
            "name email"
        );
        if (order) {
            res.json({ order });
        } else {
            res.status(404);
            throw new Error("Order Not Found");

        }
    },
),
);

//Get all orders
orderRouter.get("/", protect, asyncHandler(
    async (req, res) => {
        const order = await Order.find({user:req.user._id}).sort({_id:-1});    
            res.json(order );
    },
 ),
);





export default orderRouter;