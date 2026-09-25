---
sidebar_position: 3
title: 실행
---

# VR Teleoperation 실행

:::info[시작 전 확인]
- [ ] [환경 구축](../3_pipeline/1_setup.md) 완료 — conda 환경 `ri_motion_v5_py312`, 커널 등록
- [ ] 로봇 worker가 최신 버전인가 — inbound 로그에 `arm 120 deg/s, gripper 120 deg/s, home 100.0 deg/s`
- [ ] Quest가 Wi-Fi `AIWORKER1115` 에 연결되어 있고, 맥북도 192.168.6.x 네트워크에 있음
:::

:::note
매 세션 반복하는 절차입니다. 최초 1회 준비는 [Pipeline](../3_pipeline/1_setup.md)과 [개요](./1_overview.md)를 먼저 끝내세요.
:::

## 한 줄 순서

```text title="한 세션의 흐름"
bringup → outbound → inbound → 노트북 실행 → 왼쪽 X (녹화 시작) → 양손 grip으로 teleop
→ X (녹화 끝) → 오른쪽 B → 이어서 다음 데모
```

:::danger[실제 로봇 구동 시 반드시 확인]
- **파괴력 주의**: 로봇의 힘이 매우 강합니다. (로봇 워크스테이션도 구겨질 수 있습니다)
- **인원 통제**: 로봇 작업 반경으로 사람이 지나다니지 않도록 합니다.
- **E-stop**: 비상 정지 버튼을 누를 사람 1명을 반드시 대기시킵니다.
:::

## ① Orin — 터미널 3개

맥북 터미널에서 Orin 컨테이너로 들어갑니다. **터미널마다** 아래를 반복합니다.

```bash title="터미널 1 · 2 · 3 공통 — Orin 접속"
ssh robotis@ffw-SNPR48A1115.local
docker exec -it ai_worker bash
```

컨테이너 안에서 터미널 하나에 하나씩 실행합니다.

```bash title="터미널 1 — bringup"
worker_bringup_teleop
```

```bash title="터미널 2 — 로봇 → 맥북 (관절 + 카메라 3대)"
SG2_FIXED_QUEST=1 worker_outbound_meta
```

```bash title="터미널 3 — 맥북 → 로봇 (명령)"
SG2_FIXED_QUEST=1 SG2_ZMQ_SUB_IP=<맥북 IP> worker_inbound
```

`<맥북 IP>` 는 아래 ②의 노트북 설정 셀이 알려줍니다.

- `worker_bringup_teleop` 은 켤 때 **헤드만** `[0, 0]` 으로 움직이고 팔·리프트·베이스는 그대로 둡니다. (헤드가 범위를 벗어나 있으면 VR 쪽에서 로봇 상태를 거부하기 때문)
  - 헤드도 그대로: `worker_bringup_teleop init_head:=false`
  - 전부 초기 자세로: `worker_bringup_teleop init_position:=true`
- inbound 시작 로그에 `home 100.0 deg/s` 가 보여야 합니다. (B 버튼 reset pose 속도)

:::warning
`SG2_FIXED_QUEST=1` 과 `SG2_ZMQ_SUB_IP` 를 빼먹으면 로봇이 명령을 받지 못합니다.
`command not found` 가 나오면 `source ~/.bashrc` 후 다시 실행하세요.
:::

## ② 맥북 — 노트북 실행

1. VS Code에서 `VR_teleoperation/real_notebook/real_vr_teleop_record.ipynb` 를 엽니다.
2. 오른쪽 위 커널을 `ri_motion_v5_py312` 로 바꿉니다.
3. Restart 후 첫 셀부터 순서대로 실행합니다.
4. 설정 셀 출력의 IP를 확인합니다. 이 IP로 ①의 터미널 3과 ③의 Quest 주소를 맞춥니다.

   ```
   PC IP: 192.168.6.102 → Quest: https://192.168.6.102:8443/ | Orin: SG2_FIXED_QUEST=1 worker_inbound
   ```

