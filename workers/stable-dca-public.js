addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

const STABLE_PRICES = { USDT:1.0, USDC:1.0, DAI:1.0, BUSD:1.0 };

async function handleRequest(request) {
  const url = new URL(request.url);
  const stable = url.searchParams.get("stable") || "USDT";
  const amount = parseFloat(url.searchParams.get("amount")) || 100;
  const freq = url.searchParams.get("freq") || "weekly";

  const history = [];
  let date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  const delta = { daily:1, weekly:7, monthly:30 }[freq];

  while(date <= new Date()){
    history.push({ date: date.toISOString().split("T")[0], value: amount*STABLE_PRICES[stable] });
    date.setDate(date.getDate()+delta);
  }

  return new Response(JSON.stringify({ history }), { headers: { "Content-Type": "application/json" } });
}
