import StableDCA from "../../components/StableDCA";
import { useWallet } from "../../../utils/wallet_auth";

export default function DCATrustPage() {
  const wallet = useWallet();
  return <StableDCA tier="trusted" userWallet={wallet} />;
}
