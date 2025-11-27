import { Schema, model } from "mongoose";
const LoreFragment = new Schema({
  title: String,
  slug: { type: String, index: true, unique: true },
  module: { type: String, enum: ["RedLightDistrict", "AkiraCodex", "MotherboardCity"], index: true },
  rarity: { type: String, enum: ["common", "uncommon", "rare", "mythic"], index: true },
  glyph: String,
  scheme: { type: String, enum: ["wc-v1", "wc-v2"], default: "wc-v1" },
  proof: String,
  media: { shot: String, path: String, metadataPath: String },
  timeline: { arc: String, index: Number },
  traits: Object,
  createdAt: { type: Date, default: Date.now },
  checksum: String
});
export default model("LoreFragment", LoreFragment);
