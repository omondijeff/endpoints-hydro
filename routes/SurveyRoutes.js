import asyncHandler from "express-async-handler";
import Survey from "../models/SurveyModel.js";
import express from "express";

import cloudinary from "../utils/cloudinary.js";

const surveyRoute = express.Router();

//Create Survey
surveyRoute.post("/",
    async(req,res)=>{
        const {location,titleDeed,kraPin,permanentAddress}=req.body;
    
        try {
            console.log(titleDeed);
            if(titleDeed ){
                
                const uploadtitle=await cloudinary.uploader.upload(titleDeed,{upload_preset: "g0vu2xec" });
                console.log("uploading")
                //const uploadkra=await cloudinary.uploader.upload({kraPin,upload_preset:"compactHydro",pages: true});
                if(uploadtitle){
                    const survey = new Survey({
                        location,
                        titleDeed:uploadtitle,
                        kraPin,
                        permanentAddress,
                    });
                    if(survey){
                        const savedSurvey =await survey.save();
                        res.status(201).json(savedSurvey);
                    }else{
                        res.status(400);
                        //.json({message:"Product Not Found"})
                        throw new Error("Invalid product Data");
                    }
                    
                }
            }
        } catch (error) {
            res.status(500);
            throw  new Error(error)
        }
    }
);

surveyRoute.get("/",asyncHandler(
    async(req,res)=>{
        const surveys=await Survey.find();

        if(surveys){
            res.json(surveys)
        }else{
            res.status(500);
            throw new Error("Something went wrong");
        }
    }

))

export default surveyRoute;