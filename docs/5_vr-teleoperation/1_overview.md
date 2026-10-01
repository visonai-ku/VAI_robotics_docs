---
sidebar_position: 1
title: 개요
---

# VR Teleoperation 개요

:::note
Meta Quest 3 컨트롤러로 FFW-SG2 두 팔을 조작하고, 조작하는 동안 관절·카메라·명령을 맥북에 녹화하는 파이프라인입니다.
공통 준비(SSH, 커널, 로봇 구동)는 [Pipeline](../3_pipeline/1_setup.md)에서 끝내고 오세요. 이 문서는 VR 전용 구성만 다룹니다.
:::

## 전체 구조

```text title="VR Teleoperation 데이터 흐름"
Quest 3 브라우저 ──(WebXR, wss:8443)──▶ 맥북 노트북 ──(ZMQ :5561 명령)──▶ Orin inbound.py ──ROS 2──▶ 로봇
                                    (IK·충돌검사·녹화)  ◀──(ZMQ :5560 관절)── Orin outbound.py ◀──ROS 2──┘
                                                        ◀──(ZMQ :5570/5571/5572 카메라)──┘
```

| 장치 | 역할 | 주소 |
| --- | --- | --- |
| Quest 3 | 브라우저로 맥북 페이지에 접속, 컨트롤러 위치·버튼 전송 | 192.168.6.x (DHCP) |
| 맥북 | 노트북 실행: Quest 입력 → IK → 안전 검사 → 로봇 명령, 녹화 | 192.168.6.x (DHCP, 바뀔 수 있음) |
| Orin (로봇) | ROS 2 드라이버 + ZMQ 브리지 (`ai_worker` 도커 컨테이너) | 192.168.6.2 / `ffw-SNPR48A1115.local` |

| 포트 | 용도 |
| --- | --- |
| 5560 | 로봇 → 맥북 관절 상태 |
| 5561 | 맥북 → 로봇 명령 (팔·그리퍼·베이스 공통, JSON) |
| 5570 / 5571 / 5572 | 카메라 head / wrist_left / wrist_right |
| 8443 | Quest가 접속하는 HTTPS·WebSocket 서버 |

- 세 장치 모두 같은 네트워크(**192.168.6.x**)에 있어야 합니다.
- Quest는 **컨트롤러만** 인식합니다. 맨손(핸드 트래킹)은 동작하지 않습니다.
- Quest Wi-Fi는 `AIWORKER1115` 입니다 — [Meta Quest 3 초기 설정](../2_meta-quest-3/setup.md) 참고.

## 파일 구성

```text title="VAI_AIWORKER/VR_teleoperation/"
real_notebook/
  real_vr_teleop_record.ipynb   ← 실사용: 텔레옵 + 녹화 + 컨트롤러 버튼
  real_vr_teleop.ipynb          ← 텔레옵만 (녹화 없음)
  review_dataset.ipynb          ← 녹화한 데이터셋 검수 → 최종 데이터셋
  real_policy_inference.ipynb   ← 정책 추론 (Policy Inference 문서)
sim_notebook/
  sim_vr_teleop.ipynb           ← 로봇 없이 연습
calibration_notebook/
  calibrate_intent_axes.ipynb   ← 개인 의도 축 보정
quest_client/                   ← Quest 가 여는 웹 페이지 (index.html, client.js)
package/
  intent_teleop.py              ← 텔레옵 메인 루프, 컨트롤 창
  controller_mapping.py         ← 컨트롤러 delta → 로봇 목표 (20cm 작업범위, 회전 데드밴드)
  quest_controller_server.py    ← 8443 HTTPS/WebSocket 서버
  fixed_quest_transport.py      ← ZMQ 송수신 (상태 5560 / 명령 5561)
  fixed_quest_real.py           ← 로봇 명령·안전 검사
  fixed_quest_sim.py            ← IK 플래너
  fixed_quest_scene.py          ← MuJoCo 장면 구성
  home_path.py                  ← Initial pose 복귀 경로 탐색
  vr_buttons.py                 ← X/Y/A/B 버튼 동작
  episode_recorder.py           ← 녹화 (LeRobot v3.0 데이터셋)
  eef_pose.py                   ← 녹화용 손목 EEF 자세 (FK)
  robot_client.py               ← Joint/EEF/Base 노트북의 공통 JSON 클라이언트
  base_control.py               ← 베이스 키보드 조작
  policy_deploy.py              ← 정책 추론 세션 (policy_inference.py, policy_record_control.py)
  safety_box.py                 ← 정책 추론용 손목 safety box
  init_project.py               ← 경로 설정 (vendor/ 사본을 sys.path 앞에 삽입)
  worker/                       ← 로봇에 배포하는 공통 JSON worker
    inbound.py  outbound.py  fixed_quest_protocol.py  camera_outbound.py  freedrive.py
docs/WORKER_SETUP.md            ← 로봇 worker 배포 안내
docs/CALIBRATION.md             ← 개인 보정 안내
scripts/                        ← check_workspace.py, validate_intent_pipeline.py,
                                  check_policy_inference.py, check_safety_box_inference.py, live_fk_monitor.py
tests/                          ← 오프라인 회귀 검사
vendor/ri_motion_v5_package/    ← 실행에 필요한 공용 런타임 사본
xml/                            ← SG2 MJCF 모델과 mesh
qpos/                           ← Joint 컨트롤러의 저장 자세 (sg2_joint_qpos.json)
calibration/                    ← 개인 보정값 (diagnostics/, reviews/)
requirements.txt                ← 런타임 의존성
requirements-notebook.txt       ← 위 + ipykernel, jupyterlab
```

## 시뮬레이션으로 먼저 연습

실제 로봇 없이 파이프라인을 한 번 돌려 봅니다.

1. `sim_notebook/sim_vr_teleop.ipynb` 를 엽니다.
2. 커널을 `ri_motion_v5_py312` 로 선택합니다.
3. 설정 셀이 출력한 주소(`https://192.168.6.xxx:8443/`)를 Quest 브라우저에 입력합니다.
4. MuJoCo 화면이 뜨면 양손 grip을 눌러 attach하고, 팔이 따라 움직이는지 확인합니다.

## 관련 문서

- [실행](./3_run.md)
- [녹화와 데이터](./4_recording.md)
- [문제 해결](./5_troubleshooting.md)
- [Pipeline — 환경 구축](../3_pipeline/1_setup.md)
- [Pipeline — 로봇 구동](../3_pipeline/2_robot-start.md)
