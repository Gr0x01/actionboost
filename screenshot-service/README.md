# Screenshot Service

Minimal Express + Puppeteer service that captures homepage screenshots for the marketing audit tool.

## Deploy on Vultr ($6/mo)

```bash
# On the server
apt update && apt install -y chromium-browser nodejs npm
git clone <repo> && cd screenshot-service
npm install
API_KEY=your-secret-key npx pm2 start index.js --name screenshot
npx pm2 save && npx pm2 startup
```

## Env vars

- `API_KEY` — shared secret (required)
- `PORT` — defaults to 3333

## Endpoint

`GET /screenshot?url=<encoded_url>&width=1280&height=800`

Headers: `x-api-key: <API_KEY>`

Returns: JPEG image buffer
