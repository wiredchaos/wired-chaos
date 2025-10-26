import React from "react";

type Props = {
  title: string;
  img: string;
  alt: string;
  rarity: "common"|"uncommon"|"rare"|"mythic";
  slug: string;
};

export default function RLDCard({ title, img, alt, rarity, slug }: Props) {
  return (
    <figure style={{
      background: "rgba(0,255,255,0.06)",
      border: "1px solid #00FFFF22",
      backdropFilter: "blur(10px)",
      borderRadius: 12,
      padding: 12
    }}>
      <img src={img} alt={alt} style={{ width:"100%", borderRadius: 8 }} />
      <figcaption style={{ color:"#00FFFF", fontFamily:"monospace", marginTop:8 }}>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span>{title}</span>
          <span style={{ color:"#FF3131" }}>{rarity.toUpperCase()}</span>
        </div>
        <small style={{ color:"#39FF14" }}>/{slug}</small>
      </figcaption>
    </figure>
  );
}
