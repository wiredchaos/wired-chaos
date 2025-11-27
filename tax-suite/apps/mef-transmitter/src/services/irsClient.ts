import https from "https";
import axios from "axios";

const IRS_URL = process.env.IRS_URL; // e.g., https://la.www4.irs.gov/efile
const cert = process.env.MTLS_CERT_BASE64;
const key = process.env.MTLS_KEY_BASE64;
const ca = process.env.MTLS_CA_BASE64;
if (!IRS_URL || !cert || !key || !ca) {
  throw new Error("mTLS configuration incomplete");
}
// mTLS certs are loaded from Secrets Manager at boot and mounted as files/env
const agent = new https.Agent({
  cert: Buffer.from(cert, "base64"),
  key: Buffer.from(key, "base64"),
  ca: Buffer.from(ca, "base64"),
  keepAlive: true,
  minVersion: "TLSv1.2",
});

export async function transmit(xml: string) {
  // NOTE: MeF uses SOAP; this is a simplified POST stub. Replace with proper SOAP envelope.
  const r = await axios.post(`${IRS_URL}/mef/submit`, xml, {
    httpsAgent: agent,
    headers: { "content-type": "application/xml" },
    timeout: 30000,
    validateStatus: () => true,
  });
  return { status: r.status, data: r.data };
}

export async function getAck(submissionId: string) {
  const r = await axios.get(`${IRS_URL}/mef/ack/${submissionId}`, {
    httpsAgent: agent,
    timeout: 15000,
    validateStatus: () => true,
  });
  return { status: r.status, data: r.data };
}
