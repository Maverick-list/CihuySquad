# Secure Configuration & Documentation Summary

**Created:** January 9, 2026  
**Status:** ✅ Complete - Ready for OpenAI Integration

---

## 📦 Files Created

### 1. **`.env.example`** (2.1 KB)
Template for environment variables with sensible defaults.
- OpenAI API configuration (key, model, tokens, temperature)
- Rate limiting thresholds (general: 100 req/15min, AI: 20 req/1min)
- Request logging settings
- Token rotation and security options
- Cost monitoring thresholds

**How to use:**
```bash
cp .env.example .env
# Edit .env with your actual OpenAI API key
```

### 2. **`OPENAI_INTEGRATION.md`** (13 KB)
Comprehensive integration guide covering:
- **Quick Start Setup** - 5-step walkthrough to get OpenAI working
- **Rate Limiting** - Two-tier strategy (AI endpoint stricter than general)
- **Token Rotation** - Manual rotation steps + advanced vault integration examples
- **Request Logging** - Middleware implementation + log parsing examples
- **Cost Monitoring** - OpenAI pricing, estimate calculations, alert thresholds
- **Error Handling & Fallbacks** - Common errors and graceful recovery
- **Security Best Practices** - API key safety, input validation, CORS, HTTPS
- **Deployment Checklist** - Production readiness validation
- **Troubleshooting** - Common issues and solutions

### 3. **`OPENAI_SETUP_QUICK.md`** (2.5 KB)
5-minute quick reference for developers:
- Step-by-step API key retrieval
- Environment configuration
- Server startup command
- Simple testing with curl
- Troubleshooting quick fixes
- Security checklist

### 4. **`backend/server.js`** (Updated)
Added production-ready middleware:
- **Request Logging** - All requests logged with timestamp, path, status, duration, IP
- **Rate Limiting** - Built-in memory-based rate limiter (no external dependencies needed yet)
  - General endpoint: 100 requests / 15 minutes
  - AI endpoint (`/api/ai`): 20 requests / 1 minute
- **Cost Tracking** - AI requests categorized for usage analysis
- Log files saved to `./logs/access-YYYY-MM-DD.log`

### 5. **`scripts/analyze-costs.sh`** (Executable)
Bash script for cost and usage analysis:
- Total request count and breakdown
- AI endpoint statistics
- Success vs error rates
- Response time metrics
- Requests by endpoint and status code
- Estimated OpenAI costs (based on actual request count)
- Top IPs by request volume
- Recent error logs

**How to use:**
```bash
./scripts/analyze-costs.sh
```

### 6. **`.gitignore`** (Updated)
Protects sensitive data:
- `.env` (excludes actual environment files)
- Logs and temporary files
- Dependencies and build outputs
- IDE files
- Preserves `.env.example` for reference

---

## 🔒 Security Features Implemented

### Authentication & Authorization
- ✅ API key stored in environment variables (never in code)
- ✅ Backend-side proxy prevents key exposure to frontend
- ✅ `.env` file excluded from git

### Rate Limiting
- ✅ Two-tier limits (stricter for AI endpoint)
- ✅ Per-IP tracking with automatic expiration
- ✅ Configurable thresholds in `.env`
- ✅ Error response includes reset information

### Request Logging
- ✅ Structured JSON logs with timestamp, duration, status
- ✅ Automatic daily log rotation (separate files per date)
- ✅ Cost tracking for AI requests
- ✅ IP address logging for abuse detection
- ✅ Configurable log level (debug, info, warn, error)

### Cost Control
- ✅ Cost estimation per request
- ✅ Alert thresholds for high-cost operations
- ✅ Usage analytics via `analyze-costs.sh`
- ✅ Configurable max tokens per request

---

## 🚀 How to Enable

### Step 1: Get OpenAI API Key
```bash
# Visit https://platform.openai.com/account/api-keys
# Create new secret key
# Copy the key (starts with sk-)
```

### Step 2: Configure Environment
```bash
cd "/Users/amifwahyudiilmi/Documents/Hackathon - 2/sehatku-AI 2"
cp .env.example .env

# Edit with your key
nano .env
# Add: OPENAI_API_KEY=sk-your-key-here
```

### Step 3: Optional - Install Express Rate Limit
```bash
# For more robust rate limiting (currently uses in-memory store)
npm install express-rate-limit
```

