---
sidebar_position: 4
title: 프리드라이브
---

# 프리드라이브 (토크 끄고 손으로 움직이기)

:::info[시작 전 확인]
- [ ] [로봇 구동](./2_robot-start.md) 완료 — bringup이 떠 있어야 토크 서비스가 있습니다
- [ ] 제어 노트북(VR · 마커 · 베이스 · 정책)을 모두 `OFF`/`STOP` 했는가
- [ ] 로봇을 붙잡아 줄 사람 1명, E-stop 담당 1명
:::

로봇의 DYNAMIXEL 토크를 끄고 **손으로 직접 자세를 옮기는** 방법입니다. 원하는 자세를 잡거나, 정책 추론용 [safety box](../6_policy-inference/policy-inference.md#safety-box) 경계를 잴 때 씁니다.

:::danger[팔만 풀리는 게 아닙니다]
토크 서비스는 follower 하드웨어 전체에 대한 **스위치 하나**입니다. `off` 를 하면 아래가 **한꺼번에** 풀립니다.

- 양팔, 양쪽 그리퍼
- **리프트**
- 헤드
- 베이스 조향 관절

관절별로 따로 끄는 기능은 없습니다. `off` 를 실행하기 전에 **팔과 리프트를 손으로 받치고** 있어야 합니다.
:::

## 토크 끄기 · 켜기

`freedrive.py` 는 로봇의 `/dynamixel_hardware_interface/set_dxl_torque` 서비스를 호출하는 스크립트입니다. Orin 컨테이너에서 실행합니다.

```bash title="Orin 컨테이너"
python3 /root/ros2_ws/src/ai_worker/zmq/freedrive.py off   # 토크 해제 → 손으로 움직일 수 있음
python3 /root/ros2_ws/src/ai_worker/zmq/freedrive.py on    # 토크 다시 켜기 → 자세 고정
```

성공하면 `set_dxl_torque(False) -> success=True` 처럼 결과가 로그에 찍힙니다. `off` 를 실행하면 모든 관절이 풀린다는 경고가 먼저 나옵니다.

:::warning[토크를 다시 켤 때]
`on` 도 로봇을 움직일 수 있는 명령이라고 생각하고, 주변을 비운 뒤 E-stop 담당이 대기한 상태에서 실행합니다.
토크를 켠 뒤 노트북을 다시 쓸 때는 `Robot ON` 을 새로 눌러 **현재 실측 자세로 다시 동기화**합니다.
:::

## 손목 위치 읽기 (live FK monitor)

프리드라이브로 팔을 옮기면서 손목 끝 위치를 실시간으로 볼 수 있습니다. 맥북에서 실행하며, 로봇 상태(:5560)를 **읽기만** 하고 명령은 보내지 않습니다.

```bash title="맥북 — VAI_AIWORKER/VR_teleoperation 에서"
conda activate ri_motion_v5_py312
python scripts/live_fk_monitor.py --robot-ip 192.168.6.2
python scripts/live_fk_monitor.py --robot-ip 192.168.6.2 --rate 10   # 출력 주기 변경
```

- Orin에서 outbound(`SG2_FIXED_QUEST=1 worker_outbound`)가 떠 있어야 합니다.
- 양손 손목 끝의 x / y / z 가 로봇 base 좌표(m)로 계속 출력됩니다. 기록하고 싶은 자세에서 값을 그대로 읽으면 됩니다.
- 이 좌표는 정책 추론의 safety box가 검사하는 점과 **같은 점**입니다. 그리퍼를 바꿨다면 경계를 다시 재야 합니다.

## 자주 겪는 문제

| 증상 | 원인 / 해결 |
| --- | --- |
| `Service ... not available after 5.0s` | bringup이 떠 있지 않음. [로봇 구동](./2_robot-start.md)부터 |
| `Service call timed out` | 컨트롤러 스택이 응답하지 않음. bringup 로그 확인 후 다시 실행 |
| `off` 했는데 팔이 뻣뻣함 | 서비스 호출이 실패함. 로그의 `success=` · `message=` 값 확인 |
| live FK monitor에 값이 안 나옴 | outbound가 꺼져 있음. `SG2_FIXED_QUEST=1 worker_outbound` 실행 |

## 관련 문서

- [로봇 구동](./2_robot-start.md)
- [로봇 종료](./3_robot-exit.md)
- [Policy Inference — safety box](../6_policy-inference/policy-inference.md#safety-box)
