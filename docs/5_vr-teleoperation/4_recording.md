---
sidebar_position: 4
title: 녹화와 데이터
---

# 녹화와 데이터

:::info[시작 전 확인]
- [ ] [실행](./3_run.md) 절차로 텔레옵이 돌고 있는가
- [ ] Orin outbound를 `worker_outbound_meta` 로 띄웠는가 (카메라 3대)
- [ ] 노트북 녹화 설정 셀의 `TASK_NAME` 을 이번 작업 이름으로 바꿨는가
:::

:::note
텔레옵 중 관절·명령·카메라를 에피소드 단위로 기록합니다. 모방학습 데이터셋의 원본이 되는 부분입니다.
:::

## 녹화 조작

| 방법 | 동작 |
| --- | --- |
| 왼쪽 컨트롤러 **X** | 녹화 시작 / 종료 (누를 때마다 전환) |
| 왼쪽 컨트롤러 **Y 1초** | 녹화 중이면 버리기, 아니면 마지막 에피소드 삭제 |
| SG2 Record 창 | `STOP` → `REC` 시작, `REC` → `STOP` 저장, `DEL` 삭제 |

창 제목에 상태와 수신 속도가 표시됩니다.

```text title="SG2 Record 창 제목"
● REC episode_003 12.3s | Hz joint 30 action 30 head 17 ...
```

- 에피소드는 **120초**가 지나면 자동 저장됩니다.
- 노트북 실행 셀이 끝날 때 녹화 중이던 에피소드는 자동 저장됩니다.

## 저장 위치

```text title="에피소드 저장 경로"
~/aiworker_data/<TASK_NAME>/episode_NNN/
```

`TASK_NAME` 은 노트북의 녹화 설정 셀에서 바꿉니다. 작업이 바뀌면 반드시 함께 바꿔 주세요.

## 에피소드 파일

| 파일 | 내용 |
| --- | --- |
| `joints.npz` | 로봇 실제 관절값 `t, q, names` |
| `action.npz` | 텔레옵 명령 `t, q, names, valid, mode, motion` (valid = 직전 명령이 신선한지, mode = DRY/REAL, motion = 동작 구분) |
| `rgb_head.mp4`, `rgb_wrist_left.mp4`, `rgb_wrist_right.mp4` | 카메라별 영상 |
| `rgb_<cam>_t.npy` | 영상 프레임 시각 |
| `meta.json` | 길이, 샘플 수, 카메라 목록 등 |

:::warning[DRY RUN에서는 action이 쌓이지 않습니다]
`action` 은 **REAL RUN에서 grip을 잡고 조작하는 동안만** 기록됩니다. DRY RUN으로 녹화하면 action이 0입니다.
:::

## 카메라 구성

| 토픽 이름 | 카메라 | ZMQ 포트 |
| --- | --- | --- |
| `head` | Stereolabs ZED Mini (헤드) | 5570 |
| `wrist_left` | Intel RealSense D405 (왼손) | 5571 |
| `wrist_right` | Intel RealSense D405 (오른손) | 5572 |

카메라를 함께 받으려면 Orin에서 `worker_outbound` 가 아니라 **`worker_outbound_meta`** 로 실행해야 합니다.

## 좋은 데모를 모으는 요령

- 녹화 전에 한 번 DRY RUN으로 경로를 연습하고, REAL RUN으로 전환한 뒤 X를 누릅니다.
- 실패한 시도는 왼쪽 **Y 1초**로 바로 버립니다. 나중에 고르는 것보다 그 자리에서 버리는 편이 빠릅니다.
- 한 에피소드가 너무 길어지지 않게 합니다. (120초 자동 저장)
- 에피소드마다 시작 자세를 비슷하게 맞추면 학습이 쉬워집니다. 오른쪽 **B 1초**로 초기 자세를 잡고 시작하세요.
- 창 제목의 Hz 값이 떨어지면(joint/action/head) 네트워크나 카메라 문제일 수 있습니다. 데이터 품질에 바로 영향을 줍니다.

## 관련 문서

- [실행](./3_run.md)
- [문제 해결](./5_troubleshooting.md)
- [AI WORKER 개요 — 센서 구성](../1_ai-worker/1_overview.md)