### Step 4: Start Server with Logging Enabled
```bash
REQUEST_LOGGING_ENABLED=true \
TRACK_AI_USAGE=true \
RATE_LIMIT_ENABLED=true \
PORT=3001 npm start
```

### Step 5: Monitor Usage
```bash
# View real-time logs
tail -f logs/access-$(date +%Y-%m-%d).log

# Analyze costs and usage
./scripts/analyze-costs.sh
```

---

## 📊 What Gets Logged

Each request logs:
```json
{
  "timestamp": "2026-01-09T05:30:00.000Z",
  "method": "POST",
  "path": "/api/ai",
  "status": 200,
  "ip": "127.0.0.1",
  "duration": "450ms",
  "category": "AI_REQUEST",
  "prompt_length": 45,
  "userAgent": "curl/7.x.x"
}
```

---

## 💰 Cost Estimation

**Model:** gpt-4o-mini  
**Pricing:** $0.15 per 1M input tokens, $0.60 per 1M output tokens

**Typical per-request cost:** $0.00002 - $0.00015

**Usage prediction:**
- 100 AI requests/day = $0.002 - $0.015/day
- 3000 AI requests/month = $0.06 - $0.45/month
- Growth to 10k requests/month = $0.20 - $1.50/month

**Monitor via:**
```bash
./scripts/analyze-costs.sh
# Shows estimated cost based on actual logged requests
```

---

## 🔄 Token Rotation Schedule

**Recommended:**
- Rotate every 30-90 days for security
- Immediately if key is compromised
- After team member leaves

**Steps:**
1. Generate new key in OpenAI Dashboard
2. Update `.env` with new `OPENAI_API_KEY`
3. Test with sample request
4. Restart server
5. Deactivate old key (24h later for safety)

---

## ⚠️ Rate Limit Scenarios

| Scenario | Limit | Action |
|----------|-------|--------|
| 1 user, normal chat | ~5 req/min | ✅ Allowed (limit: 20) |
| 5 concurrent users | ~25 req/min | ⚠️ Hit limit at 20 |
| Bot spam attempt | 100+ req/min | ❌ Blocked, 429 error |
| All other endpoints | 100 req/15min | ✅ Generous for general use |

---

## 🧪 Testing the Setup

### Test 1: Verify Fallback Works (No API Key)
```bash
PORT=3001 npm start  # No OPENAI_API_KEY set
curl -X POST http://localhost:3001/api/ai \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"hello"}'

# Should return:
# {"success":true,"fallback":true,"reply":"OPENAI_API_KEY not configured..."}
```

### Test 2: Verify OpenAI Works (With API Key)
```bash
OPENAI_API_KEY=sk-... PORT=3001 npm start
curl -X POST http://localhost:3001/api/ai \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Jelaskan teorema Pythagoras"}'

# Should return OpenAI response with actual content
```

### Test 3: Rate Limiting Works
```bash
# Send 21 requests in 1 minute to /api/ai
for i in {1..21}; do
  curl -X POST http://localhost:3001/api/ai \
    -H 'Content-Type: application/json' \
    -d '{"prompt":"test"}'
  sleep 2
done

# Request 21 should get 429 error
```

---

## 📚 Documentation Hierarchy

1. **`OPENAI_SETUP_QUICK.md`** ← Start here (5 min read)
2. **`.env.example`** ← Reference for configuration
3. **`OPENAI_INTEGRATION.md`** ← Deep dive (20 min read)
4. **`scripts/analyze-costs.sh`** ← Run for analytics
5. **Backend logs** ← Real usage data in `./logs/`

---

## ✨ Next Steps (Optional)

- [ ] Set up log rotation (prevents disk overflow)
- [ ] Integrate with AWS Secrets Manager (for vault)
- [ ] Enable advanced rate limiting with Redis (for distributed systems)
- [ ] Add Prometheus metrics export
- [ ] Set up cost alerts (email/Slack notification)
- [ ] Deploy to production (Vercel, Render, AWS, etc.)

---

## 🔗 References

- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [API Key Management](https://platform.openai.com/account/api-keys)
- [Pricing Calculator](https://openai.com/pricing)
- [Rate Limiting Docs](https://platform.openai.com/docs/guides/rate-limits)

---

**Status:** ✅ All security infrastructure in place  
**Ready to:** Add your OpenAI API key and test!  
**Questions?** See [OPENAI_INTEGRATION.md](OPENAI_INTEGRATION.md) or [OPENAI_SETUP_QUICK.md](OPENAI_SETUP_QUICK.md)
