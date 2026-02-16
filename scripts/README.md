# FretFlow 스크립트 가이드

이 디렉토리에는 GitHub Issues와 연동된 워크플로우 자동화 스크립트가 포함되어 있습니다.

## 📜 스크립트 목록

### 1. `list-issues.sh` - Issue 목록 보기

Open된 issue들을 우선순위별로 그룹화하여 표시합니다.

```bash
# 모든 open issue 보기
./scripts/list-issues.sh

# 특정 라벨 필터링
./scripts/list-issues.sh bug
./scripts/list-issues.sh enhancement
```

**출력 예시:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📋 FretFlow - Open Issues
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 Urgent:
  #50 - Critical production bug

🐛 Bugs:
  #42 - Fix navigation crash
  #48 - Memory leak in audio processing

⚡ In Progress:
  #45 - Add Korean translation support

✨ Enhancements:
  #47 - Dark mode support
  #49 - Add metronome feature
```

### 2. `pick-issue.sh` - Issue 선택 및 작업 시작

Open된 issue 중에서 하나를 선택하고 작업 브랜치를 생성합니다.

**자동 선택 (권장):**
```bash
./scripts/pick-issue.sh
```

우선순위 규칙:
1. `urgent` 라벨이 있는 issue
2. `bug` 라벨이 있는 issue
3. 가장 오래된 open issue

**수동 선택:**
```bash
./scripts/pick-issue.sh 123
```

**동작:**
1. Issue 정보 로드
2. 라벨에 따라 브랜치 prefix 결정:
   - `bug` → `fix/`
   - `refactor` → `refactor/`
   - `docs` → `docs/`
   - 기타 → `feature/`
3. 브랜치 생성: `{prefix}/{issue번호}-{제목}`
4. Issue에 `in-progress` 라벨 자동 추가

**출력 예시:**
```
✅ 선택된 Issue:
   #42: Fix navigation crash
   Labels: bug,urgent
   URL: https://github.com/user/fretflow/issues/42

🌿 새 브랜치 생성: fix/42-fix-navigation-crash

✨ 작업 환경 준비 완료!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Issue:   #42
  Branch:  fix/42-fix-navigation-crash
  Status:  In Progress
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 작업 완료 후:
   1. git add .
   2. git commit -m "fix: Fix navigation crash"
   3. git push -u origin fix/42-fix-navigation-crash
   4. gh pr create --body "Closes #42"
```

## 🔄 Git Hooks

### `commit-msg` Hook

커밋 시 자동으로 issue 번호를 추가합니다.

```bash
# 커밋 메시지
git commit -m "fix: Handle null navigation state"

# 실제 저장되는 메시지 (자동으로 refs 추가)
fix: Handle null navigation state

refs #42
```

브랜치 이름에서 issue 번호를 자동 추출하므로, 수동으로 번호를 입력할 필요가 없습니다.

## 🎯 전체 워크플로우

1. **Issue 생성 (사용자)**
   ```bash
   gh issue create --title "Add dark mode" --label "enhancement"
   ```

2. **작업 시작 (Claude Code)**
   ```bash
   ./scripts/pick-issue.sh
   ```

3. **코드 작성**
   - Claude Code가 코드 작성
   - TodoWrite로 작업 추적

4. **커밋 및 푸시**
   ```bash
   git add .
   git commit -m "feat: Add dark mode toggle"
   git push -u origin feature/51-add-dark-mode
   ```

5. **PR 생성**
   ```bash
   gh pr create --body "Closes #51"
   ```

6. **Merge**
   - PR merge 시 issue 자동 닫힘

## 💡 팁

- **우선순위 설정**: 긴급한 작업은 `urgent` 라벨 추가
- **버그 우선**: `bug` 라벨은 `enhancement`보다 높은 우선순위
- **작업 중단**: 다른 issue로 전환하려면 `./scripts/pick-issue.sh [번호]`
- **Issue 상태**: `in-progress` 라벨로 진행 중인 작업 추적

## 🔧 요구사항

- Git
- GitHub CLI (`gh`)
- jq (JSON 처리)

설치:
```bash
# macOS
brew install gh jq

# gh 인증
gh auth login
```
