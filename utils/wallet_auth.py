// Dummy wallet hook for Trusted tier
import { useState, useEffect } from "react";

export function useWallet() {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => setWallet(accounts[0]))
        .catch(() => setWallet(null));
    }
  }, []);

  return wallet;
}
