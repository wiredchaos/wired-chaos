import { Schema, model } from "mongoose";
const Drop = new Schema({
  fragmentSlug: { type: String, index: true },
  noteCipher: String,
  scheme: { type: String, enum: ["wc-v1", "wc-v2"], default: "wc-v1" },
  pubKeyHex: String,
  mac: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
  claimedBy: String
});
export default model("Drop", Drop);
