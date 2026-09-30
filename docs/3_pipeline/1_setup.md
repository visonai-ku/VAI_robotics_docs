---
sidebar_position: 1
title: 환경 구축
---

# 환경 구축

:::note
**처음 한 번만** 하는 준비입니다. Interactive Marker, VR Teleoperation, Policy Inference에 공통으로 필요합니다.
끝나면 [로봇 구동](./2_robot-start.md)으로 넘어가세요.
:::

## 1. 네트워크

Quest·맥북·로봇이 **모두 같은 네트워크(192.168.6.x)** 에 있어야 합니다.

| 장치 | 주소 |
| --- | --- |
| 맥북 | 192.168.6.x (DHCP, 바뀔 수 있음) |
| Orin (로봇) | 192.168.6.2 / `ffw-SNPR48A1115.local` |

- **맥북**: 로봇 네트워크에 유선 또는 무선으로 연결합니다.
- **Quest 3**: Wi-Fi `AIWORKER1115` 연결 (PW: `AIWORKER1115`) — [Meta Quest 3 초기 설정](../2_meta-quest-3/setup.md) 참고. VR Teleoperation을 쓸 때만 필요합니다.

### 1.1. 맥북 → Orin SSH / Docker 접속 설정

`~/.ssh/config` 에 등록해 둡니다.

```text title="~/.ssh/config"
Host ffw-SNPR48A1115.local
    HostName ffw-SNPR48A1115.local
    User robotis
    ForwardX11 yes
```

```bash title="맥북 터미널"
ssh robotis@ffw-SNPR48A1115.local     # System password: root
docker exec -it ai_worker bash
```

비밀번호 없이 접속하려면(선택):

```bash
ssh-copy-id robotis@ffw-SNPR48A1115.local
```

## 2. 저장소 받기

로컬 컴퓨터에 로봇 조종을 위한 코드를 다운받습니다.

```bash
git clone https://github.com/jaehoondata/VAI_AIWORKER
```

## 3. conda 가상환경과 커널

VR Teleoperation, Interactive Marker, 베이스, 정책 추론 노트북은 모두 **Python 3.12 / LeRobot 0.6.1** 환경 `ri_motion_v5_py312` 하나를 씁니다. 예전 `ri_motion_v5_env`(Python 3.10, LeRobot 0.4.4)에서는 녹화와 정책 추론이 동작하지 않습니다.

저장소에 검증된 환경 파일(`environments/ri_motion_v5_py312.macos-arm64.yml`)이 있으니 그대로 복원합니다.

```bash title="VAI_AIWORKER 저장소 루트에서"
conda env create -f environments/ri_motion_v5_py312.macos-arm64.yml
conda activate ri_motion_v5_py312

# LeRobot이 설치한 headless OpenCV를 GUI 버전으로 덮어씁니다 (마지막에 해야 합니다)
python -m pip install --force-reinstall --no-deps opencv-python==4.12.0.88

# Jupyter 커널 등록 — 커널 이름과 표시 이름 모두 ri_motion_v5_py312
python -m ipykernel install --user \
  --name ri_motion_v5_py312 --display-name ri_motion_v5_py312
```

- 같은 환경을 이미 만들어 두었다면 `conda env create` 는 건너뜁니다.
- OpenCV를 다시 설치하지 않으면 녹화·검수 창을 띄울 때 `The function is not implemented` 오류가 납니다.

```bash title="설치 확인"
python -m pip check          # 의존성 충돌이 없어야 합니다
python -c "import cv2; print([l.strip() for l in cv2.getBuildInformation().splitlines() if 'GUI:' in l])"   # COCOA
jupyter kernelspec list      # ri_motion_v5_py312 가 보여야 합니다
```

:::tip[Ubuntu PC]
Ubuntu에서는 저장소 루트의 `bash setup_ubuntu_env.sh` 가 같은 이름의 환경과 커널을 만듭니다.
:::

### Interactive Marker를 쓸 경우 — Xcode Command Line Tools

Joint/EEF 노트북은 준비 셀에서 C++ IK 모듈을 **현재 Python에 맞게 직접 빌드**합니다. 컴파일러가 필요하므로 한 번 설치해 둡니다.

```bash
xcode-select --install
```

별도의 `pip install` 은 필요 없습니다. Joint/EEF/Base 노트북도 VR Teleoperation과 같은 `VR_teleoperation/` 공통 런타임을 불러 씁니다.

## 4. 커널은 항상 새로 시작

모든 노트북이 첫 셀에서 `VR_teleoperation/package/init_project.py` 를 실행합니다. 이 스크립트는 `vendor/` 사본을 `sys.path` 앞에 넣어 모듈 경로를 고정합니다. 이때 **프로젝트 폴더 바깥에서 불러온 모듈이 이미 커널에 올라와 있으면 예외를 던지고 멈춥니다.**

```text title="이 오류가 나면 커널 재시작"
RuntimeError: An earlier project module is already loaded (...).
Restart this notebook's kernel before using VR_teleoperation.
```

다른 프로젝트 노트북을 돌린 커널을 재사용하지 말고, 항상 **Restart 후 첫 셀부터** 순서대로 실행하세요.

## 관련 문서

- [로봇 구동](./2_robot-start.md)
- [로봇 종료](./3_robot-exit.md)
- [AI WORKER 개요](../1_ai-worker/1_overview.md)
