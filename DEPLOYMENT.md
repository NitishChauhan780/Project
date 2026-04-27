# MindBridge Deployment Guide

## Goal

Deploy MindBridge to production using:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

This setup is the fastest path to go live with your current codebase.

---

## 1. Pre-Deployment Checklist

Before deploying, ensure:

- Your project is pushed to GitHub.
- The frontend import error is resolved.
- You have a MongoDB Atlas cluster.
- You have a Gemini API key.
- You have a strong JWT secret ready.

Suggested JWT secret generation:

- Use a 32+ character random string.

---

## 2. MongoDB Atlas Setup

1. Create a cluster in MongoDB Atlas.
2. Create a database user with password.
3. Add Network Access rule.
   - For initial testing: allow all IPs.
   - For better security: limit to Render outbound IPs later.
4. Copy connection string.

Example value:

- mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mindbridge?retryWrites=true&w=majority

Use this as MONGODB_URI in backend env vars.

---

## 3. Backend Deployment on Render

### Create service

1. Open Render dashboard.
2. New Web Service.
3. Connect GitHub repo.
4. Set root directory to:

- server

### Build and start

- Build Command:
  - npm install
- Start Command:
  - npm start

### Environment variables

Set these in Render:

- NODE_ENV = production
- PORT = 5000
- MONGODB_URI = your Atlas connection string
- JWT_SECRET = your strong random secret
- GEMINI_API_KEY = your Gemini key
- FRONTEND_URL = your frontend URL on Vercel

Important:

- If you use multiple frontend domains, set FRONTEND_URL as comma-separated URLs.
- Example:
  - https://mindbridge.vercel.app,https://www.mindbridge.com

### Verify backend

After deploy, open backend URL root.
Expected response:

- JSON with message and healthy status.

---

## 4. Frontend Deployment on Vercel

### Create project

1. Open Vercel dashboard.
2. New Project.
3. Import the same GitHub repo.
4. Set root directory to:

- client

### Build settings

- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist

### Environment variable

Set in Vercel:

- VITE_API_BASE_URL = https://your-render-backend-url/api

Example:

- VITE_API_BASE_URL = https://mindbridge-api.onrender.com/api

### Deploy and verify

1. Deploy project.
2. Open Vercel URL.
3. Confirm app loads without API errors.

---

## 5. Final CORS Sync

After frontend URL is final:

1. Go back to Render service.
2. Update FRONTEND_URL with exact Vercel URL.
3. Redeploy backend.

Reason:

- Backend CORS in server is now environment-driven.

---

## 6. Production Smoke Tests

Run this exact sequence:

1. Open frontend URL.
2. Sign up a student user.
3. Log in and navigate dashboard.
4. Open forum and create post.
5. Open resources page.
6. Run mood entry.
7. Verify notification and protected route behavior.
8. Confirm backend health endpoint is reachable.

If all pass, deployment is functionally live.

---

## 7. Common Issues and Fixes

### A) Frontend shows network error

Checks:

- VITE_API_BASE_URL is set correctly in Vercel.
- Backend URL is active.
- Backend route path includes /api.

### B) CORS blocked in browser

Checks:

- FRONTEND_URL in Render exactly matches frontend domain.
- If using both root and www domain, include both.
- Redeploy backend after changing env vars.

### C) Backend fails to connect DB

Checks:

- MONGODB_URI is valid.
- Atlas user/password is correct.
- Atlas network access allows Render traffic.

### D) Login fails with token errors

Checks:

- JWT_SECRET is set and not empty.
- Existing old tokens in local storage may be stale.
- Clear browser local storage and retry.

### E) Gemini features fail

Checks:

- GEMINI_API_KEY is valid and active.
- Provider limits or quota are not exceeded.

---

## 8. Recommended Post-Go-Live Improvements

Priority 0:

- Add custom domain and HTTPS redirect.
- Add uptime monitoring for backend health endpoint.
- Add centralized error logging.

Priority 1:

- Add CI pipeline for build and lint checks.
- Add automated integration tests for auth, forum, appointments.

Priority 2:

- Restrict Atlas network allowlist.
- Add CDN caching strategy for static assets.

---

## 9. Quick Reference Values

Frontend env on Vercel:

- VITE_API_BASE_URL = https://your-backend-domain/api

Backend env on Render:

- NODE_ENV = production
- PORT = 5000
- MONGODB_URI = atlas-connection-string
- JWT_SECRET = long-random-secret
- GEMINI_API_KEY = gemini-api-key
- FRONTEND_URL = https://your-frontend-domain

---

## 10. Done Definition

Deployment is complete when:

- Frontend is reachable publicly.
- Backend health endpoint returns healthy JSON.
- Auth works end-to-end.
- Protected pages load.
- Core student workflow runs without errors.
- CORS and API calls are clean in browser console.
