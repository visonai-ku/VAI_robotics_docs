---
sidebar_position: 4
title: 녹화와 데이터
---

# 녹화와 데이터

:::info[시작 전 확인]
- [ ] [실행](./3_run.md) 절차에 따라 teleoperation+record 노트북 작동
- [ ] 노트북 녹화 설정 셀의 `TASK_NAME` 설정
:::

:::note
Teleoperation 중 관절·명령·카메라를 에피소드 단위로 기록합니다. 기록은 [LeRobot v3.0 데이터셋](https://huggingface.co/docs/lerobot/en/lerobot-dataset-v3) 형식으로 바로 저장되어, 별도 변환 없이 imitation learning에 쓸 수 있습니다.
:::

## VR Teleoperaion 중 녹화 조작법

| 방법 | 동작 |
| --- | --- |
| 왼쪽 컨트롤러 **X** | 녹화 시작 / 종료 (누를 때마다 전환) |
| 왼쪽 컨트롤러 **Y** | 녹화 중이면 버리기. 아니면 마지막 에피소드에 **폐기 표시** (다시 누르면 해제) |
| 제어판 Record 창 | `STOP` → `REC` 시작, `REC` → `STOP` 저장, `DEL` 은 Y와 같음 |

창 제목에 상태와 수신 속도가 표시됩니다.

```text title="SG2 Record 창 제목"
● REC episode_000012 12.3s | saved 12 | Hz joint 30 action 30 head 30 ...
IDLE | saved 13 | Hz joint 30 action 0 head 30 ... | <마지막 메시지>
```

- 에피소드는 **120초**가 지나면 자동 저장됩니다. (`max_sec=120`)
- 녹화는 **30 Hz** 로 기록합니다. (`hz=30`)
- 노트북 실행 셀이 끝날 때 녹화 중이던 에피소드는 자동 저장됩니다.

:::warning[카메라 첫 프레임이 와야 녹화가 시작됩니다]
데이터셋의 영상 해상도는 **카메라 3대 모두에서 첫 프레임을 받아야** 정해집니다. 그 전에 `REC` 이나 X를 누르면 창이 `STOP` 으로 되돌아가고, 제목에 `카메라 프레임 대기 중` 이 표시됩니다. 잠시 기다렸다가 다시 누르세요.
:::

### 이미 저장한 에피소드는 지우지 않고 표시만 합니다

LeRobot 데이터셋은 저장된 에피소드를 그 자리에서 지울 수 없습니다. 그래서 녹화가 끝난 뒤 Y를 누르면 삭제 대신 **폐기 표시**를 남깁니다 (`rejected_episodes.json`). 표시한 에피소드는 [데이터셋 검수](#데이터셋-검수)에서 최종 데이터셋을 만들 때 빠집니다.

## 저장 위치

```text title="데이터셋 경로"
~/aiworker_data/<TASK_NAME>_eef/     ← RECORD_EEF=True (기본값)
~/aiworker_data/<TASK_NAME>/         ← RECORD_EEF=False
```

- `TASK_NAME` 은 녹화 설정 셀에서 바꿉니다. 작업이 바뀌면 반드시 함께 바꿔 주세요. 이 값은 LeRobot 프레임마다 붙는 task 설명으로도 쓰입니다.
- 같은 경로에 데이터셋이 이미 있으면 **이어서 기록**합니다 (LeRobot `resume`).
- EEF를 포함한 데이터셋과 포함하지 않은 데이터셋은 구조가 달라 **서로 이어 쓸 수 없습니다.** 그래서 EEF를 켜면 폴더 이름 끝에 `_eef` 가 붙습니다.

## 데이터셋 구조

```text title="~/aiworker_data/<TASK_NAME>_eef/"
data/                     ← 프레임 데이터 (parquet)
videos/                   ← 카메라별 영상 (h264)
meta/                     ← info.json, 에피소드 목록 등
rejected_episodes.json    ← Y로 폐기 표시한 에피소드 번호
```

| 키 | 내용 |
| --- | --- |
| `observation.state` | 로봇 실제 관절값 19개 (리프트 1 · 헤드 2 · 양팔 14 · 그리퍼 2) |
| `action` | 텔레옵이 로봇에 보낸 관절 명령 (같은 19개, 같은 순서) |
| `observation.images.head` · `.wrist_left` · `.wrist_right` | 카메라별 영상 (RGB) |
| `observation.eef_pose` | 실측 관절로 계산한 양손 손목 자세 (`RECORD_EEF=True` 일 때) |
| `action.eef_pose` | 명령 관절로 계산한 양손 손목 자세 (`RECORD_EEF=True` 일 때) |

EEF 자세는 손마다 `x y z qw qx qy qz` (base_link 기준, m / 쿼터니언), 양손 합쳐 14차원입니다. 텔레옵이 제어하는 손목 프레임과 같은 점입니다.

:::warning[DRY RUN에서는 action이 쌓이지 않습니다]
`action` 은 **REAL RUN에서 양손 grip을 잡고 조작하는 동안만** 들어옵니다. 그 밖의 구간은 `NaN` 으로 기록되므로, DRY RUN으로만 녹화한 에피소드는 action이 비어 있습니다.
:::

:::danger[종료 중에 두 번 끊지 마세요]
실행 셀이 끝나면 데이터셋을 **마무리(finalize)** 하면서 parquet 파일을 닫습니다. 이 단계가 끝나기 전에는 이번 세션의 에피소드를 읽을 수 없습니다. 마무리 중에 인터럽트를 다시 누르면 **이번 세션의 관절 데이터를 잃을 수 있습니다.** 마무리 메시지가 나올 때까지 기다리세요.
:::

녹화 노트북 마지막 셀(수집 결과 확인)을 실행하면 저장된 에피소드 목록과 길이·프레임 수를 볼 수 있습니다. 실행 셀을 STOP한 뒤에 실행하세요.

## 카메라 구성

| 토픽 이름 | 카메라 | ZMQ 포트 |
| --- | --- | --- |
| `head` | Stereolabs ZED Mini (헤드) | 5570 |
| `wrist_left` | Intel RealSense D405 (왼손) | 5571 |
| `wrist_right` | Intel RealSense D405 (오른손) | 5572 |

카메라 3대는 Orin의 `worker_outbound` 가 관절 상태와 함께 보냅니다.

## 데이터셋 검수

`VR_teleoperation/real_notebook/review_dataset.ipynb` 로 에피소드를 하나씩 영상으로 확인하고, 보관할 것만 모아 **최종 데이터셋**을 새로 만듭니다. 원본은 수정하지 않습니다. 로봇 연결은 필요 없습니다.

1. ② 셀의 `TASK_NAME` 에 검수할 **데이터셋 폴더 이름**을 넣습니다. EEF를 켜고 녹화했다면 `_eef` 까지 포함합니다 (예: `pick_and_place_eef`).
2. 요약 표에서 `action_NaN` 비율이 높은 에피소드는 실제 조작이 거의 없었다는 뜻이니 먼저 봅니다.
3. ③ 셀을 실행하면 `SG2 review` 창이 뜹니다. **창을 클릭해 포커스를 준 뒤** 키를 누릅니다. 녹화 중 Y로 표시한 에피소드는 미리 폐기로 들어가 있습니다.

   | 키 | 동작 |
   | --- | --- |
   | `K` | 보관하고 다음 에피소드 |
   | `D` | 폐기하고 다음 에피소드 |
   | `SPACE` | 재생 / 일시정지 |
   | `R` | 이 에피소드 처음부터 다시 |
   | `.` 또는 `→` | 한 프레임 앞으로 (일시정지 중) |
   | `N` / `P` | 판정 없이 다음 / 이전 에피소드 |
   | `Q` | 검수 종료 (지금까지 판정은 유지) |

4. ④ 셀에서 판정을 확인합니다. 판정하지 않은 에피소드는 **보관**으로 처리됩니다. 잘못 누른 것은 `decisions[3] = True` 처럼 고친 뒤 셀을 다시 실행합니다.
5. ⑤ 셀이 폐기한 에피소드를 뺀 새 데이터셋 `~/aiworker_data/<TASK_NAME>_final/` 을 만듭니다. 보관한 에피소드는 0번부터 다시 번호가 붙습니다.
6. ⑥ 셀로 새 데이터셋의 에피소드 수와 shape를 확인합니다. 학습 코드에서 열 때도 `video_backend="pyav"` 를 넘깁니다.

## 좋은 데모를 모으는 요령

- 에피소드마다 시작 자세를 비슷하게 맞추면 학습이 쉬워집니다. 오른쪽 **A**(Initial pose)나 **B 1초**(reset pose)로 초기 자세를 잡고 시작하세요.
- 실패한 시도는 왼쪽 **Y** 버튼을 눌러 라벨링 해둡니다. 나중에 고르는 것보다 그 자리에서 표시하는 편이 빠릅니다.

## 관련 문서

- [실행](./3_run.md)
- [문제 해결](./5_troubleshooting.md)
- [Policy Inference](../6_policy-inference/policy-inference.md) — 이 데이터로 학습한 정책을 로봇에서 돌리기
- [AI WORKER 개요 — 센서 구성](../1_ai-worker/1_overview.md)
