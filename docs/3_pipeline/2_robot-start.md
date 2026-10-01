---
sidebar_position: 2
title: 로봇 구동
---

# 로봇 구동

:::info[시작 전 확인]
- [ ] [환경 구축](./1_setup.md) 완료 — conda 환경 `ri_motion_v5_py312`, 저장소 clone, SSH 설정
- [ ] 로봇 작업 반경에 사람·장애물 없음, **E-stop 담당자 1명 대기**
:::

전원을 넣고 ROS 2 노드가 올라오는 **bringup**까지의 절차입니다. 여기까지 끝나면 [Interactive Marker](../4_interactive-marker/interactive-marker.md), [VR Teleoperation](../5_vr-teleoperation/3_run.md), [Policy Inference](../6_policy-inference/policy-inference.md) 중 하나로 넘어갑니다.

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
```

`worker_bringup` 은 **follower만** 띄웁니다. (카메라 ON, LiDAR OFF, 물리 리더 없음) Interactive Marker · VR Teleoperation · 베이스 이동 · Policy Inference 모두 이 명령으로 시작합니다.

:::danger[`worker_bringup` 은 켤 때 팔을 움직입니다]
기본값(`init_position:=true`)으로 켜면 **팔·그리퍼·헤드·리프트·스티어링 전체가 초기 자세 시퀀스**를 따라 움직입니다. 팔 주변에 사람·물체가 없는지 확인하고, 이동이 끝난 뒤 outbound · inbound 를 띄웁니다.
팔을 올리면 안 되는 상황이라면 `init_position:=false` 로 켭니다.
:::

`command not found` 가 뜨면 `source ~/.bashrc` 후 다시 실행합니다.

### `worker_*` 명령 정리

| 명령 | 설명 |
| --- | --- |
| `worker_bringup` | **기본.** follower만 실행. 켤 때 전체 초기 자세로 이동 |
| `worker_bringup init_position:=false` | 팔을 올리면 안 될 때. **헤드만** 초기 자세(`head_joint1` 0.69 rad, `head_joint2` 0)로 이동하고 팔·리프트·베이스는 그대로 |
| `worker_bringup init_position:=false init_head:=false` | 헤드까지 아무것도 움직이지 않음 |
| `worker_bringup_lg2` | 물리 리더(FFW-LG2)를 쓸 때. follower 초기 자세 이동 후 **30초 뒤** 리더 시작 |
| `worker_outbound` | 관절 상태 (:5560) + 카메라 3대 (:5570~5572) 전송 |
| `worker_inbound` | 맥북 명령 수신 (:5561) — 팔·그리퍼·리프트·헤드·베이스 공통 |
| `worker_shutdown` | 팔 접기 — `scripts/ffw_sg2_shutdown.sh` 실행. **팔이 책상 위 영역에 있을 때만** 사용 (책상 아래라면 쓰지 않고 inbound → outbound → bringup 순으로 종료). 실행 후 inbound가 남아 있으면 `Ctrl+C` ([로봇 종료](./3_robot-exit.md) 참고) |

:::warning[`init_head:=false` 는 헤드 위치를 확인하고 씁니다]
`init_position:=false` 에서도 헤드를 옮기는 이유는, strict JSON worker가 `head_joint1` 이 **`[-0.2317, 0.6951] rad`** 밖에 있으면 로봇 상태를 전부 거부하기 때문입니다. 헤드가 이 범위 밖에 있을 때 `init_head:=false` 로 켜면 노트북이 로봇 피드백을 받지 못합니다.
:::

:::warning[물리 리더와 맥북 제어는 동시에 쓰지 않습니다]
`worker_bringup_lg2` 로 띄운 상태에서 inbound를 켜면 follower가 두 곳에서 명령을 받습니다. 맥북 노트북으로 제어할 때는 `worker_bringup` 을 씁니다.
:::

### outbound · inbound 는 모든 파이프라인이 같은 JSON worker를 씁니다

VR · Joint · EEF · Base · 정책 추론이 모두 `VR_teleoperation/package/worker/` 의 **strict JSON worker** 하나를 공유합니다. `SG2_FIXED_QUEST` 는 지정하지 않아도 JSON(`1`)이 기본값이므로 별도 환경 변수 없이 띄웁니다.

```bash title="Orin 컨테이너 — 모든 파이프라인 공통"
worker_outbound
SG2_ZMQ_SUB_IP=192.168.6.xxx worker_inbound    # 맥북 IP 입력
```

- `SG2_FIXED_QUEST=0` 은 예전 pickle 방식입니다. 현재 노트북은 이 모드로 통신하지 못하니 **쓰지 않습니다.** `.bashrc` 등에 `export SG2_FIXED_QUEST=0` 이 남아 있다면 지웁니다.
- 로봇 제어 세션은 **한 번에 하나만** 가질 수 있습니다. VR·마커·베이스·정책 노트북을 동시에 켜지 말고, 다른 노트북은 `OFF`/`STOP` 한 뒤 시작합니다.

### ROBOTIS 공식 launch 옵션

`worker_*` 대신 launch 파일을 직접 쓸 수도 있습니다.

```bash
# Follower 단독
ros2 launch ffw_bringup ffw_sg2_follower_ai.launch.py

# Leader(FFW-LG2) + Follower 동시 — worker_bringup_lg2 와 같은 용도
ros2 launch ffw_bringup ffw_sg2_ai.launch.py
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
zmq/outbound.py              ← 로봇 → 맥북 관절 (:5560), --meta 로 카메라도 (worker_outbound)
zmq/camera_outbound.py       ← 카메라 3대 (:5570 head / :5571 wrist_left / :5572 wrist_right)
zmq/inbound.py               ← 맥북 → 로봇 명령 (:5561)
zmq/fixed_quest_protocol.py  ← 명령 안전 규칙 (JSON 모드, 기본값)
zmq/freedrive.py             ← 토크 on/off (프리드라이브)
zmq/_old/                    ← 수정 전 백업
scripts/worker_aliases.sh    ← worker_* 명령 정의 (~/.bashrc 가 source)
ffw_bringup/launch/ffw_sg2_teleop.launch.py  ← worker_bringup
ffw_bringup/launch/ffw_sg2_ai.launch.py      ← worker_bringup_lg2
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
| 노트북이 `invalid_json_feedback` · `protocol_mismatch_legacy_pickle` | worker가 pickle 모드(`SG2_FIXED_QUEST=0`)로 떠 있음. `echo $SG2_FIXED_QUEST` 가 `0` 이면 `unset SG2_FIXED_QUEST` 후 두 worker를 다시 띄움 |

## 관련 문서

- [환경 구축](./1_setup.md)
- [로봇 종료](./3_robot-exit.md)
- [프리드라이브](./4_freedrive.md)
- [AI WORKER 개요](../1_ai-worker/1_overview.md)
