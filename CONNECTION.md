# Connect two pets

Both Windows and Mac Chrome extensions can use the same room service. Desktop mode uses the same protocol; a Mac desktop build is still a separate distribution task.

1. Build and reload the extension with `npm run build`. Refresh existing webpage tabs.
2. Open **Care -> Connect** (the Connect tab also appears on the website).
3. Enter the same service address on both devices, for example `wss://YOUR-HOST/rooms`.
4. Choose **Create room**, copy the code, and send the code privately to your friend.
5. Your friend chooses **Join with code**. They see the controller's pet movement, size, animation, and care stats.
6. The viewer can **Request control**. The controller must choose **Pass control to friend**. **Leave room** disconnects immediately.

One room holds two people. Codes are random, case-insensitive in the UI, and expire after two hours. Treat the room code like an invitation password. Only the current controller can publish updates or pass control; the server enforces this. When the controller disconnects, the remaining participant gains control. Connection loss ends that device's session; create or join again rather than silently reconnecting with stale authority.

Coordinates are normalized to the usable viewport/monitor area. Only pet state is relayed. No page URLs, headings, focus topics, screenshots, microphone audio, keystrokes, or computer control are sent. Automatic solo check-ins pause during shared sessions.

## Run the service locally

```powershell
npm install
npm run server
```

The default service is `ws://127.0.0.1:8787/rooms`, with a health endpoint at `http://127.0.0.1:8787/health`. This address works only for clients on the same computer. The browser and extension allow unencrypted WebSocket URLs only for loopback testing.

## Connect across the internet

The code does not create a public server by itself. Deploy `server/` to a host that supports a long-lived Node WebSocket service and TLS. `render.yaml` supplies a Render service definition; `server/Dockerfile` supports container hosts. Point both clients to the resulting **wss://** address with `/rooms` appended. Set `VITE_ROOM_SERVICE_URL` before building if you want to prefill the service address for your friend.

The server defaults to loopback; production deployments must set `HOST=0.0.0.0` and provide `PORT` as required by the host. TLS is terminated by the hosting platform or reverse proxy. The current in-memory service must run as **one instance**: rooms are lost on restart, and multiple instances require shared room storage/routing. No deployment or paid hosting account has been created by this change. Hosts may suspend idle services depending on their plan.

The service has 4 KB message limits, rate limits, heartbeat cleanup, a two-person room limit, and bounded state validation. Optional `ALLOWED_ORIGINS` is a comma-separated exact origin list (include each Chrome extension origin, website origin, and `null` for desktop clients if used). It does not use cookies. This implementation relays state through the chosen service; it is not end-to-end encrypted beyond the TLS transport to that service.

The extension's connection is owned by its background worker; closing its popup does not disconnect. WebSocket heartbeat messages are sent every 20 seconds. The website's connection lasts while that page remains open. Desktop connections are owned by the main process and continue when its care window closes.

## Verification

`npm run test:connection` runs real two-client WebSocket integration tests covering create/join, state relay, control requests, handoff, unauthorized writes, third-party rejection, disconnect recovery, room expiry, and the actual client implementation. `npm run desktop:review` exercises the app UI separately. Internet and physical-Mac testing still require a deployed service and the second device.


## Render: step by step

1. Push this project's latest changes to a GitHub repository. At minimum the repo must contain `server/index.mjs`, `server/package.json`, and `server/package-lock.json`.
2. Sign in to https://dashboard.render.com and choose **New → Web Service**, then connect that repository.
3. Use these settings:
   - Language/runtime: **Node**
   - Root Directory: **server**
   - Build Command: **npm ci --omit=dev --ignore-scripts**
   - Start Command: **node index.mjs**
   - Instance type: **Free** for a personal test
   - Environment variable: **HOST = 0.0.0.0**
   - Health Check Path (advanced settings): **/health**
4. Create/deploy the service. Render supplies `PORT`; do not hard-code a port in the public URL.
5. When the service is live, open `https://YOUR-SERVICE.onrender.com/health`. It should return `{"ok":true}`.
6. Enter **wss://YOUR-SERVICE.onrender.com/rooms** in the Connect tab on both laptops. Use the hostname Render actually assigns, not this example.
7. Create a room on one laptop and join with its code on the other.

Alternatively choose **New → Blueprint** and point Render at this repo's `render.yaml`, which already includes the same service settings and the Free instance type.

Free services can sleep after 15 minutes without inbound requests or WebSocket messages, and waking can take about a minute. Opening `/health` first helps make the first connection predictable. Rooms are in-memory and disappear on a service restart; create a fresh code after that. No database or AI API key is needed.
