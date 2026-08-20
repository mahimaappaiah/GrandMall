# AXIONIX OS — Mall Twin Live Telemetry Overview

The Mall Twin application provides the interactive real-time 3D/2D digital twin of the mall, tracking visitor footfall, live POS transactions, store status, and telemetry.

- **Live Server & Telemetry Hub**: `axionix-backend/index.js` (listening on `http://localhost:5000/`)
- **Admin Dashboard Integration**: `admin-dashboard/src/components/views/MallOverviewView.tsx`

To launch the Live Digital Twin:
```bash
cd axionix-backend
npm run dev
```
Or view the integrated view inside `admin-dashboard/`.
