---
sidebar_position: 1
title: Interactive Marker로 조작하기
---

# Interactive Marker로 FFW-SG2 조작하기

:::note
VR 없이 **마우스로 마커를 끌어서** FFW-SG2의 팔을 움직이는 방법입니다.
동작 확인, 자세 잡기, IK 테스트처럼 정밀하게 한 번씩 움직여 볼 때 사용합니다.
연속 조작과 데이터 수집은 [VR Teleoperation](../5_vr-teleoperation/1_overview.md)을 쓰세요.
:::

:::info[시작 전 확인]
- [ ] [환경 구축](../3_pipeline/1_setup.md) 완료 — conda 환경 `ri_motion_v5_py312` + **Xcode Command Line Tools** (IK 모듈 빌드용)
- [ ] [로봇 구동](../3_pipeline/2_robot-start.md) 완료 — 전원·E-STOP 해제 후 `worker_bringup`
- [ ] Orin 컨테이너 접속 상태 (`docker exec -it ai_worker bash`)
:::

:::danger[실제 로봇 구동 시 반드시 확인]
- **파괴력 주의**: 로봇의 힘이 매우 강합니다. (로봇 워크스테이션도 구겨질 수 있습니다)
- **인원 통제**: 로봇 작업 반경으로 사람이 지나다니지 않도록 합니다.
- **E-stop**: 비상 정지 버튼을 누를 사람 1명을 반드시 대기시킵니다.
:::

## ROS 노드 실행

Orin 컨테이너에서 터미널 3개를 씁니다.

```bash title="터미널 1 — bringup (완료될 때까지 대기)"
worker_bringup
```

```bash title="터미널 2 — 로봇 → 맥북 (현재 state)"
worker_outbound
```

```bash title="터미널 3 — 맥북 → 로봇 (목표 state)"
SG2_ZMQ_SUB_IP=<맥북 IP> worker_inbound
```

:::warning[VR과 같은 JSON worker를 씁니다]
Joint/EEF 노트북도 VR Teleoperation과 같은 **strict JSON worker**로 통신합니다. JSON이 기본값이라 별도 환경 변수 없이 띄우면 됩니다.
**`SG2_FIXED_QUEST=0` 이 설정돼 있으면 동작하지 않습니다.** (예전 pickle 방식)

로봇 제어 세션은 한 번에 하나만 가질 수 있으니, VR·베이스·정책 노트북은 먼저 `STOP`/`OFF` 하세요.
:::

:::tip[실행 순서]
`worker_outbound` 를 먼저 띄우고 시뮬레이션에서 정상 동작을 확인한 뒤 `worker_inbound` 를 실행합니다.
실행 전에 각 파일의 IP·포트가 현재 접속 환경과 같은지 확인하세요.
:::

## IP 설정

맥북 IP는 DHCP라 바뀝니다. inbound를 띄울 때 `SG2_ZMQ_SUB_IP` 로 현재 맥북 IP를 넘깁니다 (위 터미널 3).

맥북 IP는 노트북의 통신 설정 셀(셀 3)이 `PUB_TO_SG2_IP` 로 출력합니다. IP가 바뀌면 inbound를 새 값으로 다시 띄웁니다.

## 노트북 실행

Jupyter 커널을 **`ri_motion_v5_py312`** 로 선택하고, 새 커널에서 첫 셀부터 실행합니다.

노트북 파일은 `ri_motion_v5_VR/project/ffw_sg2_vr_teleoperation/` 아래에 있습니다. 위치는 그대로지만, 코드·로봇 모델·worker 통신은 VR Teleoperation과 같은 `VR_teleoperation/` 공통 런타임을 불러 씁니다.

셀 2가 C++ IK·충돌 거리 모듈을 현재 Python에 맞게 빌드합니다. 처음 실행할 때는 시간이 걸리고, 빌드에 실패하면 예외를 내고 멈춥니다 (Xcode Command Line Tools 확인).

| 노트북 | 조작 단위 |
| --- | --- |
| `real_notebook/real_joint_controller_sg2_teleop.ipynb` | **Joint controller** — 관절마다 기즈모가 붙고, 끌면 그 관절의 qpos를 그대로 씁니다. IK를 풀지 않습니다 |
| `real_notebook/real_eef_controller_sg2_teleop.ipynb` | **EEF controller** — 좌/우 손목 기즈모를 끌면 두 목표를 충돌 인식 IK로 함께 풀어 명령합니다 |

### Joint controller 사용법

기즈모는 힌지 관절에는 축을 감싸는 **링**, `lift_joint` 에는 슬라이드를 따라가는 **화살표**로 붙습니다. 색은 그룹별로 arm_l 파랑 · arm_r 주황 · lift/head/gripper 초록입니다.

1. **셀 5** 가 로봇의 현재 관절 상태를 받아 시뮬 자세를 맞춥니다. 마커는 다음 셀에서 이 자세 위에 생기므로 **이 셀이 먼저 성공해야 합니다.**
2. `Robot` 은 `OFF` 로 시작합니다. 마커가 예상한 자리에 있는 것을 확인한 뒤에만 `ON` 으로 바꿉니다.
3. `ON` 으로 바꾸면 마커·슬라이더를 **현재 실측 자세로 다시 동기화**하고, 로봇 bridge의 ACK를 기다립니다(`ARMING`). ARMING이 끝난 뒤에 조작합니다.
4. `OFF` 로 바꾸면 명령 세션과 5561 포트를 반납합니다. 오류가 나면 `OFF` → `ON` 으로 다시 시작합니다.

