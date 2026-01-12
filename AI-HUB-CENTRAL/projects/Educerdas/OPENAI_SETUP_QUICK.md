# EduCerdas AI - OpenAI Quick Setup (5 Minutes)

## Step 1: Get Your OpenAI API Key
1. Go to https://platform.openai.com/account/api-keys
2. Create a new secret key
3. Copy the full key (starts with `sk-`)

## Step 2: Configure Environment
```bash
cd "/Users/amifwahyudiilmi/Documents/Hackathon - 2/sehatku-AI 2"

# Copy template
cp .env.example .env

# Edit .env (use your favorite editor)
nano .env
# or
code .env
```

Add your key:
```env
OPENAI_API_KEY=sk-your-key-here
NODE_ENV=production
RATE_LIMIT_ENABLED=true
REQUEST_LOGGING_ENABLED=true
```

Save and exit.

## Step 3: Install Dependencies
```bash
npm install express-rate-limit
```

## Step 4: Start Server
```bash
PORT=3001 npm start
```

Expected output:
```
🎓 EduCerdas AI - Server Started Successfully!
📡 Server running at: http://localhost:3001
```

## Step 5: Test the Integration
```bash
curl -X POST http://localhost:3001/api/ai \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Jelaskan teorema Pythagoras"}'
```

Expected response (from OpenAI):
```json
{
  "success": true,
  "fallback": false,
  "reply": "Teorema Pythagoras menyatakan bahwa... [OpenAI response]"
}
```

---

## Troubleshooting

**Problem:** "OPENAI_API_KEY not configured"  
**Fix:** Check `.env` has the key: `grep OPENAI_API_KEY .env`

**Problem:** "Address already in use :3001"  
**Fix:** Use different port: `PORT=3002 npm start`

**Problem:** curl returns `{"success":true,"fallback":true}`  
**Fix:** API key is not set in .env. Re-check the key format.

---

## What's Included

✅ **Automatic fallback:** If API key missing, uses built-in rule-based responses  
✅ **Rate limiting:** Max 20 AI requests/min per IP (prevents abuse)  
✅ **Request logging:** All API calls logged to `./logs/` (with cost tracking)  
✅ **Production ready:** CORS, error handling, cost monitoring  

---

## Next Steps

- Review [OPENAI_INTEGRATION.md](OPENAI_INTEGRATION.md) for advanced config
- Enable `.env` in `.gitignore` to prevent accidental key commits:
  ```bash
  echo ".env" >> .gitignore
  ```
- Monitor costs: `cat logs/access-*.log | jq 'select(.category == "AI_REQUEST")'`
- Set up monitoring alerts for high costs

---

## Security Checklist

- [ ] API key in `.env` (not in code)
- [ ] `.env` in `.gitignore`
- [ ] Rate limiting enabled in `.env`
- [ ] Request logging enabled in `.env`
- [ ] Test fallback behavior (temporarily remove API key)
- [ ] Rotate key every 30-90 days

---

**Ready to demo?** Open [http://localhost:8002](http://localhost:8002) and test the chat!
