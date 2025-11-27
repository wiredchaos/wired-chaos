export function build1040XML(payload: any) {
  // TODO: map fields → IRS schema elements (MeF 1040 xsd)
  // This is a stub for demo; real mapping requires official XSDs
  return `<?xml version="1.0" encoding="UTF-8"?>
<Return>
  <ReturnHeader>
    <TaxPeriod>${payload.taxYear}</TaxPeriod>
    <PrimarySSN>${payload.primarySSN}</PrimarySSN>
  </ReturnHeader>
  <ReturnData>
    <AGI>${payload.agi}</AGI>
  </ReturnData>
</Return>`;
}
