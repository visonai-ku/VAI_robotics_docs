---
sidebar_position: 2
title: 개인 보정
---

# 개인 보정

:::info[시작 전 확인]
- [ ] [환경 구축](../3_pipeline/1_setup.md) 완료 — conda 환경 `ri_motion_v5_py312`, 커널 등록
- [ ] Quest가 Wi-Fi `AIWORKER1115` 에 연결되어 있고, 맥북도 192.168.6.x 네트워크에 있음
- [ ] 다른 Quest 수신 노트북을 **STOP 해서 `8443` 포트를 비웠음**
:::

:::note[로봇은 필요 없습니다]
보정은 Quest 컨트롤러만으로 합니다. 로봇 전원, bringup, inbound·outbound 모두 필요 없습니다.
:::

## 개요

사람마다 "앞으로", "왼쪽으로", "위로" 움직일 때의 손 궤적이 다릅니다. 앞으로 밀면서 살짝 아래로 내려가거나, 옆으로 옮기면서 몸쪽으로 당겨지는 식입니다. 이 문서는 **개인별 왕복 궤적을 수집해 위치 보정 행렬을 만드는 보정 절차**를 다룹니다.

보정을 하면 컨트롤러를 "앞으로"라고 의도한 방향이 로봇의 `+X` 로 더 정확히 매핑됩니다. 보정 없이 배포된 `v1` 프로필을 그대로 써도 동작은 하지만, 특정 사용자의 후보이지 범용 보정값이 아닙니다. 본격적인 데이터 수집 전에 본인의 보정 파일을 만들어 두는 편이 좋습니다.

## 1. 수집 준비

1. `calibration_notebook/calibrate_intent_axes.ipynb` 를 **새 커널**에서 위부터 실행합니다.
2. 설정 셀의 기본값을 확인합니다.

   | 항목 | 기본값 | 의미 |
   | --- | --- | --- |
   | `PC_HOST` | 자동 감지 | Quest에서 접근할 맥북 LAN IP. 틀리면 직접 지정 |
   | `QUEST_PORT` | `8443` | Quest가 접속할 포트 |
   | `PREPARE_S` | `3.0` | 매 회차 준비 시간(초) |
   | `CAPTURE_S` | `6.0` | 매 회차 기록 시간(초) |
   | `RESUME_CAPTURE_PATH` | `None` | 새 보정은 `None` 으로 시작 |

3. 실행 셀로 수집 창을 연 뒤, Quest 브라우저에서 출력된 `https://<맥북 IP>:8443/` 에 접속해 VR 세션을 시작합니다.
4. 양손 추적과 마지막 패킷 수신 상태를 확인하고 **수집 시작 가능** 표시를 기다립니다.

## 2. 수집

Quest 방향·본인 위치·몸통을 유지한 채, 팔꿈치를 편하게 굽힌 **작업 자세**에서 시작합니다. 손목 방향을 최대한 유지한 채 두 손을 함께 움직입니다.

:::warning[좌우 동작에서 몸을 쓰지 마세요]
몸통을 회전하거나 양팔을 벌리면 축 추정이 틀어집니다. 두 손을 **평행하게** 옮깁니다. 왼쪽이 `+Y`, 오른쪽이 `-Y` 입니다.
:::

| 동작 | 수행 | 사용 |
| --- | --- | --- |
| 전진 | 높이를 유지하려는 의도로 앞으로 이동 후 복귀 | 1~4회 학습, 5회 검증 |
| 왼쪽 | 높이·앞뒤 거리를 유지하며 `+Y` 로 평행 이동 후 복귀 | 1~4회 학습, 5회 검증 |
| 상승 | 앞뒤·좌우를 유지하려는 의도로 위로 이동 후 복귀 | 1~4회 학습, 5회 검증 |
| 오른쪽 | `-Y` 로 평행 이동 후 복귀 | 1~4회 학습, 5회 검증 |
| 왼쪽＋상승 | `+Y`/`+Z` 대각선 이동 후 복귀 | 5회 모두 검증 |
| 오른쪽＋상승 | `-Y`/`+Z` 대각선 이동 후 복귀 | 5회 모두 검증 |

동작을 고르고 **선택 동작 5회 수집**을 누릅니다. 매회 3초 준비 후 6초 기록입니다.

- 기록 **시작과 끝에 각각 0.3초 이상 정지**합니다.
- 동작에 맞춰 편한 범위 내에서 이동했다가 **시작 위치로 돌아옵니다.**

### 회차가 거절됐을 때

거절된 회차는 완료 횟수에 포함되지 않습니다. 원인을 확인하고 같은 시작 버튼을 누르면 이어서 진행할 수 있습니다.

| 상황 | 조치 |
| --- | --- |
| 특정 동작만 다시 받고 싶다 | **선택 동작만 다시 수집** — 그 동작의 완료 기록만 제외 |
| Quest 세션·origin·헤드셋 기준이 바뀌어 중단됐다 | **전체 기준/수집 초기화** 후 6종 전부 다시 수집 |

## 3. 저장

