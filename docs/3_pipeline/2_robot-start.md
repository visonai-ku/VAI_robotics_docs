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

![SG2 후면 하단 패널](/img/SG2_panel_1.png)
![SG2 후면 상단 패널](/img/SG2_panel_2.png)

## 2. Remote E-STOP 해제

:::warning[처음 전원을 켜면 토크가 꺼져 있습니다]
AI WORKER는 전원을 켠 직후 **torque-off** 상태입니다. DYNAMIXEL과 통신하려면 Remote E-STOP의 **A 버튼**을 눌러야 합니다. 안전 잠금이 풀리면 비프음이 납니다.
:::

- 비상 정지: 빨간 버섯 버튼을 누릅니다.
- 해제: 버튼을 시계 방향으로 돌린 뒤 **A 버튼**을 누릅니다.
- 나머지 버튼은 기능이 없습니다.

![리모컨](/img/remotecontrol.png)

:::danger[실제 로봇 구동 시 반드시 확인]
- **파괴력 주의**: 로봇의 힘이 매우 강합니다. (로봇 워크스테이션도 구겨질 수 있습니다)
- **인원 통제**: 로봇 작업 반경으로 사람이 지나다니지 않도록 합니다.
- **E-stop 대기**: 구동 시점부터 **비상 정지 버튼을 누를 사람 1명을 반드시 대기**시킵니다.
:::

## 3. SSH 접속

```bash title="bash"
ssh robotis@ffw-SNPR48A1115.local     # System password: root
docker_exec                           # docker exec -it ai_worker bash
```

`docker_exec` 는 Orin에 등록된 `docker exec -it ai_worker bash` 단축 명령입니다. `command not found` 가 뜨면 원래 명령을 그대로 입력합니다.

SSH 설정은 [환경 구축](./1_setup.md)에서 미리 해 둡니다.

## 4. worker_*

SSH로 연결된 Orin의 ai_worker 컨테이너 안에서 실행합니다. `worker_*` 는 `scripts/worker_aliases.sh` 에 정의된 명령어입니다.

### `worker_*` 명령어 정리

| 명령 | 설명 |
| --- | --- |
| `worker_bringup` | **기본.** follower만 실행. 켤 때 로봇 초기 자세로 이동 |
| `worker_bringup init_position:=false` | 로봇 작동 없이 follower만 실행. **헤드만** 초기 자세로 이동 팔·리프트·베이스는 그대로 |
| `worker_bringup init_position:=false init_head:=false` | 헤드도 움직이지 않고 follower만 실행 |
| `worker_bringup_lg2` | FFW-LG2를 쓸 때. 로봇 초기 자세 이동 후 **30초 뒤** 리더 시작 |
| `worker_outbound` | 관절 상태 (:5560) + 카메라 3대 (:5570~5572) 맥북으로 전송 |
| `worker_inbound` | 맥북의 명령 수신 (:5561) — 팔·그리퍼·리프트·헤드·베이스 공통 |
| `worker_shutdown` | `scripts/ffw_sg2_shutdown.sh` 실행. **팔이 책상 위 영역에 있을 때만** 사용. shutdown 실행 후에도 inbound가 남아 있으면 `Ctrl+C` ([로봇 종료](./3_robot-exit.md) 참고)<br/>(책상 아래라면 쓰지 않고 inbound → outbound → bringup 순으로 종료). <br/>  |

:::warning[LG2 리더와 맥북 제어는 동시에 사용할 수 없습니다]
`worker_bringup_lg2` 실행 상태에서 inbound를 켜면 follower가 두 곳에서 명령을 받습니다. EEF/Joint controller 사용, VR teleoperation, policy inference 시에는 `worker_bringup` 을 씁니다.
:::

## 5. Bringup

```bash title="~/ros2_ws#"
worker_bringup
```

로봇의 follower를 켜는 단계입니다. Interactive Marker · VR Teleoperation · 베이스 이동 · Policy Inference 모두 이 명령으로 시작합니다.

:::danger[`worker_bringup` 은 실행시 로봇이 동작합니다]
**팔·그리퍼·헤드·리프트·스티어링 전체가 초기 자세 시퀀스**를 따라 움직입니다. 팔 주변에 사람·물체가 없는지 확인하고, 이동이 끝난 뒤 outbound · inbound 를 띄웁니다. 팔을 올리면 안 되는 상황이라면 `init_position:=false` 로 켭니다.
:::

:::danger[bringup 프로세스에 무작정 ctrl+c 하지 말기]
Bringup 프로세스를 ctrl+c로 종료할 경우 로봇이 현재 상태에서 서서히 관절들의 힘을 풀어버립니다.
팔이 책상 위에 있으면 토크가 풀리며 워크스테이션에 로봇 팔이 직접 충돌하고, 로봇 팔이 책상을 계속 누르는 상태가 됩니다.
때문에 이런 경우에는 **아래 `worker_shutdown`을 반드시 먼저 실행시켜서 로봇 팔을 안전한 위치(책상 아래)로 옮긴 후, ctrl+c로 bringup 프로세스를 종료시켜야합니다.**
:::

`command not found` 가 뜨면 `source ~/.bashrc` 후 다시 실행합니다.

## 6. Outbound · Inbound

```bash title="~/ros2_ws#"
worker_outbound
```

```bash title="~/ros2_ws#"
SG2_ZMQ_SUB_IP=192.168.6.xxx worker_inbound    # 맥북 IP 입력
```

- outbound를 먼저 실행하고 inbound를 실행하세요.
- 로봇 제어 세션은 **한 번에 하나만** 가질 수 있습니다. VR·EEF·Joint·Base·Policy 노트북을 동시에 켜지 말고, 다른 노트북은 `OFF`/`STOP` 한 뒤 시작합니다.

:::tip[Leader(FFW-LG2)를 쓸 때]
LG2는 실행 후 **양손 트리거를 2초 이상** 눌러야 follower가 움직이기 시작합니다. 처음에는 천천히 leader 자세를 따라가다가 가까워지면 빨라집니다.
:::

## 6. Orin 파일 구성

```text title="Orin ~/ai_worker/ (컨테이너 /root/ros2_ws/src/ai_worker/)"
zmq/outbound.py              ← 로봇 → 맥북 관절 (:5560), 카메라 3대 (:5570~5572 camera_outbound에서 받아옴)
zmq/camera_outbound.py       ← 카메라 3대 (:5570 head / :5571 wrist_left / :5572 wrist_right)
zmq/inbound.py               ← 맥북 → 로봇 명령 (:5561)
zmq/fixed_quest_protocol.py  ← 명령 안전 규칙
zmq/freedrive.py             ← 토크 on/off
scripts/worker_aliases.sh    ← worker_* 명령 정의 (~/.bashrc 가 source)
ffw_bringup/launch/ffw_sg2_teleop.launch.py  ← worker_bringup
ffw_bringup/launch/ffw_sg2_ai.launch.py      ← worker_bringup_lg2
```

## 7. 동작 확인

| 확인 항목 | 명령 / 방법 |
| --- | --- |
| 컨트롤러가 모두 active 인가 | `ros2 control list_controllers` |
| 관절 상태가 들어오는가 | `ros2 topic echo /joint_states` |
| 로봇 모델·TF가 정상인가 | RViz2 |
| 카메라 3대가 붙었는가 | `ros2 topic list` 에서 head / wrist_left / wrist_right |

## 자주 겪는 문제

| 증상 | 원인 / 해결 |
| --- | --- |
| TxRxResult There is no status packet 어쩌고 ... | Remote E-STOP의 A 버튼을 누르셨나요? |
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
