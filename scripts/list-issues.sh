#!/bin/bash

# FretFlow - Issue 목록 보기 스크립트
# 사용법: ./scripts/list-issues.sh [label]

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

LABEL_FILTER="$1"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  📋 FretFlow - Open Issues${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -n "$LABEL_FILTER" ]; then
    echo -e "${YELLOW}🏷️  Filter: $LABEL_FILTER${NC}"
    echo ""
    ISSUES=$(gh issue list --label "$LABEL_FILTER" --state open --json number,title,labels --limit 50)
else
    ISSUES=$(gh issue list --state open --json number,title,labels --limit 50)
fi

# Issue가 없는 경우
if [ "$(echo "$ISSUES" | jq '. | length')" -eq 0 ]; then
    echo -e "${YELLOW}📭 Open된 issue가 없습니다.${NC}"
    echo ""
    echo "새 issue 생성: gh issue create --title \"작업 제목\" --label \"enhancement\""
    exit 0
fi

# 우선순위별로 그룹화해서 출력
echo -e "${RED}🚨 Urgent:${NC}"
echo "$ISSUES" | jq -r '.[] | select(.labels[].name == "urgent") | "  #\(.number) - \(.title)"' || echo "  (없음)"
echo ""

echo -e "${RED}🐛 Bugs:${NC}"
echo "$ISSUES" | jq -r '.[] | select(.labels[].name == "bug") | "  #\(.number) - \(.title)"' || echo "  (없음)"
echo ""

echo -e "${BLUE}⚡ In Progress:${NC}"
echo "$ISSUES" | jq -r '.[] | select(.labels[].name == "in-progress") | "  #\(.number) - \(.title)"' || echo "  (없음)"
echo ""

echo -e "${GREEN}✨ Enhancements:${NC}"
echo "$ISSUES" | jq -r '.[] | select(.labels[].name == "enhancement") | "  #\(.number) - \(.title)"' || echo "  (없음)"
echo ""

echo -e "${MAGENTA}📚 Other:${NC}"
echo "$ISSUES" | jq -r '.[] | select((.labels | map(.name) | contains(["urgent", "bug", "in-progress", "enhancement"]) | not)) | "  #\(.number) - \(.title)"' || echo "  (없음)"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Total: $(echo "$ISSUES" | jq '. | length') open issues"
echo ""
echo -e "${YELLOW}💡 사용법:${NC}"
echo "  작업 시작: ./scripts/pick-issue.sh [issue_number]"
echo "  자동 선택: ./scripts/pick-issue.sh"
echo ""
