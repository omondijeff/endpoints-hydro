import express from "express";
import asyncHandler from "express-async-handler";
import { protect, admin } from "../middleware/AuthMiddleware.js";
import User from "../models/UserModel.js";
import generateToken from "../utils/generateToken.js";

const userRouter = express.Router();

//Login
userRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
        createdAt: user.createdAt,
      });
    } else {
      res.status(401);
      throw new Error("Invalid Email/Password");
    }
  })
);

//Register
userRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, isAdmin } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User with this email already registered");
    } else {
      const user = await User.create({
        name,
        email,
        password,
        isAdmin,
      });
      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user._id),
          createdAt: user.createdAt,
        });
      } else {
        res.status(400);
        throw new Error("Invalid User Data");
      }
    }
  })
);

//Profile
userRouter.get(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        // profileImage: user.profileImage,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

//Update Profile
userRouter.put(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.isAdmin) {
        user.isAdmin = req.body.isAdmin;
      }
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

//Get All Admins
userRouter.get(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
  })
);

//Delete
userRouter.delete(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.remove();
      res.json({ message: "User deleted Successfully" });
    } else {
      res.status(404);
      //.json({message:"Product Not Found"})
      throw new Error("User not Found");
    }
  })
);

export default userRouter;
