---
sidebar_position: 2
title: 로봇 구동
---

# 로봇 구동

:::info[시작 전 확인]
- [ ] [환경 구축](./1_setup.md) 완료 — conda 환경 `ri_motion_v5_env`, 저장소 clone, SSH 설정
- [ ] 로봇 작업 반경에 사람·장애물 없음, **E-stop 담당자 1명 대기**
- [ ] (VR Teleoperation을 쓸 경우) 로봇 worker가 최신 버전인가 — inbound 로그에 `home 30.0 deg/s`
:::

전원을 넣고 ROS 2 노드가 올라오는 **bringup**까지의 절차입니다. 여기까지 끝나면 [Interactive Marker](../4_interactive-marker/interactive-marker.md) 또는 [VR Teleoperation](../5_vr-teleoperation/2_run.md) 으로 넘어갑니다.

## 1. 전원 인가

1. `Key Switch` 를 꽂고 **2시 방향**으로 돌립니다.
2. `Power Button` 을 **3초간** 길게 누릅니다. 비프음이 나면 전원이 들어온 것이고, 로봇 머리에 불이 들어옵니다.

### 본체 후면 포트

| 포트 | 용도 |
| --- | --- |
| `WAN Port` | 외부 네트워크·인터넷 연결 |
| `LAN Port` | SSH·원격 데스크톱으로 로봇 PC 접속 |
| `USB Ports` | 키보드, 마우스, USB 드라이브 등 |
| `HDMI Port` | 모니터 직접 연결 |
| `Charge Port` | 배터리 충전 |

## 2. Remote E-STOP 해제

:::danger[처음 전원을 켜면 토크가 꺼져 있습니다]
AI WORKER는 전원을 켠 직후 **torque-off** 상태입니다. DYNAMIXEL과 통신하려면 Remote E-STOP의 **A 버튼**을 눌러야 합니다. 안전 잠금이 풀리면 비프음이 납니다.
:::

- 비상 정지: 빨간 버섯 버튼을 누릅니다.
- 해제: 버튼을 시계 방향으로 돌린 뒤 **A 버튼**을 누릅니다.
- 나머지 버튼은 기능이 없습니다.

:::danger[실제 로봇 구동 시 반드시 확인]
- **파괴력 주의**: 로봇의 힘이 매우 강합니다. (로봇 워크스테이션도 구겨질 수 있습니다)
- **인원 통제**: 로봇 작업 반경으로 사람이 지나다니지 않도록 합니다.
- **E-stop 대기**: 구동 시점부터 **비상 정지 버튼을 누를 사람 1명을 반드시 대기**시킵니다.
:::

## 3. Orin 접속

```bash title="맥북 터미널"
ssh robotis@ffw-SNPR48A1115.local     # System password: root
docker exec -it ai_worker bash
```

SSH 설정은 [환경 구축](./1_setup.md)에서 미리 해 둡니다.

## 4. Bringup

컨테이너 안에서 실행합니다. `worker_*` 는 `scripts/worker_aliases.sh` 에 정의된 단축 명령입니다.

```bash title="Orin 컨테이너"
worker_bringup
# = ros2 launch ffw_bringup ffw_sg2_ai.launch.py
```

:::warning[`worker_bringup` 은 Leader까지 함께 띄웁니다]
`ffw_sg2_ai.launch.py` 는 **Leader(FFW-LG2) + Follower 동시 실행**입니다. LG2를 쓰지 않는다면 `worker_bringup_teleop` 쪽이 맞습니다.
:::

`command not found` 가 뜨면 `source ~/.bashrc` 후 다시 실행합니다.

### `worker_*` 명령 정리

| 명령 | 설명 |
| --- | --- |
| `worker_bringup` | `ffw_sg2_ai.launch.py` — **Leader + Follower**. 켤 때 초기 자세로 이동 |
| `worker_bringup_teleop` | follower 모터·통신·카메라만. 켤 때 **헤드만** `[0, 0]` 으로 이동 |
| `worker_outbound` / `worker_outbound_meta` | 관절 전송 / 관절 + 카메라 전송 |
| `worker_inbound` | 명령 수신 |
| `worker_shutdown` | 팔 접기 — `scripts/ffw_sg2_shutdown.sh` 실행 (inbound 를 먼저 끔) |

