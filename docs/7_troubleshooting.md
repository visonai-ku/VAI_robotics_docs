---
sidebar_position: 8
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
| `tracking_lost_left/right` | 컨트롤러가 꺼졌거나 헤드셋 시야 밖 <br /> 1. 컨트롤러 배터리를 뺐다 껴보세요. <br /> 2. 그래도 안 되면 메타퀘스트 설정 탭에서 컨트롤러 페어링 해주시면 됩니다 |
| 잡아도 팔이 거의 안 움직임 | grip을 짧게만 잡음 (속도가 서서히 올라감). 계속 잡은 채 움직이기 |
| 가만히 든 손이 살짝 기울어도 로봇 손목이 돎 | 녹화용 노트북은 회전 데드밴드가 0°(`ROTATION_DEADBAND_DEG=0`)라 작은 회전도 그대로 따라감. 필요하면 설정 셀에서 값을 올리고 커널 재시작 |

## 개인 보정

| 증상 | 원인 / 해결 |
| --- | --- |
| 새 프로필이 작업자 보정 목록에 없음 | 실행 중에 저장한 파일은 **새로고침** 필요. `calibration/profiles/` · `calibration/diagnostics/` 에 있는지 확인 |
| 목록에서 골라도 바뀌지 않음 | 조작·복귀·녹화 중에는 잠김. REAL RUN이면 양손 추적이 유효한 상태에서 grip을 모두 놓고 다시 선택. DRY RUN 대기 중에는 추적 없이 바뀜 |
| `변경 실패 (파일명): ...` | 미완료·손상된 프로필. 현재 보정은 그대로 유지됨. 보정 노트북 결과의 `fit_success` · `reason` 확인 |
| 설정 셀을 다시 실행했더니 보정이 v1로 돌아감 | 정상. 설정 셀의 `PROFILE_PATH` 로 초기화됨. 목록에서 다시 고르거나 `PROFILE_PATH` 를 바꿈 |
| `unexpected keyword argument 'CONFIRM_CALIBRATION_SETUP'` 등 | 없어진 예전 설정(`CONFIRM_CALIBRATION_SETUP`, `*_CANDIDATE_*`, `ALLOW_FAILED_PROFILE_IN_SIM`)이 설정 셀에 남아 있음. 해당 줄을 지우고 설정 셀부터 다시 실행 |

## 로봇 동작

| 증상 | 원인 / 해결 |
| --- | --- |
| DRY RUN은 되는데 REAL RUN에서 로봇이 안 움직임 | inbound의 `SG2_ZMQ_SUB_IP` 가 맥북 IP가 아님. 또는 다른 노트북(마커·베이스·정책)이 제어 세션을 쥐고 있음. 확인 후 inbound 재시작 |
| worker 시작 로그에 `legacy pickle` · 노트북에 `invalid_json_feedback` · `protocol_mismatch_legacy_pickle` · `utf-8 ... byte 0x80` | worker가 pickle 모드(`SG2_FIXED_QUEST=0`)로 떠 있거나 예전 프로세스가 남아 있음. worker는 `SG2_FIXED_QUEST` 없이도 JSON으로 뜨지만, 환경에 `0` 이 남아 있으면 pickle 모드가 됨. 두 worker를 모두 끄고, `echo $SG2_FIXED_QUEST` 가 `0` 이면 `unset SG2_FIXED_QUEST` 후 다시 실행 |
| 로봇 피드백이 계속 거부됨 | 헤드가 VR 허용 범위 밖. `worker_bringup` 으로 다시 켜기 (팔을 움직이면 안 되면 `worker_bringup init_position:=false` — 헤드만 초기 자세로 이동) |
| 화면에 `!! IK FAILED` | 손이 로봇이 닿을 수 없는 곳. 손을 되돌리고 grip을 놓았다 다시 잡기 |
| B reset pose가 "중단 … 팔을 조금 벌린 뒤 다시 B" | 경로 충돌 검사에서 막힘. VR로 팔 사이를 벌린 뒤 다시 B |
| 로봇이 두 곳에서 명령 받는 듯 흔들림 | `ros2 launch robotis_vuer ...`(ROBOTIS VR)이나 LG2 리더가 켜져 있음. 끄고 사용 |
| B reset pose가 100°/s가 아니라 느림 | 로봇 worker가 구버전. `VR_teleoperation/package/worker/` 의 파일 세트로 교체하고 inbound·outbound 재시작 (`VR_teleoperation/docs/WORKER_SETUP.md`) |
| 두 팔이 가까워져도 멈추지 않음 | 정상 동작. 텔레옵 중에는 충돌 거리 검사가 꺼져 있음(`TELEOP_COLLISION_CHECK=False`). 직접 거리를 보며 조작 |
| 키보드로 베이스가 안 움직임 | ARMING이 끝난 뒤 키를 **모두 뗐다가 새로** 눌러야 함. MuJoCo 창 포커스, `Robot command` `ON` 확인. `SPACE` 를 눌렀다면 `OFF` 로 바뀌었으니 다시 `ON` |
| 베이스 `ON` 이 거부됨 | 로봇 worker가 베이스 JSON을 지원하지 않는 구버전이거나, VR 등 다른 노트북이 제어 세션을 쥐고 있음 |
| 관절에 힘이 없음 | torque-off 상태. Remote E-STOP의 **A 버튼** |

