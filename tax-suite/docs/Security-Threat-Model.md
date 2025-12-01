# Tax Suite Security Threat Model

## Key Risks
- Exposure of taxpayer PII during transmission or storage
- Compromise of mutual TLS certificates or private keys
- Malicious SQS message injection or replay attacks
- DocuSign webhook spoofing or tampering

## Mitigations
- Enforce mutual TLS with IRS endpoints and short-lived secrets from AWS Secrets Manager
- Restrict IAM roles to least privilege and enable automatic key rotation
- Use dead-letter queues and strict validation on queue consumers to prevent poisoning
- Verify DocuSign HMAC signatures and audit all webhook events
- Enable Cloudflare WAF, AWS GuardDuty, and centralized logging for anomaly detection
