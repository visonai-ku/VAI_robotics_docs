---
sidebar_position: 1
title: 정책 추론 실행
---

# 정책 추론으로 FFW-SG2 자율 구동하기

:::note
VR로 모은 데이터로 학습한 **LeRobot 정책**(ACT 등, 종류 무관)이 카메라·관절 상태를 보고 다음 관절 목표를 예측해 로봇을 움직입니다. Quest 컨트롤러는 필요 없습니다.
내부적으로는 VR 텔레옵과 **같은** MuJoCo 장면·명령 검사(`SG2CommandGuard`)와 REAL 세션(arming · lease · 속도 제한)을 그대로 씁니다.
:::

:::info[시작 전 확인]
- [ ] [환경 구축](../3_pipeline/1_setup.md) 완료 — conda 환경 `ri_motion_v5_py312`
- [ ] 학습된 체크포인트(`pretrained_model` 폴더)가 이 PC에 있음
- [ ] [로봇 구동](../3_pipeline/2_robot-start.md) 완료 — 전원·E-STOP 해제
- [ ] VR·마커·베이스 노트북을 모두 STOP 했음 (제어 세션은 하나만 가질 수 있습니다)
:::

:::danger[실제 로봇 구동 시 반드시 확인]
- **파괴력 주의**: 로봇의 힘이 매우 강합니다. 정책은 사람이 조작하지 않으므로 예상과 다른 동작을 할 수 있습니다.
- **인원 통제**: 로봇 작업 반경으로 사람이 지나다니지 않도록 합니다.
- **E-stop**: 비상 정지 버튼을 누를 사람 1명을 반드시 대기시킵니다.
:::

## 1. 체크포인트 사전 점검 (로봇 없이)

로봇을 켜기 전에 체크포인트가 제대로 불러와지는지 확인합니다. 합성 입력으로 한 번 예측해 보는 스모크 테스트라 로봇·카메라·데이터셋이 필요 없습니다.

```bash title="맥북 — VAI_AIWORKER/VR_teleoperation 에서"
conda activate ri_motion_v5_py312
python scripts/check_policy_inference.py <checkpoint_path>
python scripts/check_policy_inference.py <checkpoint_path> --device cpu   # 장치 지정
```

`PASS` 가 뜨고 관절별 예측값이 유한한 값(finite)으로 나오면 다음으로 넘어갑니다. 여기서 오류가 나면 체크포인트 경로, LeRobot 버전, device부터 확인합니다.

:::warning
이 검사는 **추론 경로가 연결됐는지**만 봅니다. 가짜 입력에서 그럴듯한 값이 나왔다고 실제 장면에서 정책이 안전하게 움직인다는 뜻은 아닙니다.
:::

## 2. Orin — 터미널 3개

VR Teleoperation과 같은 worker를 씁니다. 정책 입력 카메라도 `worker_outbound` 가 함께 보냅니다.

```bash title="터미널 1 — bringup (초기 자세 이동이 끝날 때까지 대기)"
worker_bringup
```

```bash title="터미널 2 — 로봇 → 맥북 (관절 + 카메라)"
worker_outbound
```

```bash title="터미널 3 — 맥북 → 로봇 (명령)"
SG2_ZMQ_SUB_IP=<맥북 IP> worker_inbound
```

## 3. 노트북 설정

`VR_teleoperation/real_notebook/real_policy_inference.ipynb` 를 커널 `ri_motion_v5_py312` 로 열고, 새 커널에서 첫 셀부터 실행합니다.

설정 셀의 값은 **체크포인트를 학습한 조건에 맞춰야** 합니다. 아래 기본값은 현재 쓰고 있는 체크포인트(arm + gripper 16관절, 손목 카메라 2대로 학습) 기준입니다.