5. 마지막 실행 셀을 실행하면 **MuJoCo 화면 / 컨트롤 창 / SG2 Record 창** 이 뜹니다. **이 셀이 돌아가는 동안에만** Quest 페이지가 열립니다.

:::tip
처음이면 `sim_notebook/sim_vr_teleop.ipynb` 로 로봇 없이 먼저 연습하세요.
:::

## ③ Quest — 페이지 접속

1. Quest 브라우저 주소창에 직접 입력: `https://<맥북 IP>:8443/`
   (기록에 남은 다른 IP를 누르지 마세요. `https://` 와 `:8443` 이 필수입니다.)
2. "연결이 비공개로 설정되어 있지 않습니다" → **고급** → **계속 진행**
3. "Fixed Quest" 페이지 맨 위의 **[Quest에서 XR 시작]** 버튼을 누릅니다.
4. VR 화면에 들어가면 양손 컨트롤러를 듭니다.

## ④ 조작 시작

1. 처음에는 컨트롤 창의 `Mode` 가 **DRY RUN** 입니다. 로봇은 움직이지 않고 MuJoCo 화면에서만 움직입니다.
2. 양손 grip(옆 버튼)을 동시에 잡고 움직여 봅니다.
3. 화면에서 문제가 없으면 `Mode` → **REAL RUN**. 이제 로봇이 실제로 움직입니다.
4. REAL RUN으로 바꾼 뒤에는 양손 grip을 **한 번 놓았다가 다시** 잡습니다.

## 조작법

| 입력 | 동작 |
| --- | --- |
| 양손 grip 누른 채 이동 | 두 팔이 따라 움직임. 한쪽이라도 놓으면 양팔 정지 |
| grip 누른 채 검지 trigger | 그리퍼 열고 닫기 |
| 왼쪽 X | 녹화 시작 / 끝 (누를 때마다 전환) |
| 왼쪽 Y 1초 | 녹화 중이면 버리기, 아니면 마지막 에피소드 삭제 |
| 오른쪽 B 1초 | reset pose: 양손 5cm 위·바깥으로 → 팔 접기 (`worker_shutdown` 4단계) → 초기 자세 (`worker_bringup` 5단계) |
| 오른쪽 A | 기능 없음 |
| Meta(Oculus) 버튼, 왼쪽 메뉴 버튼 | 시스템 전용이라 웹에서 읽을 수 없음. 누르지 말 것 |

### 움직일 때 알아 둘 것

- 잡은 직후에는 속도가 0에서 서서히 올라갑니다. grip을 떼지 말고 계속 잡은 채 천천히 움직이세요.
- grip 한 번에 움직일 수 있는 범위는 **20cm** 입니다. 더 가려면 놓았다가 다시 잡습니다.
- 한 팔만 움직일 때도 **반대쪽 grip은 잡고 있어야** 합니다. 반대 손은 최대한 가만히 둡니다.
- grip을 잡은 뒤 컨트롤러를 **8° 이내**로 기울이는 건 무시됩니다. (가만히 든 손이 살짝 기울어도 로봇 손목이 돌지 않도록) 손목을 돌리려면 그보다 크게 돌리세요.
- 두 팔이 너무 가까워져 멈춰도, 서로 **멀어지는 방향**으로는 계속 움직일 수 있습니다.
- 손이 닿지 않는 곳으로 가면 MuJoCo 화면에 `!! IK FAILED` 와 빨간 구가 뜹니다.
  - **바로 멈추지는 않습니다.** 일시적인 IK 미수렴이면 양팔·그리퍼의 현재 명령을 **최대 1초** 유지하면서 최신 목표로 재시도합니다. 화면에 경과 시간과 재시도 횟수가 표시됩니다.
  - 1초 안에 풀리면 같은 grip 기준에서 그대로 이어집니다. 시간을 넘기거나 grip을 놓거나 피드백에 이상이 생기면 정지합니다.
  - 계속 실패하면 손을 로봇이 닿는 범위로 되돌리고 양손 grip을 놓았다가 다시 잡습니다.
