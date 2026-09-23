---
sidebar_position: 1
title: 환경 구축
---

# 환경 구축

:::note
**처음 한 번만** 하는 준비입니다. Interactive Marker와 VR Teleoperation 양쪽에 공통으로 필요합니다.
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

## 2. 맥북 → Orin SSH / Docker 접속

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

## 3. 저장소 받기

```bash
git clone https://github.com/jaehoondata/VAI_AIWORKER
```

## 4. conda 가상환경과 커널

두 파이프라인 모두 `ri_motion_v5_env` 환경 하나를 씁니다. **필요한 설치 내용이 다르니** 쓰려는 쪽에 맞춰 설치하세요.

```bash title="공통 — 환경 생성"
conda create -n ri_motion_v5_env python=3.10 pip
conda activate ri_motion_v5_env
```

### VR Teleoperation을 쓸 경우

`VR_teleoperation/` 폴더는 `vendor/` 사본을 `sys.path` 앞에 넣어 쓰므로 이것만으로 동작합니다.

```bash title="VR Teleoperation 의존성"
cd VAI_AIWORKER/VR_teleoperation
pip install -r requirements-notebook.txt
```

### Interactive Marker를 쓸 경우

Joint/EEF 컨트롤러 노트북은 `vendor/` 사본이 아니라 **`ri_motion_v5_package` 본체**가 필요합니다.

```bash title="Interactive Marker 의존성"
cd VAI_AIWORKER/ri_motion_v5_VR/ri_motion_v5_package
pip install -r requirements.txt
pip install -e .
```

둘 다 쓴다면 같은 환경에 양쪽을 모두 설치하면 됩니다.

### Jupyter 커널 등록

커널 이름과 표시 이름 모두 `ri_motion_v5_env` 입니다. 노트북들이 이 이름을 기대합니다.

```bash title="Jupyter 커널 등록"
/opt/homebrew/Caskroom/miniforge/base/envs/ri_motion_v5_env/bin/python3 \
  -m ipykernel install --user --name ri_motion_v5_env --display-name ri_motion_v5_env
```

:::warning[macOS scipy 문제]
노트북 첫 셀에서 `ImportError ... _spropack ... __thread_bss` 가 나면 pip으로 설치된 scipy가 macOS와 맞지 않는 경우입니다.

```bash
mamba install -n ri_motion_v5_env -c conda-forge scipy
```
:::

## 5. 커널은 항상 새로 시작

`package/init_project.py` 는 `vendor/` 사본을 `sys.path` 앞에 넣어 모듈 경로를 고정합니다. 이때 **프로젝트 폴더 바깥에서 불러온 모듈이 이미 커널에 올라와 있으면 예외를 던지고 멈춥니다.**

```text title="이 오류가 나면 커널 재시작"
RuntimeError: An earlier project module is already loaded (...).
Restart this notebook's kernel before using VR_teleoperation.
```

다른 프로젝트 노트북을 돌린 커널을 재사용하지 말고, 항상 **Restart 후 첫 셀부터** 순서대로 실행하세요.

## 관련 문서

- [로봇 구동](./2_robot-start.md)
- [로봇 종료](./3_robot-exit.md)
- [AI WORKER 개요](../1_ai-worker/1_overview.md)
