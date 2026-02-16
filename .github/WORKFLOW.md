# FretFlow 개발 워크플로우

## 🤖 Claude Code 자동화 워크플로우

이 프로젝트는 **Issue-First** 워크플로우를 사용합니다:
1. 먼저 할 일을 GitHub Issues로 등록
2. Claude Code가 issue 중에서 우선순위가 높은 것을 자동 선택
3. 선택된 issue에 대한 브랜치를 생성하고 작업 시작

## 📝 작업 준비 (사용자가 먼저 수행)

할 일을 GitHub Issue로 등록:
```bash
gh issue create --title "Add internationalization support" --label "enhancement"
gh issue create --title "Fix navigation bug" --label "bug"
gh issue create --title "Update README" --label "docs"
```

**라벨 종류:**
- `enhancement`: 새 기능
- `bug`: 버그 수정
- `urgent`: 긴급 처리 필요 (최우선)
- `refactor`: 리팩토링
- `docs`: 문서
- `i18n`: 국제화

## 🚀 Claude Code 작업 시작

### 1. Issue 목록 확인 (선택사항)

```bash
./scripts/list-issues.sh
```

### 2. 작업 시작

**자동 선택 (권장):**
```bash
./scripts/pick-issue.sh
```
→ Claude Code가 자동으로 우선순위에 따라 issue 선택:
  1. `urgent` 라벨
  2. `bug` 라벨
  3. 가장 오래된 open issue

**수동 선택:**
```bash
./scripts/pick-issue.sh 123
```

### 3. 작업 진행

- TodoWrite로 작업 추적
- 코드 작성 및 테스트

### 4. 커밋 및 PR

```bash
git add .
git commit -m "feat: Add feature description"
# → commit-msg hook이 자동으로 "refs #123" 추가

git push -u origin [브랜치명]
gh pr create --body "Closes #123"
```

## 🎯 Claude Code 지침

**Claude Code는 작업을 시작할 때 ALWAYS:**

1. `./scripts/pick-issue.sh` 실행 (자동 선택)
2. 선택된 issue 내용 확인
3. TodoWrite로 작업 계획 수립
4. 작업 진행

**워크플로우를 건너뛸 수 있는 경우:**

- ⚠️ 사용자가 명시적으로 "issue 없이 작업"하라고 지시
- ⚠️ 단순 오타 수정

### 예시 작업 흐름

```bash
# 1. Issue 목록 확인
./scripts/list-issues.sh
# Output:
# 🚨 Urgent: (없음)
# 🐛 Bugs:
#   #42 - Fix navigation crash
# ✨ Enhancements:
#   #45 - Add Korean translation support
#   #47 - Dark mode support

# 2. Claude Code가 자동으로 issue 선택
./scripts/pick-issue.sh
# → #42 선택됨 (bug가 enhancement보다 우선순위 높음)
# → fix/42-fix-navigation-crash 브랜치 생성
# → Issue #42에 'in-progress' 라벨 추가

# 3. 작업 진행
# (코드 작성)

# 4. 커밋
git commit -m "fix: Handle null navigation state"
# → 자동으로 "refs #42" 추가됨

# 5. PR 생성
git push -u origin fix/42-fix-navigation-crash
gh pr create --body "Closes #42"
# → merge 시 issue 자동 닫힘
```

## 📋 Issue 라벨 규칙

- `enhancement`: 새 기능
- `bug`: 버그 수정
- `refactor`: 리팩토링
- `docs`: 문서 업데이트
- `i18n`: 국제화 관련
- `urgent`: 긴급 처리 필요