:::warning[속도 제한과 Preset 주의]
- 모든 명령은 **힌지 60°/s, 리프트 0.05 m/s** 로 램프됩니다. 마커를 끄는 동작은 이 한계에 닿지 않지만, `Preset` 이나 `File` 로드는 램프가 없으면 팔 전체가 한 번에 휘두르는 동작이 됩니다. 램프가 도는 동안 화면에 `RATE LIMITED` 가 표시되고, MuJoCo는 마커가 아니라 **실제로 보낸 명령**을 보여줍니다.
- `Preset` 에는 `zero` 가 없습니다. 접힌 팔을 전부 0으로 펴는 동작은 `ffw_sg2_follower_initial_positions.yaml` 이 일부러 두 단계로 나눠 피하는 경로이기 때문입니다. `init` 이 그 yaml의 최종 자세이고, `sync` 는 마커를 현재 자세에 다시 붙이는 기능입니다.
:::

:::danger[`Robot` 을 `ON` 으로 바꾸는 순간부터]
E-stop을 누를 사람을 반드시 옆에 두세요.
:::

### EEF controller 사용법

1. 기즈모 두 개(손목마다 하나)를 마우스로 끌어 좌/우 팔 목표를 옮깁니다.
2. 기즈모를 **Shift+클릭** 하면 회전 모드로 바뀝니다.
3. 두 손목 목표는 **하나의 충돌 인식 IK** 로 함께 풀려 로봇에 전달됩니다.
4. `Robot command` 는 `OFF` 로 시작합니다. 기즈모가 손목 위에 정확히 올라온 뒤 `ON` 으로 바꿉니다. `ON` 은 Joint controller와 마찬가지로 현재 실측 자세로 동기화한 뒤 ACK를 기다리고(`ARMING`), 오류 뒤에는 `OFF` → `ON` 으로 다시 시작합니다.
   - EEF controller는 **팔·그리퍼만** 제어합니다. 헤드와 리프트는 `ON` 할 때의 측정 자세를 그대로 유지합니다.
5. `Marker` → `RESET` 을 누르면 기즈모가 현재 SG2 손목 위치로 되돌아간 뒤 `TRACK` 으로 복귀합니다.
6. 그리퍼는 별도 슬라이더로 여닫습니다.

:::tip[먼저 시뮬레이션에서]
실제 로봇을 움직이기 전에 같은 폴더의 `sim_notebook/sim_joint_controller_sg2_teleop.ipynb` · `sim_notebook/sim_eef_controller_sg2_teleop.ipynb` 로 동작을 확인하세요. MuJoCo 화면에서 마커를 끌어 팔이 의도대로 움직이는지 먼저 봅니다.
:::

## 종료

현재 `worker_shutdown` 은 버그 수정 전이라 팔이 **책상 위 영역**에 있을 때만 씁니다. 팔이 책상 아래에 있다면 `worker_shutdown` 없이 **inbound → outbound → bringup** 순으로 `Ctrl+C` 합니다. bringup을 끄면 토크가 풀려 팔이 아래로 떨어지니 팔 아래를 비워 두세요.

```bash
worker_shutdown
```

`completed` 로그를 확인한 뒤, inbound가 아직 떠 있으면 `Ctrl+C` 로 끄고 **outbound → bringup** 순으로 종료합니다. 자세한 절차는 [로봇 종료](../3_pipeline/3_robot-exit.md)를 참고하세요.

## 자주 겪는 문제

| 증상 | 원인 / 해결 |
| --- | --- |
| 마커를 끌어도 로봇이 안 움직임 | `ARMING` 이 끝나지 않았거나 다른 노트북이 제어 세션을 쥐고 있음. 다른 노트북 STOP 후 `OFF` → `ON` |
| `invalid_json_feedback` · `protocol_mismatch_legacy_pickle` | worker가 pickle 모드(`SG2_FIXED_QUEST=0`)로 떠 있음. `echo $SG2_FIXED_QUEST` 가 `0` 이면 `unset SG2_FIXED_QUEST` 후 두 worker를 다시 띄움 |
| 목표를 줘도 팔이 반응 없음 | inbound의 `SG2_ZMQ_SUB_IP` 가 현재 맥북 IP와 다름 |
| 셀 2에서 빌드 오류 | 컴파일러 없음. `xcode-select --install` 후 커널 재시작 |
| 관절에 힘이 없음 | torque-off 상태. Remote E-STOP **A 버튼** |
| 마커가 로봇 자세와 어긋나 있음 | `Robot` 을 `OFF` → `ON` 으로 바꾸면 실측 자세로 다시 동기화됨 |
| `RATE LIMITED` 가 계속 떠 있음 | `Preset`·`File` 로 큰 목표가 들어가 램프가 도는 중. 끝날 때까지 기다리거나 `sync` 로 마커를 현재 자세에 다시 붙임 |
| `PUB_TO_SG2_IP` 를 맞췄는데도 반응 없음 | inbound를 띄울 때 넘긴 `SG2_ZMQ_SUB_IP` 와 값이 같은지, 바꾼 뒤 inbound를 재시작했는지 확인 |
| 로봇이 흔들림 | VR 파이프라인이나 LG2 리더가 동시에 켜져 있음. 하나만 남기기 |

:::note[TODO]
원본 노트에 있던 뷰어 스크린샷이 아직 옮겨지지 않았습니다. `static/img/` 에 이미지를 추가하고 `![설명](/img/파일명.png)` 으로 연결해 주세요.
:::

## 관련 문서

- [AI WORKER 로봇 구동](../3_pipeline/2_robot-start.md)
- [VR Teleoperation 개요](../5_vr-teleoperation/1_overview.md)
