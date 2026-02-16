#!/bin/bash

# FretFlow - Issue 선택 및 작업 시작 스크립트
# 사용법: ./scripts/pick-issue.sh [issue_number]
# issue_number를 지정하지 않으면 자동으로 우선순위가 높은 issue를 선택합니다.

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 수동으로 issue 번호가 지정된 경우
if [ -n "$1" ]; then
    ISSUE_NUMBER="$1"
    echo -e "${BLUE}📌 Issue #$ISSUE_NUMBER 선택됨${NC}"
else
    # 자동 선택: 우선순위에 따라 issue 선택
    echo -e "${BLUE}🔍 Open된 issue 목록 확인 중...${NC}"

    # 우선순위별로 issue 찾기
    # 1순위: urgent 라벨
    ISSUE_NUMBER=$(gh issue list --label "urgent" --state open --limit 1 --json number --jq '.[0].number' 2>/dev/null || echo "")

    if [ -n "$ISSUE_NUMBER" ]; then
        echo -e "${RED}🚨 Urgent issue 발견!${NC}"
    else
        # 2순위: bug 라벨
        ISSUE_NUMBER=$(gh issue list --label "bug" --state open --limit 1 --json number --jq '.[0].number' 2>/dev/null || echo "")

        if [ -n "$ISSUE_NUMBER" ]; then
            echo -e "${YELLOW}🐛 Bug issue 발견${NC}"
        else
            # 3순위: 가장 오래된 open issue
            ISSUE_NUMBER=$(gh issue list --state open --limit 1 --json number --jq '.[0].number' 2>/dev/null || echo "")

            if [ -n "$ISSUE_NUMBER" ]; then
                echo -e "${GREEN}📋 일반 issue 선택${NC}"
            else
                echo -e "${RED}❌ Open된 issue가 없습니다.${NC}"
                echo "Issue를 먼저 생성해주세요: gh issue create --title \"작업 제목\" --label \"enhancement\""
                exit 1
            fi
        fi
    fi
fi

# Issue 정보 가져오기
echo ""
echo -e "${BLUE}📖 Issue 정보 로드 중...${NC}"
ISSUE_INFO=$(gh issue view $ISSUE_NUMBER --json title,labels,body,url)
ISSUE_TITLE=$(echo "$ISSUE_INFO" | jq -r '.title')
ISSUE_URL=$(echo "$ISSUE_INFO" | jq -r '.url')
ISSUE_LABELS=$(echo "$ISSUE_INFO" | jq -r '.labels[].name' | tr '\n' ',' | sed 's/,$//')

# Issue 정보 출력
echo ""
echo -e "${GREEN}✅ 선택된 Issue:${NC}"
echo -e "   ${BLUE}#${ISSUE_NUMBER}${NC}: $ISSUE_TITLE"
echo -e "   ${YELLOW}Labels:${NC} $ISSUE_LABELS"
echo -e "   ${BLUE}URL:${NC} $ISSUE_URL"
echo ""

# 브랜치 이름 생성
# 라벨에 따라 브랜치 prefix 결정
if echo "$ISSUE_LABELS" | grep -q "bug"; then
    BRANCH_PREFIX="fix"
elif echo "$ISSUE_LABELS" | grep -q "refactor"; then
    BRANCH_PREFIX="refactor"
elif echo "$ISSUE_LABELS" | grep -q "docs"; then
    BRANCH_PREFIX="docs"
else
    BRANCH_PREFIX="feature"
fi

BRANCH_NAME="$BRANCH_PREFIX/$ISSUE_NUMBER-$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g' | cut -c1-50)"

# Main 브랜치로 이동 (최신 상태 확인)
echo -e "${BLUE}🔄 Main 브랜치로 전환...${NC}"
git checkout main 2>/dev/null || git checkout main 2>/dev/null || true

# 브랜치가 이미 존재하는지 확인
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo -e "${YELLOW}⚠️  브랜치가 이미 존재합니다: $BRANCH_NAME${NC}"
    echo "기존 브랜치로 체크아웃합니다."
    git checkout "$BRANCH_NAME"
else
    # 새 브랜치 생성
    echo -e "${GREEN}🌿 새 브랜치 생성: $BRANCH_NAME${NC}"
    git checkout -b "$BRANCH_NAME"
fi

# Issue를 'in progress' 상태로 업데이트 (라벨 추가)
echo -e "${BLUE}🏷️  Issue 상태 업데이트 중...${NC}"
gh issue edit $ISSUE_NUMBER --add-label "in-progress" 2>/dev/null || true

# 완료 메시지
echo ""
echo -e "${GREEN}✨ 작업 환경 준비 완료!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Issue:   ${YELLOW}#$ISSUE_NUMBER${NC}"
echo -e "  Branch:  ${GREEN}$BRANCH_NAME${NC}"
echo -e "  Status:  ${BLUE}In Progress${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}💡 작업 완료 후:${NC}"
echo "   1. git add ."
echo "   2. git commit -m \"$BRANCH_PREFIX: $ISSUE_TITLE\""
echo "   3. git push -u origin $BRANCH_NAME"
echo "   4. gh pr create --body \"Closes #$ISSUE_NUMBER\""
echo ""
