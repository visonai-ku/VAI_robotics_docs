---
sidebar_position: 3
title: 로봇 종료
---

# 로봇 종료

:::info[시작 전 확인]
- [ ] 제어 세션을 먼저 끝냈는가 — [VR 세션 종료](../5_vr-teleoperation/3_run.md), 마커·베이스 노트북 `Robot` `OFF`, [정책 추론](../6_policy-inference/policy-inference.md) 셀 종료
- [ ] 팔이 물체를 쥐고 있지 않은가
- [ ] 로봇 주변에 사람이 없는가
:::

로봇을 안전하게 정리하고 전원을 내리는 절차입니다.

## 종료 순서

```text title="종료 순서"
자세 정리 → worker_shutdown → inbound 확인(남아 있으면 Ctrl+C) → outbound → bringup Ctrl+C → 전원 OFF
```

1. **자세 정리** — 팔이 펼쳐진 상태라면 먼저 안전한 자세로 모읍니다. VR 세션 중이라면 오른쪽 컨트롤러 **B 버튼 1초**로 초기 자세로 돌립니다. 이때 두 팔이 **책상 위 영역**에 있어야 다음 단계를 진행할 수 있습니다. 팔이 책상 아래에 있다면 2~3단계를 건너뛰고 **inbound → outbound → bringup** 순서로 `Ctrl+C` 합니다.
2. **팔 접기** — Orin 컨테이너에서 `worker_shutdown` 을 실행합니다.

   ```bash title="Orin 컨테이너"
   worker_shutdown
   ```

   `completed` 로그가 뜰 때까지 기다립니다.
3. **inbound 확인** — `worker_shutdown` 은 상황에 따라 inbound를 함께 끄기도 하고 그대로 두기도 합니다. inbound 터미널을 보고, 아직 실행 중이면 `Ctrl+C` 로 종료합니다.
4. **노드 종료** — **outbound → bringup** 순서로 `Ctrl+C` 합니다.
5. **전원 OFF** — `Power Button` 으로 전원을 내리고, `Key Switch` 를 원위치로 돌려 뽑습니다.
6. **충전** — 다음 사용을 위해 `Charge Port` 에 충전기를 연결합니다.

:::danger[`worker_shutdown` 은 팔이 책상 위 영역에 있을 때만 실행합니다]
현재 `worker_shutdown` 에는 아직 수정되지 않은 버그가 있어, 팔이 책상 위 영역을 벗어난 상태에서는 안전하게 동작한다고 보장할 수 없습니다. (현재 수정 중, 261001) 팔이 책상 아래에 있을 때는 `worker_shutdown` 을 쓰지 말고 **inbound → outbound → bringup** 순서로 `Ctrl+C` 합니다.

bringup을 끄면 토크가 풀려 **팔이 아래로 떨어집니다.** 팔 아래에 손·물체가 없는지 확인한 뒤 끄세요.
:::

:::warning[순서를 지키세요]
bringup을 먼저 내리면 `worker_shutdown` 이 팔을 움직일 수 없습니다. 팔을 접은 뒤에 **inbound → outbound → bringup** 순서로 내려야 bringup이 내려갈 때 로봇이 어중간한 명령을 받지 않습니다.
:::

## 비상 정지

작동 중 이상이 생기면 Remote E-STOP의 **빨간 버섯 버튼**을 누릅니다.

- 다시 쓰려면 버튼을 시계 방향으로 돌려 풀고 **A 버튼**을 눌러 토크를 켭니다.
- E-STOP 후에는 [bringup](./2_robot-start.md)부터 다시 시작하는 편이 안전합니다.

## 종료 체크리스트

- [ ] `worker_shutdown` 전에 두 팔이 책상 위 영역에 있었는가 (책상 아래였다면 `worker_shutdown` 없이 inbound → outbound → bringup 순으로 종료)
- [ ] 팔이 안전한 자세로 접혔는가 (`worker_shutdown` completed 로그 확인)
- [ ] inbound가 꺼졌는지 확인하고, outbound → bringup 순으로 노드를 종료했는가
- [ ] 로봇 주변에 사람이 없는 상태에서 전원을 내렸는가
- [ ] `Key Switch` 를 뽑아 두었는가
- [ ] 충전기를 연결했는가

## 자주 겪는 문제

| 증상 | 원인 / 해결 |
| --- | --- |
| `worker_shutdown` 이 중간에 멈춤 | 접는 경로가 막힘. 팔 사이 간격을 벌린 뒤 다시 실행 |
| 노드를 껐는데 로봇이 아직 명령을 받는 것 같음 | `worker_shutdown` 뒤에도 inbound가 떠 있음. 해당 터미널에서 `Ctrl+C` |
| 전원이 안 꺼짐 | `Power Button` 을 3초 이상 길게 누름. 그래도 안 되면 `Key Switch` 를 원위치 |

## 관련 문서

- [로봇 구동](./2_robot-start.md)
- [환경 구축](./1_setup.md)