- 잡은 직후 속도는 **3초에 걸쳐** 0에서 설정값까지 올라갑니다 (시작 ramp).

### 추적 손실 모드

컨트롤러의 광학 추적이 끊겼을 때 어떻게 할지 고르는 설정입니다. 실행 창에서 바꿀 수 있고, **양손 grip을 놓은 상태에서만** 전환이 적용됩니다.

| 모드 | 동작 |
| --- | --- |
| **추정 위치 사용** (기본) | 한 손의 광학 추적이 끊겨도 Quest의 추정 위치로 조작을 이어갑니다. 컨트롤러가 아예 사라지면 0.1초 뒤 정지합니다 |
| **정지 0.5초** | 추적 손실 중 현재 명령을 최대 0.5초 유지하고, 그 안에 추적이 돌아오면 같은 grip 기준에서 이어갑니다 |

:::warning[추정 위치는 튈 수 있습니다]
기본 모드의 추정 위치는 추적이 끊기는 순간 **수 cm에서 십수 cm까지 튈 수 있습니다.** 로봇이 물체에 가까이 있을 때 추적이 끊기면 위험할 수 있으니, 정밀 작업 중에는 `정지 0.5초` 쪽이 안전합니다.
:::

두 모드 모두 아래 상황에서는 똑같이 정지합니다.

- 한 프레임에 20cm를 넘는 점프
- grip 해제
- 피드백 · 실행 오류

grip당 20cm 작업범위와 속도·충돌 제한도 두 모드가 같습니다.

### B 버튼 reset pose

- 단계마다 **경로 충돌 검사**를 하고 100°/s로 움직입니다. 경로가 막히면 아무것도 보내지 않고 멈춥니다.
- **예전보다 3배 이상 빠릅니다.** 2026-09-22에 30°/s에서 100°/s로 올라갔으니, 처음에는 DRY RUN에서 궤적을 확인하세요.
- 통신 지연 같은 일시적 문제로 멈추면 그 단계를 자동으로 **2번까지** 다시 시도합니다.
- 헤드는 움직이지 않습니다. (`worker_bringup_teleop` 이 켤 때 이미 `[0, 0]`)
- 도는 동안 컨트롤러 조작은 무시됩니다. 끝나면 양손 grip을 놓았다 다시 잡으면 조작이 재개됩니다.
- 진행 상황은 컨트롤 창의 `버튼:` 줄에 표시됩니다. 처음에는 DRY RUN에서 확인하세요.

## 베이스 이동 (키보드)

팔과 별개로 **스워브 베이스를 키보드로** 움직일 수 있습니다. 다만 VR 텔레옵과 **동시에는 쓸 수 없습니다.**

:::danger[VR 세션 중에는 베이스가 움직이지 않습니다]
로봇의 `inbound.py` 는 `{"base": [vx, vy, wz]}` 를 받아 `/cmd_vel` 로 변환하는데, 이 처리는 **strict 모드(`SG2_FIXED_QUEST=1`)에서 건너뜁니다.** strict 경로는 JSON 게이트만 처리하고 `base` 키를 보기 전에 반환합니다.

VR 텔레옵은 strict로 띄우므로, 같은 세션에서 키보드로 베이스를 움직일 수 없습니다. 베이스를 쓰려면 **inbound를 `SG2_FIXED_QUEST` 없이 다시 띄워야** 합니다.
:::

### 실행 방법

`ri_motion_v5_VR/project/ffw_sg2_vr_teleoperation/real_notebook/real_base_controller_sg2.ipynb` 를 사용합니다.

```text title="명령 경로"
맥북 노트북 ──ZMQ :5561 {"base":[vx,vy,wz]}──▶ Orin inbound.py ──▶ /cmd_vel ──▶ swerve_drive_controller
```

팔 명령과 **같은 포트 `:5561`** 을 씁니다. 베이스 전용 채널은 없습니다.

