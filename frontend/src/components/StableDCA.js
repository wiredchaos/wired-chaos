import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function StableDCA({ tier = "edge", userWallet = null }) {
  const [amount, setAmount] = useState(100);
  const [frequency, setFrequency] = useState("weekly");
  const [stable, setStable] = useState("USDT");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const endpoint = tier === "edge"
        ? `/api/stable-dca-public?stable=${stable}&amount=${amount}&freq=${frequency}`
        : `/api/stable-dca-trusted?stable=${stable}&amount=${amount}&freq=${frequency}&wallet=${userWallet}`;
      const res = await fetch(endpoint);
      const json = await res.json();
      setData(json.history);
      setLoading(false);
    }
    fetchData();
  }, [amount, frequency, stable, tier, userWallet]);

  return (
    <div className="p-6 bg-[#111] text-white rounded-2xl shadow-2xl border-2 border-neon-cyan">
      <h2 className="text-3xl font-bold mb-4 text-neon-cyan">Stablecoin DCA Calculator</h2>
      <div className="mb-4 flex gap-4">
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="p-2 rounded text-black w-24"/>
        <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="p-2 rounded text-black">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <select value={stable} onChange={(e) => setStable(e.target.value)} className="p-2 rounded text-black">
          <option value="USDT">USDT</option>
          <option value="USDC">USDC</option>
          <option value="DAI">DAI</option>
          <option value="BUSD">BUSD</option>
        </select>
      </div>
      {loading ? <p className="text-glitch-red">Loading...</p> :
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <XAxis dataKey="date" stroke="#39FF14"/>
            <YAxis stroke="#39FF14"/>
            <Tooltip contentStyle={{ backgroundColor: "#111", borderColor: "#FF00FF" }} />
            <Line type="monotone" dataKey="value" stroke="#00FFFF" strokeWidth={3} dot={{ stroke: "#FF3131", strokeWidth: 2 }}/>
          </LineChart>
        </ResponsiveContainer>
      }
    </div>
  );
}