| 항목 | 기본값 | 의미 |
| --- | --- | --- |
| `CHECKPOINT_PATH` | 환경 변수 `SG2_POLICY_CHECKPOINT`, 없으면 노트북에 적힌 경로 | 체크포인트의 `pretrained_model` 폴더. 적힌 기본 경로는 학습 PC(Ubuntu) 경로이니 **본인 PC 경로로 바꿉니다** |
| `EXCLUDED_JOINTS` | `lift_joint`, `head_joint1`, `head_joint2` | 정책이 다루지 않는 관절. 현재 측정값에서 그대로 유지 |
| `CAMERAS` | `wrist_left: 5571`, `wrist_right: 5572` | 정책 입력 카메라. 현재 체크포인트는 head 카메라를 쓰지 않음 |
| `HZ` | `30` | 녹화할 때의 fps와 **같아야** 함. 다르면 정책이 학습 때와 다른 속도로 관측을 받음 |
| `TASK` | `"pick_and_place"` | 학습 데이터셋을 녹화할 때 쓴 task 문구와 맞춤 |
| `DEVICE` | `None` | `None` 이면 체크포인트에 저장된 장치를 씀. **맥에서는 `"mps"` 또는 `"cpu"` 로 지정** |
| `DRY_RUN` | `True` | **반드시 `True` 로 시작.** 로봇에 명령을 보내지 않고 arming까지의 흐름과 예측값만 확인 |
| `DURATION_S` | `300` | 실행 시간 제한(초). 아래 두 실행 방식에서 뜻이 다름. `None` 이면 제한 없음 |
| `COLLISION_MARGIN_M` | `0.0005` | 자기충돌 여유값(m). [아래](#자기충돌-검사) 참고 |

다음 셀(로봇 세션 준비)이 체크포인트를 불러오고 로봇 상태(:5560)·카메라 ZMQ 소켓을 엽니다. 아직 로봇에 명령을 보내지는 않습니다. 출력의 `policy type`, `device`, `dry_run` 값을 확인합니다.

## 4. 실행 — 두 방식 중 하나

### A. 연속 실행

`deploy.run(duration_s=DURATION_S)` 셀을 실행합니다. 셀이 끝날 때까지 블로킹됩니다.

매 틱마다 아래 순서로 처리합니다.

```text title="한 틱의 처리"
로봇 상태·카메라 읽기 → 정책 예측 → 관절 범위로 clip → 손목 safety box 검사 → 명령 전송
```

- 로봇 피드백이나 카메라가 아직 안 들어왔으면 움직이지 않고 기다립니다 (`WAIT_ROBOT` 등).
- 처음 움직일 때 arming(세션 생성 → 로봇 bridge ACK 대기)이 자동으로 일어납니다.
- 예측한 관절 목표로 손목이 [safety box](#safety-box) 밖으로 나가면 **그 스텝은 보내지 않고 현재 자세를 유지**합니다. 셀 출력에 `safety box violation, holding position` 이 찍힙니다.
- 충돌·관절 범위·추종 오차 등 어떤 이유로든 `FAULT` 가 나면 루프가 자동으로 멈추고 세션을 반납합니다.
- `DURATION_S` 는 **총 실행 시간**입니다 (기본 5분).
- `Ctrl-C`(커널 인터럽트)로 언제든 중단할 수 있고, 중단해도 세션을 반납합니다.

### B. 키보드로 에피소드 단위 녹화 + 추론

정책 롤아웃을 에피소드 단위로 기록하고 싶을 때는 A 대신 이 셀을 씁니다. 이 방식에서는 **`x` 를 누르기 전까지 정책이 로봇을 움직이지 않습니다.**

셀을 실행하면 `SG2 Policy Recording` 창이 뜹니다. **창을 클릭해 포커스를 준 뒤** 키를 누릅니다. 창에는 녹화 중인 에피소드 번호, 저장한 개수, 정책이 도는 중인지와 함께 정책이 보는 카메라 영상이 실시간으로 나옵니다.

| 키 | 동작 |
| --- | --- |
| `x` | 에피소드 시작: 녹화 시작 + 정책 상태 초기화 + 정책 구동. 다시 누르면 녹화 저장 + 정책 정지 (다음 `x` 까지 로봇은 멈춤) |
| `y` | 녹화 중이면 에피소드를 버리고 정책도 정지. 아니면 마지막 저장분에 폐기 표시 (다시 누르면 해제) |
| `a` | Initial pose로 복귀 (경로 검사 후) |
| `q` / `Esc` | 세션 종료 |

- 기록은 `~/aiworker_data/eval_<TASK>/` 에 LeRobot 데이터셋으로 저장됩니다. 에피소드당 최대 120초입니다.
- 이름 앞의 `eval_` 은 **학습 데이터가 아니라 정책 롤아웃**이라는 표시입니다. 이 데이터를 학습 데이터에 그대로 섞지 마세요.
- 이 방식에서 `DURATION_S` 는 **조작이 없는 시간** 제한입니다. 녹화 중이 아니고 5분 동안 키 입력이 없으면 세션이 끝납니다. 키를 누르면 다시 5분부터 셉니다.
- 창을 띄울 수 없는 환경에서는 셀 출력에 상태만 나오고 키 조작은 할 수 없습니다. 이때는 `Ctrl-C` 로만 멈춥니다.

## 5. 정리

마지막 셀의 `deploy.close()` 가 카메라 소켓까지 닫습니다. 다시 실행하려면 로봇 세션 준비 셀부터 다시 실행해 `PolicyDeployment` 를 새로 만듭니다.

셀이 멈춘 것처럼 보이거나 즉시 멈춰야 할 때는 커널 인터럽트(정지 버튼)를 누르고, 로봇이 이상하게 움직이면 **E-stop**을 누릅니다.

## Safety box

정책은 관절 각도를 직접 예측하므로, 예측값으로 FK를 계산해 **손목 끝 위치가 아래 범위 안에 있는지** 검사합니다. 범위를 벗어나는 스텝은 로봇에 보내지 않습니다. VR 텔레옵에는 적용되지 않습니다.

| 손 | x (전후) | y (좌우) | z (높이) |
| --- | --- | --- | --- |
| 왼손 | ≥ −0.30 m | ≤ 0.59 m | ≥ 0.95 m |
| 오른손 | ≥ −0.30 m | ≥ −0.59 m | ≥ 0.95 m |

- 좌표는 로봇 base 기준이며, 표에 없는 방향은 제한하지 않습니다. 값은 `VR_teleoperation/package/safety_box.py` 에 있습니다.
- 경계는 [프리드라이브](../3_pipeline/4_freedrive.md)로 팔을 옮기면서 live FK monitor로 손목 위치를 읽어 정했습니다. **그리퍼를 바꾸면 손목 끝 위치가 달라지므로 다시 재야** 합니다.
- 로봇 없이 확인하려면 SIM 도구를 씁니다. 손목 기즈모를 끌면 같은 검사 함수가 돌고, 범위를 벗어나면 팔이 마지막 허용 자세에 멈춰 있습니다.

  ```bash title="맥북 — VAI_AIWORKER/VR_teleoperation 에서"
  python scripts/check_safety_box_inference.py
  ```

## 자기충돌 검사

정책 추론에서는 텔레옵과 달리 자기충돌 검사가 **항상 켜져** 있습니다. 다만 이미 모은 데이터(양손을 가까이 붙이는 동작 등)가 막히지 않도록 여유값을 `COLLISION_MARGIN_M = 0.0005` (0.5 mm)로 낮춰 두었습니다. 임시 설정이니 실제로 부딪히는 일이 생기면 값을 올리세요.

## 자주 겪는 문제

| 증상 | 원인 / 해결 |
| --- | --- |
| `check_policy_inference.py` 에서 오류 | 체크포인트 경로(`pretrained_model` 폴더인지), LeRobot 버전(0.6.1), `--device` 확인 |
| 세션 준비 셀에서 장치 오류 | 체크포인트에 `cuda` 가 저장되어 있음. 맥에서는 `DEVICE = "mps"` 또는 `"cpu"` |
| 로봇이 움직이지 않고 `WAIT_ROBOT` 등에 머묾 | 피드백·카메라가 안 들어옴. outbound가 떠 있는지, `CAMERAS` 포트가 맞는지 확인 |
| 셀 출력에 `safety box violation, holding position` | 예측한 자세가 safety box 밖. 정상 보호 동작. 계속 나오면 시작 자세나 정책을 점검 |
| `FAULT` 로 멈춤 | 충돌·관절 범위·추종 오차 등. 셀 출력의 `reason` 확인 후 세션 준비 셀부터 다시 |
| 키를 눌러도 반응 없음 (B 방식) | `SG2 Policy Recording` 창에 포커스가 없음. 창을 클릭한 뒤 누름 |
| 제어 세션을 얻지 못함 | VR·마커·베이스 노트북이 켜져 있음. 모두 STOP 후 다시 |

## 관련 문서

- [녹화와 데이터](../5_vr-teleoperation/4_recording.md) — 학습 데이터 수집과 검수
- [프리드라이브](../3_pipeline/4_freedrive.md) — safety box 경계 측정
- [로봇 구동](../3_pipeline/2_robot-start.md)
- [로봇 종료](../3_pipeline/3_robot-exit.md)
