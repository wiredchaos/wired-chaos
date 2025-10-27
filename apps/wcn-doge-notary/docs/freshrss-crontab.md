# FreshRSS Notary Automation

Add the following entry to the system crontab to notarize new articles every hour. Update the environment variables to match your deployment.

```cron
0 * * * * cd /opt/wired-chaos && \
  export FRESHRSS_API_URL="https://freshrss.example.com/api/v1/notary" && \
  export FRESHRSS_TOKEN="$(cat /opt/wired-chaos/.secrets/freshrss.token)" && \
  export FRESHRSS_DRY_RUN="false" && \
  export FRESHRSS_PRIVACY="public" && \
  /usr/bin/node apps/wcn-doge-notary/dist/integrations/freshrss.js >> /var/log/wcn-freshrss.log 2>&1
```

The hook will:

1. Download the latest entries from the configured FreshRSS API endpoint.
2. Render each article into a GROK-branded PDF.
3. Notarize the PDF using the WIRED CHAOS Doge Notary.
4. Print a structured JSON summary containing the inscription IDs for downstream dashboards.
