import { execSync } from "node:child_process";
import fs from "node:fs";

export function xmllintValidate(xmlPath: string, xsdPath: string) {
  // Requires xmllint (libxml2) in CI container
  const cmd = `xmllint --noout --schema ${xsdPath} ${xmlPath}`;
  try {
    execSync(cmd, { stdio: "pipe" });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "xmllint error" };
  }
}

export function writeTempXml(name: string, xml: string) {
  const p = `/tmp/${name}.xml`;
  fs.writeFileSync(p, xml, "utf8");
  return p;
}
