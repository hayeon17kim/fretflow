# FretFlow 개발 워크플로우

## 🤖 Claude Code 자동화 워크플로우

이 프로젝트는 GitHub Issues와 자동으로 연동되는 워크플로우를 사용합니다.

### 새 작업 시작 시

**Claude Code가 새 기능/버그 수정 작업을 시작할 때 자동으로 수행해야 하는 작업:**

1. **Issue 생성**: 작업 내용을 GitHub Issue로 먼저 생성
   ```bash
   ./scripts/start-work.sh "작업 설명"
   ```

2. **브랜치 생성**: `feature/[issue번호]-[작업명]` 형식의 브랜치 자동 생성

3. **작업 진행**: Todo 리스트로 작업 추적

### 커밋 시

- 커밋 메시지에 자동으로 issue 번호가 추가됩니다 (commit-msg hook)
- 수동으로 추가하려면: `feat: 작업 내용 (fixes #123)`

### PR 생성 시

```bash
git push -u origin [브랜치명]
gh pr create --fill
```

PR 본문에 `Closes #123` 자동 포함으로 merge 시 issue 자동 닫힘

## 🎯 Claude Code 지침

**Claude Code는 다음 작업을 시작할 때 항상 이 워크플로우를 따라야 합니다:**

- ✅ 새로운 기능 구현
- ✅ 버그 수정
- ✅ 리팩토링 (2개 이상 파일)
- ✅ 문서 업데이트 (중요한 변경사항)

**워크플로우를 건너뛸 수 있는 경우:**

- ⚠️ 오타 수정
- ⚠️ 단일 줄 수정
- ⚠️ 사용자가 명시적으로 issue 없이 작업하라고 지시한 경우

### 예시 작업 흐름

```bash
# 1. Claude Code가 자동 실행
./scripts/start-work.sh "Add Korean translation support"
# → Issue #45 생성
# → feature/45-add-korean-translation-support 브랜치 생성

# 2. 작업 진행 (Claude Code가 코드 작성)

# 3. 커밋 (issue 번호 자동 추가)
git add .
git commit -m "feat: Add i18n support for Korean language"
# → 자동으로 "refs #45" 추가됨

# 4. PR 생성
git push -u origin feature/45-add-korean-translation-support
gh pr create --fill
# → PR 본문에 "Closes #45" 자동 포함
```

## 📋 Issue 라벨 규칙

- `enhancement`: 새 기능
- `bug`: 버그 수정
- `refactor`: 리팩토링
- `docs`: 문서 업데이트
- `i18n`: 국제화 관련
- `urgent`: 긴급 처리 필요
