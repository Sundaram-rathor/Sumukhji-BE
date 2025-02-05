import { Router } from "express";
import { CartModel, UserModel } from "../models/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
dotenv.config();
import { auth } from "../middlewares/auth.js";
import { OAuth2Client } from "google-auth-library";

const UserRouter = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// User Signup
UserRouter.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    if (!username || !password || !email) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with the same email ID",
      });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    

    const user = await UserModel.create({
      username,
      password: hashedPass,
      email,
    });
   
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.json({
      message: `${username} signed up successfully`,
      token,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      message: "Error while registering user!",
    });
  }
});

// User Login
UserRouter.post("/login", async (req, res) => {
  const { email, password,token } = req.body;
  
  

  if(token){
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:process.env.GOOGLE_CLIENT_ID
    })

    const payload = await ticket.getPayload();

    const payloadEmail = payload.email
    
    const {name, picture} = payload

    let user = await UserModel.findOne({email: payloadEmail})

    if(!user){
      user = UserModel.create({
        username: name,  
        email: payloadEmail,
        password: ''

      })
    }

    const authToken =  jwt.sign({userId:user._id}, process.env.JWT_SECRET)

    return res.json({
      message:'user logged in sucess',
      token:authToken
    })

  }
  if(!email || !password){
    return res.json({
      message:'Email and password are required.'
    })
  }
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Incorrect credentials",
      });
    }

    const isMatch =  bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect credentials",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(200).json({
      message: `${user.username} logged in successfully`,
      token,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
});

// Add or Update Cart
UserRouter.post("/cart", auth, async (req, res) => {
  const { cartArr } = req.body;
  console.log(cartArr)
  const userId = req.userId; // Retrieved from the auth middleware

  if (!Array.isArray(cartArr)) {
    return res.status(400).json({ message: "Invalid cart format" });
  }

  try {
    const cart = await CartModel.findOneAndUpdate(
      { userId:userId },
      { cartArr:cartArr },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({
      message: "Error updating cart",
      error: error.message,
    });
  }
});

// Get User Cart
UserRouter.get("/cart", auth, async (req, res) => {
  const userId = req.userId;

  try {
    const cart = await CartModel.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    res.status(200).json({
      message: "Cart retrieved successfully",
      cart: cart.cartArr,
    });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    res.status(500).json({
      message: "Error retrieving cart",
      error: error.message,
    });
  }
});

// Clear User Cart
UserRouter.delete("/cart", auth, async (req, res) => {
  const userId = req.userId;

  try {
    const cart = await CartModel.findOneAndDelete({ userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    res.status(200).json({
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      message: "Error clearing cart",
      error: error.message,
    });
  }
});

// Update User
UserRouter.put("/update", auth, async (req, res) => {
  const { username, password, email } = req.body;
  const userId = req.userId;

  try {
    const updatedData = { username, email };
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
});

// Delete User
UserRouter.delete("/deleteuser", auth, async (req, res) => {
  const email = req.email;

  try {
    const deletedUser = await UserModel.findOneAndDelete({ email });
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
});

export { UserRouter };