:::warning[어느 bringup을 쓸지는 파이프라인마다 다릅니다]
`worker_bringup_teleop` 이 헤드를 움직이는 이유는, VR strict worker가 `head_joint1` 이 **`[-0.2317, 0.6951] rad`** 밖에 있으면 로봇 상태를 전부 거부하기 때문입니다. 팔·리프트·베이스는 건드리지 않습니다.

- 헤드도 그대로 두기: `worker_bringup_teleop init_head:=false`
- 전부 초기 자세로: `worker_bringup_teleop init_position:=true`

`worker_outbound` · `worker_inbound` 는 **환경 변수가 파이프라인마다 달라서** 각 문서에서 안내합니다. 특히 `SG2_FIXED_QUEST` 값을 틀리면 로봇이 명령을 받지 못합니다.
:::

| 파이프라인 | bringup | outbound · inbound |
| --- | --- | --- |
| [Interactive Marker](../4_interactive-marker/interactive-marker.md) | `worker_bringup` | `SG2_FIXED_QUEST` **없이** |
| [VR Teleoperation](../5_vr-teleoperation/2_run.md) | `worker_bringup_teleop` | `SG2_FIXED_QUEST=1` |

### ROBOTIS 공식 launch 옵션

`worker_*` 대신 launch 파일을 직접 쓸 수도 있습니다.

```bash
# Follower 단독
ros2 launch ffw_bringup ffw_sg2_follower_ai.launch.py

# Leader(FFW-LG2) + Follower 동시
ros2 launch ffw_bringup ffw_sg2_ai.launch.py   # 단축: ffw_sg2_ai
```

| 파라미터 | 설명 |
| --- | --- |
| `launch_cameras:=false` | 카메라를 띄우지 않고 실행 |
| `init_position:=false` | 초기 자세 정렬 없이 실행 |

:::tip[Leader(FFW-LG2)를 쓸 때]
LG2는 실행 후 **양손 트리거를 2초 이상** 눌러야 follower가 움직이기 시작합니다. 처음에는 천천히 leader 자세를 따라가다가 가까워지면 빨라집니다.
:::

## 5. Orin 파일 구성

```text title="Orin ~/ai_worker/ (컨테이너 /root/ros2_ws/src/ai_worker/)"
zmq/outbound.py              ← 로봇 → 맥북 관절 (:5560), --meta 로 카메라도
zmq/camera_outbound.py       ← 카메라 3대 (:5570 head / :5571 wrist_left / :5572 wrist_right)
zmq/inbound.py               ← 맥북 → 로봇 명령 (:5561)
zmq/fixed_quest_protocol.py  ← 명령 안전 규칙 (SG2_FIXED_QUEST=1 일 때)
zmq/_old/                    ← 수정 전 백업
scripts/worker_aliases.sh    ← worker_* 명령 정의
ffw_bringup/launch/ffw_sg2_teleop.launch.py  ← worker_bringup_teleop
```

## 6. 동작 확인

| 확인 항목 | 명령 / 방법 |
| --- | --- |
| 컨트롤러가 모두 active 인가 | `ros2 control list_controllers` |
| 관절 상태가 들어오는가 | `ros2 topic echo /joint_states` |
| 로봇 모델·TF가 정상인가 | RViz2 |
| 카메라 3대가 붙었는가 | `ros2 topic list` 에서 head / wrist_left / wrist_right |

## 자주 겪는 문제

| 증상 | 원인 / 해결 |
| --- | --- |
| 전원을 켰는데 관절에 힘이 없음 | torque-off 상태. Remote E-STOP의 **A 버튼**을 누름 |
| `command not found` | `source ~/.bashrc` 후 재실행 |
| Orin 접속 안 됨 (`No route to host`) | 로봇 전원, 부팅 대기(1~2분), 랜선 확인 |
| 카메라가 안 잡힘 | `launch_cameras:=false` 로 켰거나 카메라 연결 불량 |
| 로봇이 두 곳에서 명령을 받는 듯 흔들림 | 다른 텔레옵 경로(ROBOTIS VR, LG2 리더)가 켜져 있음. 하나만 남기고 종료 |

## 관련 문서

- [환경 구축](./1_setup.md)
- [로봇 종료](./3_robot-exit.md)
- [AI WORKER 개요](../1_ai-worker/1_overview.md)