## 카메라 · 녹화

| 증상 | 원인 / 해결 |
| --- | --- |
| 카메라가 안 잡힘 | `worker_outbound` 가 꺼져 있거나, bringup을 `launch_cameras:=false` 로 켰거나, 카메라 연결 불량 |
| `REC` 을 눌러도 바로 `STOP` 으로 돌아감 | 카메라 3대의 첫 프레임을 아직 못 받음. 창 제목의 `카메라 프레임 대기 중` 이 사라진 뒤 다시 누름 |
| `... EEF pose ... 데이터셋입니다. ... 이어서 녹화할 수 없으니` | 같은 폴더에 EEF 설정이 다른 데이터셋이 있음. `TASK_NAME` 을 바꾸거나 `RECORD_EEF` 를 기존 데이터셋에 맞춤 |
| `finalize 되지 않은 데이터셋입니다` | 이전 세션이 마무리 전에 끊김. 다른 `TASK_NAME` 으로 새로 녹화 |
| 데이터셋의 `action` 이 NaN 투성이 | DRY RUN으로 녹화했거나 grip을 잡지 않은 구간. REAL RUN에서 grip을 잡고 조작해야 기록됨 |
| 창 제목의 Hz가 계속 떨어짐 | 네트워크 혼잡 또는 카메라 연결 불량. 유선 연결 확인 |

## 환경 · 설치

| 증상 | 원인 / 해결 |
| --- | --- |
| 녹화·검수 창에서 `The function is not implemented` | LeRobot이 설치한 headless OpenCV가 남아 있음. `python -m pip install --force-reinstall --no-deps opencv-python==4.12.0.88` |
| `command not found` (worker_*) | `source ~/.bashrc` 후 다시 실행 |
| 커널 목록에 `ri_motion_v5_py312` 가 없음 | ipykernel 등록이 안 됨. [Pipeline 환경 구축](./3_pipeline/1_setup.md)의 커널 등록 명령 재실행 |
| 녹화나 추론 import에서 오류 | 예전 `ri_motion_v5_env`(Python 3.10) 커널로 실행함. `ri_motion_v5_py312` 로 바꾸고 재시작 |
| `RuntimeError: An earlier project module is already loaded` | 다른 프로젝트 모듈이 올라온 커널을 재사용함. 커널 Restart 후 첫 셀부터 다시 실행 |

## 관련 문서

- [개요](./5_vr-teleoperation/1_overview.md)
- [개인 보정](./5_vr-teleoperation/2_calibration.md)
- [실행](./5_vr-teleoperation/3_run.md)
- [녹화와 데이터](./5_vr-teleoperation/4_recording.md)
