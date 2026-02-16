#!/bin/bash

# FretFlow - 새 작업 시작 스크립트
# 사용법: ./scripts/start-work.sh "작업 설명"

set -e

if [ -z "$1" ]; then
    echo "사용법: ./scripts/start-work.sh \"작업 설명\""
    echo "예시: ./scripts/start-work.sh \"Add internationalization support\""
    exit 1
fi

TASK_TITLE="$1"
TASK_BODY="${2:-이 작업은 Claude Code를 통해 자동 생성되었습니다.}"

# 1. GitHub Issue 생성
echo "📝 GitHub Issue 생성 중..."
ISSUE_NUMBER=$(gh issue create \
    --title "$TASK_TITLE" \
    --body "$TASK_BODY" \
    --label "enhancement" \
    | grep -o '[0-9]*$')

echo "✅ Issue #$ISSUE_NUMBER 생성 완료"

# 2. 브랜치 이름 생성 (issue 번호 + 제목)
BRANCH_NAME="feature/$ISSUE_NUMBER-$(echo "$TASK_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g')"

# 3. 새 브랜치 생성 및 체크아웃
echo "🌿 브랜치 생성 중: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME"

echo ""
echo "✨ 작업 환경 준비 완료!"
echo "   Issue: #$ISSUE_NUMBER"
echo "   Branch: $BRANCH_NAME"
echo "   Link: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/issues/$ISSUE_NUMBER"
echo ""
echo "💡 작업 완료 후:"
echo "   1. git add ."
echo "   2. git commit -m \"feat: $TASK_TITLE (fixes #$ISSUE_NUMBER)\""
echo "   3. git push -u origin $BRANCH_NAME"
echo "   4. gh pr create --fill"
