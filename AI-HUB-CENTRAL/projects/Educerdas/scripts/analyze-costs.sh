#!/bin/bash
# EduCerdas AI - Cost Analyzer Script
# Analyzes logs to track API costs and usage patterns

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

LOG_DIR="./logs"

if [ ! -d "$LOG_DIR" ]; then
    echo -e "${RED}No logs directory found. Start the server with REQUEST_LOGGING_ENABLED=true${NC}"
    exit 1
fi

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}🤖 EduCerdas AI - Cost & Usage Analysis${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Get total number of API calls
TOTAL_REQUESTS=$(cat "$LOG_DIR"/access-*.log 2>/dev/null | wc -l)
echo -e "${GREEN}📊 Total Requests:${NC} $TOTAL_REQUESTS"

# AI endpoint specific stats
AI_REQUESTS=$(cat "$LOG_DIR"/access-*.log 2>/dev/null | jq -r 'select(.path == "/api/ai")' | wc -l)
echo -e "${GREEN}🤖 AI Requests (/api/ai):${NC} $AI_REQUESTS"

# Success vs error rate
SUCCESS=$(cat "$LOG_DIR"/access-*.log 2>/dev/null | jq -r 'select(.status >= 200 and .status < 300)' | wc -l)
ERRORS=$(cat "$LOG_DIR"/access-*.log 2>/dev/null | jq -r 'select(.status >= 400)' | wc -l)
echo -e "${GREEN}✅ Successful:${NC} $SUCCESS ($(( SUCCESS * 100 / (TOTAL_REQUESTS > 0 ? TOTAL_REQUESTS : 1) ))%)"
echo -e "${RED}❌ Errors:${NC} $ERRORS ($(( ERRORS * 100 / (TOTAL_REQUESTS > 0 ? TOTAL_REQUESTS : 1) ))%)"

# Response time analysis
echo -e "\n${BLUE}⏱️  Performance Metrics:${NC}"
AVG_TIME=$(cat "$LOG_DIR"/access-*.log 2>/dev/null | jq -r '.duration' | grep -oE '[0-9]+' | awk '{ sum += $1; count++ } END { if (count > 0) print int(sum/count); else print 0 }')
echo -e "Average Response Time: ${AVG_TIME}ms"

# Requests by endpoint
echo -e "\n${BLUE}📈 Requests by Endpoint:${NC}"
cat "$LOG_DIR"/access-*.log 2>/dev/null | jq -r '.path' | sort | uniq -c | sort -rn | head -10 | while read count path; do
    printf "  %4d requests  %s\n" "$count" "$path"
done

# Requests by status code
echo -e "\n${BLUE}🔍 Status Code Distribution:${NC}"
cat "$LOG_DIR"/access-*.log 2>/dev/null | jq -r '.status' | sort | uniq -c | sort -rn | while read count status; do
    if [ "$status" -lt 300 ]; then
        echo -e "  ${GREEN}$status:${NC} $count requests"
    elif [ "$status" -lt 400 ]; then
        echo -e "  ${YELLOW}$status:${NC} $count requests"
    else
        echo -e "  ${RED}$status:${NC} $count requests"
    fi
done

# AI cost estimate (gpt-4o-mini pricing: $0.15 per 1M input tokens, $0.60 per 1M output tokens)
echo -e "\n${BLUE}💰 Estimated Cost (gpt-4o-mini):${NC}"
echo "Typical per-request cost: \$0.00002 - \$0.00015"
echo "Based on $AI_REQUESTS AI requests:"
LOW_COST=$(echo "scale=4; $AI_REQUESTS * 0.00002" | bc 2>/dev/null || echo "N/A")
HIGH_COST=$(echo "scale=4; $AI_REQUESTS * 0.00015" | bc 2>/dev/null || echo "N/A")
echo "Estimated range: \$$LOW_COST - \$$HIGH_COST"

# Top IPs by request count
echo -e "\n${BLUE}🌐 Top 5 IPs by Request Count:${NC}"
cat "$LOG_DIR"/access-*.log 2>/dev/null | jq -r '.ip' | sort | uniq -c | sort -rn | head -5 | while read count ip; do
    printf "  %4d requests  %s\n" "$count" "$ip"
done

# Recent errors (if any)
echo -e "\n${BLUE}⚠️  Recent Errors (last 5):${NC}"
ERRORS_FOUND=$(cat "$LOG_DIR"/access-*.log 2>/dev/null | jq -r 'select(.status >= 400)' | tail -5)
if [ -z "$ERRORS_FOUND" ]; then
    echo -e "${GREEN}No errors found - great job!${NC}"
else
    echo "$ERRORS_FOUND" | jq '.' | head -50
fi

echo -e "\n${BLUE}================================================${NC}"
echo -e "Report generated: $(date)"
echo -e "${BLUE}================================================${NC}"
