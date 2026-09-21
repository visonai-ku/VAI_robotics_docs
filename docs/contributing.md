---
sidebar_position: 99
title: 문서 기여 방법
---

# 문서 기여 방법

문서는 마크다운 파일이고, 저장소는 [VAI_robotics_docs](https://github.com/visonai-ku/VAI_robotics_docs)입니다. 고치는 방법은 두 가지입니다.

## 방법 1 — GitHub 웹에서 고치기 (간단한 수정)

오타나 한두 문단 수정이라면 이 방법이 가장 빠릅니다.

1. 고치려는 페이지 맨 아래 **"Edit this page"** 를 누릅니다.
2. GitHub 편집 화면에서 내용을 수정합니다.
3. 아래 **Commit changes** 를 누르고, *Create a new branch and start a pull request* 를 선택합니다.
4. Pull Request 제목에 무엇을 고쳤는지 한 줄로 적고 제출합니다.

## 방법 2 — 로컬에서 고치기 (문서 추가·구조 변경)

```bash
git clone https://github.com/visonai-ku/VAI_robotics_docs.git
cd VAI_robotics_docs
npm install
npm start          # http://localhost:3000 에서 실시간 미리보기
```

작업은 항상 새 브랜치에서 합니다.

```bash
git switch -c docs/추가할-문서-이름
# 파일 수정
git add .
git commit -m "docs: 무엇을 추가/수정했는지"
git push -u origin docs/추가할-문서-이름
```

push하면 터미널에 뜨는 링크로 Pull Request를 만들면 됩니다.

## 새 문서 추가하기

`docs/` 아래 알맞은 폴더에 `.md` 파일을 만들고, 맨 위에 frontmatter를 넣습니다.

```markdown
---
sidebar_position: 3
title: 사이드바에 표시될 제목
---

# 문서 제목

본문...
```

사이드바는 폴더 구조에서 자동 생성되므로 별도 등록이 필요 없습니다. 순서는 `sidebar_position` 숫자로 조정하고, 폴더 자체의 이름과 순서는 그 폴더의 `_category_.json` 에서 바꿉니다.

## 작성할 때 지켜주면 좋은 것

- 제목은 명사형으로 짧게 (`개발 환경 설정` — `개발 환경을 설정하는 방법` 아님)
- 명령어는 코드 블록으로, 설명은 코드 블록 밖에
- 스크린샷은 `static/img/` 에 넣고 `![설명](/img/파일명.png)` 으로 참조
- 사람마다 다른 값(경로, IP, 계정)은 `<사용자명>` 처럼 꺾쇠로 표시
