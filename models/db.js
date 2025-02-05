import mongoose, { Schema, model } from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

(async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
})();

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Electronics",
        "Fashion",
        "Home & Kitchen",
        "Books",
        "Beauty & Health",
        "Sports",
        "Mugs",
        "Other",
      ],
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    specification:{
      type: String
    }
  },
  {
    timestamps: true,
  }
);

const UserCartSchema = new Schema(
  {
    cartArr: {
      type: Array,
      default: [],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = model("user", UserSchema);
const ProductModel = model("product", ProductSchema);
const CartModel = model("userCart", UserCartSchema);

export { UserModel, ProductModel, CartModel };
