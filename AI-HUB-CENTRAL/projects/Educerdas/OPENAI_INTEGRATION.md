# EduCerdas AI - OpenAI Integration Guide

## Overview
This guide covers secure setup, rate limiting, token rotation, request logging, and best practices for the OpenAI proxy integration in EduCerdas AI.

---

## 1. Quick Start Setup

### 1.1 Prerequisites
- Node.js >= 14
- Valid OpenAI API key (from https://platform.openai.com/account/api-keys)
- Express.js backend running

### 1.2 Configuration Steps

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your OpenAI API key:**
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   OPENAI_MODEL=gpt-4o-mini
   PORT=3001
   NODE_ENV=production
   ```

3. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

4. **Start the backend:**
   ```bash
   npm start
   ```
   Server will listen on `http://localhost:3001`

5. **Verify the proxy is working:**
   ```bash
   curl -X POST http://localhost:3001/api/ai \
     -H 'Content-Type: application/json' \
     -d '{"prompt":"Hello, explain Pythagoras briefly"}'
   ```
   Expected response: JSON with `success: true, reply: "...OpenAI response..."`

---

## 2. Rate Limiting

### 2.1 Why Rate Limiting Matters
- **Cost control:** Prevents accidental token explosion and high bills
- **DDoS prevention:** Limits requests from single IPs
- **Fair usage:** Ensures equitable resource distribution across users
- **Compliance:** Meets OpenAI terms of service

### 2.2 Built-in Rate Limiting Strategy

The proxy supports two-tier rate limiting:

| Endpoint | Default Limit | Window | Purpose |
|----------|---------------|--------|---------|
| `/api/ai` (OpenAI) | 20 requests | 1 minute | Strict AI endpoint limit |
| All other APIs | 100 requests | 15 minutes | General endpoint limit |

### 2.3 Configuration (in `.env`)

```env
# Global rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# AI endpoint specific (stricter)
RATE_LIMIT_AI_WINDOW_MS=60000      # 1 minute
RATE_LIMIT_AI_MAX_REQUESTS=20
```

### 2.4 Implementation (Production Ready)

To implement rate limiting in the backend, add this middleware to `backend/server.js`:

```javascript
const rateLimit = require('express-rate-limit');

// Install first: npm install express-rate-limit

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.RATE_LIMIT_ENABLED === 'false'
});

// Stricter limiter for AI endpoint
const aiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_AI_WINDOW_MS || 60000),
  max: parseInt(process.env.RATE_LIMIT_AI_MAX_REQUESTS || 20),
  message: { success: false, error: 'AI request limit exceeded. Try again in 1 minute.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.RATE_LIMIT_ENABLED === 'false'
});

// Apply limiters
app.use(generalLimiter);
app.post('/api/ai', aiLimiter, async (req, res) => {
  // ... existing handler code
});
```

### 2.5 Monitoring Rate Limit Hits

Enable logging in your app to track rate limit events:
```bash
# In .env
REQUEST_LOGGING_ENABLED=true
LOG_LEVEL=warn
```

This will log when limits are hit, helping you adjust thresholds.

---

## 3. Token Rotation & Key Management

### 3.1 Best Practices

**Never commit API keys to version control!**

```bash
# Good: .gitignore
.env
.env.local
.env.*.local
```

### 3.2 Manual Key Rotation (Recommended for Production)

1. **Generate a new key** in OpenAI Dashboard
2. **Update `.env`** with new `OPENAI_API_KEY`
3. **Restart the server:**
   ```bash
   kill $(lsof -t -i :3001)
   PORT=3001 npm start
   ```
4. **Deactivate the old key** in OpenAI Dashboard (wait 24h before deleting for fallback safety)

### 3.3 Automated Rotation (Advanced Setup)

For production, consider using AWS Secrets Manager, HashiCorp Vault, or similar:

```javascript
// Example: Load key from AWS Secrets Manager
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getApiKey() {
  try {
    const data = await secretsManager.getSecretValue({
      SecretId: 'educerdas/openai-key'
    }).promise();
    return JSON.parse(data.SecretString).OPENAI_API_KEY;
  } catch (error) {
    console.error('Failed to retrieve secret:', error);
    return process.env.OPENAI_API_KEY; // Fallback to env var
  }
}

// Call in API handler
const apiKey = await getApiKey();
```

### 3.4 Key Rotation Checklist

- [ ] Generate new key in OpenAI Dashboard
- [ ] Test new key with a sample API call
- [ ] Update `.env` (or secret vault)
- [ ] Restart backend gracefully
- [ ] Monitor logs for 24 hours
- [ ] Deactivate old key
- [ ] Document rotation date

---

## 4. Request Logging

### 4.1 Enable Logging (in `.env`)

```env
REQUEST_LOGGING_ENABLED=true
LOG_LEVEL=info
LOG_DIR=./logs
TRACK_AI_USAGE=true
```

### 4.2 Logging Middleware Implementation

Add this to `backend/server.js`:

```javascript
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logDir = process.env.LOG_DIR || './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Request logging middleware
app.use((req, res, next) => {
  if (process.env.REQUEST_LOGGING_ENABLED !== 'true') return next();

  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ip: req.ip,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent')
    };

    // Log AI endpoint usage separately
    if (req.path === '/api/ai' && process.env.TRACK_AI_USAGE === 'true') {
      logEntry.category = 'AI_REQUEST';
      logEntry.prompt_length = (req.body?.prompt || '').length;
    }

    const logPath = path.join(logDir, `access-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');

    // Console output based on log level
    const level = process.env.LOG_LEVEL || 'info';
    if (level === 'debug' || (level === 'info' && res.statusCode >= 400)) {
      console.log(logEntry);
    }
  });

  next();
});
```

### 4.3 Parsing Logs

View today's logs:
```bash
cat logs/access-2026-01-09.log | jq '.'
```

Filter for AI requests:
```bash
cat logs/access-*.log | jq 'select(.category == "AI_REQUEST")'
```

Count requests by status:
```bash
cat logs/access-*.log | jq -r '.status' | sort | uniq -c
```

---

## 5. Cost Monitoring & Alerts

### 5.1 Estimate Costs

OpenAI pricing (as of Jan 2026):
- **gpt-4o-mini:** ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- Typical student chat query: 50-100 input tokens, 100-200 output tokens
- **Per request estimate:** $0.00002 - $0.00015

### 5.2 Set Cost Alerts (in `.env`)

```env
ALERT_THRESHOLD_COST_PER_HOUR=10
# Alert if hourly spend exceeds $10
```

### 5.3 Implement Cost Tracking

```javascript
// In your API handler after getting OpenAI response
app.post('/api/ai', async (req, res) => {
  // ... existing code ...
  
  const inputTokens = data.usage?.prompt_tokens || 0;
  const outputTokens = data.usage?.completion_tokens || 0;
  
  // Approximate cost (gpt-4o-mini pricing)
  const inputCost = (inputTokens / 1_000_000) * 0.15;
  const outputCost = (outputTokens / 1_000_000) * 0.60;
  const totalCost = inputCost + outputCost;
  
  console.log(`Request cost: $${totalCost.toFixed(6)}`);
  
  // Check alert threshold
  if (totalCost > 0.001) { // Alert on expensive requests
    console.warn(`⚠️  High-cost request: $${totalCost.toFixed(6)}`);
  }
  
  res.json({
    success: true,
    reply: data.choices[0].message.content,
    usage: { inputTokens, outputTokens, estimatedCost: `$${totalCost.toFixed(6)}` }
  });
});
```

---

## 6. Error Handling & Fallbacks

### 6.1 Common OpenAI Errors

| Error | Cause | Action |
|-------|-------|--------|
| `401 Unauthorized` | Invalid API key | Check `.env`, regenerate key |
| `429 Too Many Requests` | Rate limit hit | Wait or upgrade OpenAI plan |
| `500 Internal Server Error` | OpenAI service down | Use fallback responses |
| `Connection timeout` | Network issue | Implement retry logic |

### 6.2 Graceful Fallback (Already Implemented)

The frontend automatically falls back to rule-based responses when:
- `OPENAI_API_KEY` is not set
- The `/api/ai` endpoint returns a fallback flag
- Network errors occur

```javascript
// In app.js
async function getAIResponse(userMessage) {
  try {
    const resp = await fetch(`${AppState.api.baseUrl}/api/ai`, {...});
    const data = await resp.json();
    
    if (!data || data.fallback || !data.reply) {
      return getRuleBasedResponse(msg);  // Fallback
    }
    return data.reply;
  } catch (error) {
    return getRuleBasedResponse(msg);    // Fallback on error
  }
}
```

### 6.3 Retry Logic (Optional Production Enhancement)

```javascript
async function callOpenAIWithRetry(prompt, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({...})
      });
      
      if (resp.ok) return await resp.json();
      
      if (resp.status === 429 && attempt < maxRetries) {
        // Rate limit: wait exponentially
        const wait = Math.pow(2, attempt - 1) * 1000;
        console.log(`Rate limited. Retrying in ${wait}ms...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      
      throw new Error(`API error: ${resp.status}`);
    } catch (error) {
      if (attempt === maxRetries) throw error;
    }
  }
}
```

---

## 7. Security Best Practices

### 7.1 API Key Safety
- ✅ Store in environment variables (never in code)
- ✅ Use `.env` file (added to `.gitignore`)
- ✅ Rotate keys every 30-90 days
- ✅ Use read-only keys where possible
- ❌ Don't log API keys (sanitize logs)
- ❌ Don't expose keys in error messages

### 7.2 Request Validation
```javascript
// Validate input before sending to OpenAI
app.post('/api/ai', (req, res) => {
  const { prompt } = req.body;
  
  // Validate prompt
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Invalid prompt' });
  }
  
  if (prompt.length > 2000) {
    return res.status(400).json({ error: 'Prompt too long (max 2000 chars)' });
  }
  
  // Sanitize for injection attacks
  const sanitized = prompt.trim();
  
  // Continue with API call
});
```

### 7.3 CORS Configuration
```env
# In .env
ALLOWED_ORIGINS=http://localhost:8002,https://yourdomain.com
```

```javascript
// In server.js
const cors = require('cors');

app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || '').split(','),
  credentials: true
}));
```

### 7.4 HTTPS in Production
Always use HTTPS in production:
```bash
# Use a reverse proxy (nginx) or deploy to a platform with automatic SSL
# Example with Let's Encrypt + nginx
```

---

## 8. Deployment Checklist

Before deploying to production:

- [ ] Create `.env` with all required variables
- [ ] Set `NODE_ENV=production`
- [ ] Enable rate limiting
- [ ] Enable request logging
- [ ] Configure CORS origins
- [ ] Set up monitoring/alerts
- [ ] Enable HTTPS
- [ ] Test fallback behavior
- [ ] Document API key rotation schedule
- [ ] Set up log rotation (to prevent disk space issues)
- [ ] Test with production OpenAI API key
- [ ] Monitor costs for first 24 hours

---

## 9. Troubleshooting

### Issue: "OPENAI_API_KEY not configured"
**Solution:** Check if `.env` file exists and has the key set.
```bash
grep OPENAI_API_KEY .env
```

### Issue: Rate limit errors (429)
**Solution:** Reduce `RATE_LIMIT_AI_MAX_REQUESTS` or increase window size.
```env
RATE_LIMIT_AI_MAX_REQUESTS=10    # Reduce from 20
```

### Issue: "Token limit exceeded"
**Solution:** Reduce `OPENAI_MAX_TOKENS` or implement context window management.
```env
OPENAI_MAX_TOKENS=400  # Reduce from 600
```

### Issue: High API costs
**Solution:** Review logs, implement request validation, use cheaper model.
```bash
cat logs/access-*.log | jq '.usage.estimatedCost'
```

---

## 10. References

- OpenAI API Documentation: https://platform.openai.com/docs/api-reference
- API Key Management: https://platform.openai.com/account/api-keys
- Pricing: https://openai.com/pricing
- Rate Limiting: https://platform.openai.com/docs/guides/rate-limits

---

**Last Updated:** January 9, 2026  
**EduCerdas AI Team**
