import { Schema, model } from "mongoose";
const Trade = new Schema({
  fragmentSlug: String,
  seller: String,
  buyer: String,
  price: { type: Number, min: 0 },
  currency: { type: String, default: "XP" },
  txRef: String,
  createdAt: { type: Date, default: Date.now }
});
export default model("Trade", Trade);