```bash title="Orin 준비 — strict 없이"
worker_bringup_teleop                       # 리더 없이 follower 만
SG2_ZMQ_SUB_IP=<맥북 IP> worker_inbound      # SG2_FIXED_QUEST 를 주지 않습니다
```

노트북에서 `Robot command` 를 `ON` 으로 바꾸고 **MuJoCo 창을 클릭해 포커스를 준 뒤** 키를 누릅니다.

| 키 | 동작 |
| --- | --- |
| `W` / `S` | 전진 / 후진 |
| `A` / `D` | 좌 / 우 |
| `Q` / `E` | 좌회전 / 우회전 |
| `SPACE` | 즉시 정지 |

| 속도 | 직진 | 회전 |
| --- | --- | --- |
| `SLOW` | 0.09 m/s | 0.18 rad/s |
| `NORMAL` | 0.18 m/s | 0.36 rad/s |
| `FAST` | 0.3 m/s | 0.6 rad/s |

### 안전 장치

- `Robot command` 가 `ON` 일 때만 전송됩니다. `OFF` 로 바꾸거나 셀을 끝내면 0을 보내고 멈춥니다.
- 창이 포커스를 잃으면 키 입력이 끊겨 정지합니다.
- 명령이 **1초** 끊기면 로봇이 스스로 멈춥니다 (`swerve_drive_controller` 의 `cmd_vel_timeout`).
- `inbound.py` 가 `0.3 m/s` · `0.6 rad/s` 로 한 번 더 제한합니다.
- 화면의 로봇 위치는 **보낸 명령을 적분한 값(open loop)** 이라 실제 위치와 다를 수 있습니다.
- 처음에는 주변을 비우고 `Speed = SLOW` 로 시작하세요.

## 컨트롤 창 주요 항목

| 항목 | 설명 |
| --- | --- |
| `Mode` | DRY RUN(화면만) / REAL RUN(로봇) |
| `Run → STOP` | 텔레옵 종료 |
| 팔 속도 상한 | 10~120 °/s (시작값 60). 실행 중 입력하면 적용 |
| 그리퍼 속도 상한 | 팔과 별개. 현재 bridge 기준 10~120 °/s (구 bridge는 60 °/s 제한) |
| 전후 X / 좌우 Y / 상하 Z | 이동 배율 (0.05~3.0, 기본 0.5 = 컨트롤러 10cm → 로봇 5cm). 양손 grip을 놓고 적용 |
| `Initial pose` | 이번 실행에서 처음 측정한 관절 자세로 10°/s 복귀. worker를 재시작해도 이 목표는 바뀌지 않음 |
| `Cancel return` | 복귀 중단 |

#### Initial pose 복귀 경로

누르는 순간 복귀 **전체 경로**를 관절 제한과 5mm 충돌 검사로 확인하고, 확인된 경로 위로만 명령을 보냅니다. 직선 경로가 막히면 아래 순서로 단계 경로를 찾습니다.

1. J3 · J5 먼저 풀기
2. 전완 · 손목 먼저 풀기
3. 오른팔 먼저
4. 왼팔 먼저

모든 경로가 막히면 **아무 명령도 보내지 않습니다.** 이때는 VR 조작으로 팔 사이를 벌린 뒤 다시 누르세요. 중간에 멈춘 복귀도 다시 누르면 현재 자세에서 새로 검사합니다.

## 세션 종료

1. 오른쪽 **B 1초** (초기 자세로 정리) → 컨트롤 창 `Run → STOP`
2. 맥북: 셀이 끝나면 녹화 중이던 것은 자동 저장됩니다.
3. Orin 터미널 3개: 각각 `Ctrl+C` (**inbound → outbound → bringup** 순)
4. 팔을 접어 두려면 Orin에서 `worker_shutdown`

전원까지 내리는 절차는 [AI WORKER 로봇 종료](../3_pipeline/3_robot-exit.md)를 참고하세요.

## 관련 문서

- [개요](./1_overview.md)
- [녹화와 데이터](./4_recording.md)
- [문제 해결](./5_troubleshooting.md)
