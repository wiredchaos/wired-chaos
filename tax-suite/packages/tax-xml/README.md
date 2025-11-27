# @wired-chaos/tax-xml

Utility helpers for generating and validating IRS Modernized e-File (MeF) XML payloads.

## Usage

```ts
import { build1040XML } from "@wired-chaos/tax-xml/build1040";
import { writeTempXml, xmllintValidate } from "@wired-chaos/tax-xml/validate";

const xml = build1040XML({ taxYear: "2024", primarySSN: "123456789", agi: "55000" });
const path = writeTempXml("sample", xml);
const result = xmllintValidate(path, "./schemas/irs1040.xsd");
```

Populate `packages/tax-xml/schemas` with the official IRS XSDs to enable strict schema validation during CI runs.