6종 × 5회가 끝나면 **검증 결과 미리보기**로 확인한 뒤, 제어창의 **Calibration 이름**에 본인의 영문 이름을 넣고 **저장·보정 계산 후 종료**를 누릅니다.

파일 이름은 저장 날짜 기준 `YYMMDD_이름` 형식입니다. 2026년 9월 23일에 `jaehoon` 을 입력하면 `260923_jaehoon.json` 이 됩니다.

| 내용 | 저장 위치 |
| --- | --- |
| 전체 수집 원본 | `calibration/diagnostics/<YYMMDD_이름>_trajectory.json` |
| 반복별 수집 기록 | 같은 이름의 `.jsonl` |
| **자동 검사 통과** 프로필 | `calibration/profiles/<YYMMDD_이름>.json` |
| 미완료 또는 검사 실패 | `calibration/diagnostics/<YYMMDD_이름>.json` |

기존 파일을 덮어쓰지 않습니다. 빈 이름이거나 같은 날짜·이름이 이미 있으면 저장 버튼이 비활성화되니 다른 이름을 넣으세요. 새로 만든 개인 데이터와 프로필은 **Git에서 제외**됩니다.

## 4. 결과 해석

:::warning[`accepted=true` 가 "잘 된다"는 뜻은 아닙니다]
`accepted=true` 는 **정해진 궤적 검사를 통과했다**는 뜻일 뿐, 실제 사용감이나 작업 성공률, 로봇 안전성을 보장하지 않습니다. 반대로 `accepted=false` 도 사용감을 측정한 결과가 아니라 자동 검사에 걸렸다는 뜻입니다. 특히 왼쪽+상승, 오른쪽+상승의 경우 accepted가 필수적이지는 않습니다.
:::

결과 셀에서 `reason`, `failed_checks`, 각 손의 `checks` 와 저장 경로를 확인합니다. 미완료·추적 오류·축 추정 실패와, 수집은 끝났지만 궤적 잔차 기준에 걸린 경우(`reason="trajectory_validation_failed"`)는 구분해서 봐야 합니다.

## 5. SIM에서 먼저 확인

통과 프로필은 **반드시 SIM에서 먼저** 써 봅니다. `sim_notebook/sim_vr_teleop.ipynb` 의 `IntentTeleopSettings(...)` 를 이렇게 바꿉니다.

```python title="sim_notebook/sim_vr_teleop.ipynb"
PROFILE_PATH=PROJECT_DIR / "calibration/profiles/<YYMMDD_이름>.json",
ALLOW_FAILED_PROFILE_IN_SIM=False,
SIM_CANDIDATE_CAPTURE_PATH=None,
CONFIRM_CALIBRATION_SETUP=True,
```

`CONFIRM_CALIBRATION_SETUP=True` 는 **본인·Quest 방향·작업 위치가 보정 때와 같은지 확인했다**는 선언입니다.

:::danger[경로만 바꾸면 반영되지 않습니다]
실행 중인 런타임에 파일 경로만 고쳐도 적용되지 않습니다. **STOP 후 설정 셀부터 다시 실행**해야 합니다. 수집 창도 종료해 `8443` 을 비우세요.
:::

표시된 profile ID를 확인한 뒤 작은 전진·좌우·상승·대각선 움직임으로 사용감을 봅니다.

## 6. REAL에 적용

SIM에서 확인한 프로필을 `real_vr_teleop.ipynb` 또는 `real_vr_teleop_record.ipynb` 설정에 지정합니다. 배포된 v1 후보용 경로를 **비워서** 일반 프로필 로더를 쓰게 합니다.

```python title="real_notebook/real_vr_teleop_record.ipynb"
PROFILE_PATH=PROJECT_DIR / "calibration/profiles/<YYMMDD_이름>.json",
REAL_CANDIDATE_CAPTURE_PATH=None,
REAL_CANDIDATE_REVIEW_PATH=None,
CONFIRM_CALIBRATION_SETUP=True,
DRY_RUN=True,
```

REAL은 **DRY RUN에서도 실제 로봇 피드백이 필요**합니다. [로봇 구동](../3_pipeline/2_robot-start.md)을 먼저 끝내고 [실행](./3_run.md) 절차로 연결과 DRY RUN을 확인하세요.

## 자주 겪는 문제

| 증상 | 원인 / 해결 |
| --- | --- |
| Quest에서 보정 페이지가 안 열림 | 다른 노트북이 `8443` 을 쓰는 중. 그 노트북 STOP 후 커널 재시작 |
| `PC_HOST` 자동 감지가 틀림 | 설정 셀에서 맥북 LAN IP를 직접 지정 |
| 회차가 계속 거절됨 | 시작·끝 정지 0.3초, 손목 회전 30° 이내, 시작 위치 복귀를 확인 |
| 프로필을 바꿨는데 그대로임 | 런타임 재적용이 안 됨. STOP 후 설정 셀부터 재실행 |
| 저장 버튼이 비활성화 | 이름이 비었거나 같은 날짜·이름 파일이 이미 있음 |

## 관련 문서

- [개요](./1_overview.md)
- [실행](./3_run.md)
- [Pipeline — 환경 구축](../3_pipeline/1_setup.md)
