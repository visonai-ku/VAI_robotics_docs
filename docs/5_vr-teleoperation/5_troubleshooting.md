---
sidebar_position: 5
title: 문제 해결
---

# VR Teleoperation 문제 해결

:::note
증상별로 가장 흔한 원인과 해결을 모았습니다. 같은 증상을 두 번 겪으면 여기에 추가해 주세요.
:::

## 연결 · 네트워크

| 증상 | 원인 / 해결 |
| --- | --- |
| Quest에서 "사이트에 연결할 수 없음" | 노트북 실행 셀이 안 돌고 있음, 또는 IP가 틀림. 셀 실행 후 설정 셀이 알려준 IP로 접속 |
| `Quest receiver failed to start` | 8443 포트를 다른 노트북이 쓰는 중. 다른 VR 노트북을 STOP하고 커널 재시작 |
| `QUEST_HOST ... PC LAN IP` 오류 | 맥북이 로봇 네트워크(192.168.6.x)에 없음. 랜선/와이파이 확인 |
| Orin 접속 안 됨 (`No route to host`) | 로봇 전원, 부팅 대기(1~2분), 랜선 확인 |

## 입력 · 트래킹

| 증상 | 원인 / 해결 |
| --- | --- |
| 컨트롤 창 `WAIT_INPUT · no_frame` | XR 시작 버튼을 안 눌렀거나, 맨손 사용, 또는 Quest 탭이 여러 개. 탭 하나만 두고 XR 시작 |
| `tracking_lost_left/right` | 컨트롤러가 꺼졌거나 헤드셋 시야 밖 |
| 잡아도 팔이 거의 안 움직임 | grip을 짧게만 잡음 (속도가 서서히 올라감). 계속 잡은 채 움직이기 |
| 컨트롤러를 조금 돌렸는데 로봇 손목이 안 돎 | 8° 이내 회전은 무시하도록 설정됨. 더 크게 돌리기 (설정 셀 `ROTATION_DEADBAND_DEG`) |

## 로봇 동작

| 증상 | 원인 / 해결 |
| --- | --- |
| DRY RUN은 되는데 REAL RUN에서 로봇이 안 움직임 | inbound의 `SG2_ZMQ_SUB_IP` 가 맥북 IP가 아니거나 `SG2_FIXED_QUEST=1` 누락. inbound 재시작 |
| 로봇 피드백이 계속 거부됨 | 헤드가 VR 허용 범위 밖. `worker_bringup_teleop`(헤드 `[0, 0]`)로 다시 켜기 |
| 화면에 `!! IK FAILED` | 손이 로봇이 닿을 수 없는 곳. 손을 되돌리고 grip을 놓았다 다시 잡기 |
| B reset pose가 "중단 … 팔을 조금 벌린 뒤 다시 B" | 경로 충돌 검사에서 막힘. VR로 팔 사이를 벌린 뒤 다시 B |
| 로봇이 두 곳에서 명령 받는 듯 흔들림 | `ros2 launch robotis_vuer ...`(ROBOTIS VR)이나 LG2 리더가 켜져 있음. 끄고 사용 |
| B reset pose가 100°/s가 아니라 느림 | 로봇의 `fixed_quest_protocol.py` 가 구버전. `VR_teleoperation/package/worker/fixed_quest_protocol.py` 로 교체하고 inbound·outbound 재시작 (배포 절차는 별도 문서) |
| 키보드로 베이스가 안 움직임 | inbound가 strict 모드(`SG2_FIXED_QUEST=1`)로 떠 있으면 베이스 명령이 무시됨. 환경 변수 없이 재시작. 그 외에는 MuJoCo 창 포커스와 `Robot command` `ON` 확인 |
| 관절에 힘이 없음 | torque-off 상태. Remote E-STOP의 **A 버튼** |

## 카메라 · 녹화

| 증상 | 원인 / 해결 |
| --- | --- |
| 카메라가 안 잡힘 | `worker_outbound_meta` 가 아니라 `worker_outbound` 로 켰음. 또는 로봇의 `outbound.py` 가 `--meta` 를 지원하지 않는 구버전 (저장소에서는 `ri_motion_v5_VR/.../package/worker/outbound.py` 쪽만 지원) |
| `action.npz` 가 비어 있음 | DRY RUN으로 녹화함. REAL RUN에서 grip을 잡고 조작해야 기록됨 |
| 창 제목의 Hz가 계속 떨어짐 | 네트워크 혼잡 또는 카메라 연결 불량. 유선 연결 확인 |

## 환경 · 설치

| 증상 | 원인 / 해결 |
| --- | --- |
| 노트북 첫 셀 `ImportError ... _spropack ... __thread_bss` | pip scipy가 macOS와 맞지 않음. `mamba install -n ri_motion_v5_env -c conda-forge scipy` |
| `command not found` (worker_*) | `source ~/.bashrc` 후 다시 실행 |
| 커널 목록에 `ri_motion_v5_env` 가 없음 | ipykernel 등록이 안 됨. [Pipeline 환경 구축](../3_pipeline/1_setup.md)의 커널 등록 명령 재실행 |
| `RuntimeError: An earlier project module is already loaded` | 다른 프로젝트 모듈이 올라온 커널을 재사용함. 커널 Restart 후 첫 셀부터 다시 실행 |

## 관련 문서

- [개요](./1_overview.md)
- [실행](./3_run.md)
- [녹화와 데이터](./4_recording.md)
