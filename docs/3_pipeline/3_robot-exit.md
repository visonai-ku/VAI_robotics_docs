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
자세 정리 → worker_shutdown → inbound → outbound → bringup 순 Ctrl+C → 전원 OFF
```

1. **자세 정리** — 팔이 펼쳐진 상태라면 먼저 안전한 자세로 모읍니다. VR 세션 중이라면 오른쪽 컨트롤러 **B 버튼 1초**로 초기 자세로 돌립니다.
2. **팔 접기** — Orin 컨테이너에서 `worker_shutdown` 을 실행합니다.

   ```bash title="Orin 컨테이너"
   worker_shutdown
   ```

   `completed` 로그가 뜰 때까지 기다립니다.
3. **노드 종료** — 실행 중인 터미널을 **inbound → outbound → bringup** 순서로 `Ctrl+C` 합니다.
4. **전원 OFF** — `Power Button` 으로 전원을 내리고, `Key Switch` 를 원위치로 돌려 뽑습니다.
5. **충전** — 다음 사용을 위해 `Charge Port` 에 충전기를 연결합니다.

:::warning[순서를 지키세요]
명령을 받는 쪽(inbound)을 먼저 끊어야 bringup이 내려갈 때 로봇이 어중간한 명령을 받지 않습니다.
`worker_shutdown` 은 inbound를 먼저 끈 뒤에 실행합니다.
:::

## 비상 정지

작동 중 이상이 생기면 Remote E-STOP의 **빨간 버섯 버튼**을 누릅니다.

- 다시 쓰려면 버튼을 시계 방향으로 돌려 풀고 **A 버튼**을 눌러 토크를 켭니다.
- E-STOP 후에는 [bringup](./2_robot-start.md)부터 다시 시작하는 편이 안전합니다.

## 종료 체크리스트

- [ ] 팔이 안전한 자세로 접혔는가 (`worker_shutdown` completed 로그 확인)
- [ ] inbound → outbound → bringup 순으로 노드를 종료했는가
- [ ] 로봇 주변에 사람이 없는 상태에서 전원을 내렸는가
- [ ] `Key Switch` 를 뽑아 두었는가
- [ ] 충전기를 연결했는가

## 자주 겪는 문제

| 증상 | 원인 / 해결 |
| --- | --- |
| `worker_shutdown` 이 중간에 멈춤 | 접는 경로가 막힘. 팔 사이 간격을 벌린 뒤 다시 실행 |
| 노드를 껐는데 로봇이 아직 명령을 받는 것 같음 | inbound가 아직 떠 있음. 해당 터미널에서 `Ctrl+C` |
| 전원이 안 꺼짐 | `Power Button` 을 3초 이상 길게 누름. 그래도 안 되면 `Key Switch` 를 원위치 |

## 관련 문서

- [로봇 구동](./2_robot-start.md)
- [환경 구축](./1_setup.md)
