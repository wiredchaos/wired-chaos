# IRS Modernized e-File Runbook

## Prerequisites
- Active EFIN and annual renewal completed
- IRS MeF test window account approved
- Production mTLS certificates imported into AWS Secrets Manager

## Deployment Steps
1. Run `terraform apply` from `tax-suite/ops/terraform` to provision or update infrastructure.
2. Build and push the transmitter Docker image; publish via the `deploy-mef.yml` workflow.
3. Deploy the Cloudflare Worker gateway; ensure variables are updated in Wrangler.
4. Enable the `TAX_EFILE_ENABLED` flag in Cloudflare once validation is complete.

## Endpoints
- `POST /efile/return` (gateway) – enqueue submission metadata and XML
- `GET /efile/status/:submissionId` – retrieve submission status and ACK details
- `POST /esign/8879/webhook` – DocuSign webhook handler
- `POST /v1/ack/poll` (internal) – trigger ACK polling loop

## Incident Response
- If ACKs stall, invoke `/v1/ack/poll` manually or run the poller Lambda/cron.
- Review ECS logs, SQS queue depth, and IRS status dashboard for outages.
- Audit R2/S3 objects for missing XML or ACK payloads.

## PII Handling
- R2/S3 objects stored with server-side encryption enabled
- RDS configured for TLS in transit and encryption at rest
- Retain submissions and ACKs for three tax years
- Limit access via IAM roles scoped to the tax transmitter service
