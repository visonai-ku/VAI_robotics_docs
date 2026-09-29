---
sidebar_position: 1
title: Intro
---

# About

고려대학교 Vision & AI Lab Robotics Team의 docs 사이트입니다. <br/> 
초기 환경 설정, 장비 특성, 작동 방식 등 팀원이 반복해서 찾아보게 되는 내용을 여기에 모읍니다.

## Structure

| Section | Contents |
| --- | --- |
| [**AI WORKER**](./1_ai-worker/1_overview.md) | ROBOTIS가 제공하는 FFW-SG2의 하드웨어·소프트웨어 사양을 다룹니다. |
| [**Meta Quest 3**](./2_meta-quest-3/overview.md) | VR teleoperation에 사용하는 Meta Quest 3의 장비 특징과 기본 사용법을 다룹니다. |
| [**Pipeline**](./3_pipeline/1_setup.md) | 모든 조작 방식에 공통으로 필요한 환경 구축, 로봇 구동·종료, 프리드라이브를 다룹니다. |
| [**Interactive Marker**](./4_interactive-marker/interactive-marker.md) | MuJoCo 뷰어의 마커를 끌어 FFW-SG2를 조작하는 Joint / EEF 컨트롤러 사용법을 다룹니다. |
| [**VR Teleoperation**](./5_vr-teleoperation/1_overview.md) | 팀에서 개발한 파이프라인으로 FFW-SG2를 face-to-face teleoperation하고 데모를 녹화하는 방법을 다룹니다. |
| [**Policy Inference**](./6_policy-inference/policy-inference.md) | 녹화한 데이터로 학습한 LeRobot 정책을 FFW-SG2에서 자율 구동하는 방법을 다룹니다. |

## 처음 오셨다면

아래 순서로 따라가면 로봇을 움직일 수 있습니다.

1. [AI WORKER 개요](./1_ai-worker/1_overview.md) — 장비가 어떻게 생겼는지 훑어봅니다.
2. [Pipeline — 환경 구축](./3_pipeline/1_setup.md) — SSH, conda 환경, Jupyter 커널을 준비합니다. **처음 한 번만** 합니다.
3. [Pipeline — 로봇 구동](./3_pipeline/2_robot-start.md) — 전원을 넣고 bringup까지 올립니다.
4. 조작 방식을 고릅니다.
   - [Interactive Marker](./4_interactive-marker/interactive-marker.md) — 마우스로 마커를 끌어 정밀하게 한 번씩
   - [VR Teleoperation](./5_vr-teleoperation/1_overview.md) — Quest 컨트롤러로 연속 조작하고 데모 녹화
   - [Policy Inference](./6_policy-inference/policy-inference.md) — 학습한 정책으로 자율 구동
5. [Pipeline — 로봇 종료](./3_pipeline/3_robot-exit.md) — 팔을 접고 전원을 내립니다.

## Editing

모든 페이지 맨 아래에 **"Edit this page"** 링크가 있습니다. 누르면 GitHub에서 바로 그 파일을 고칠 수 있고, 수정 내용은 Pull Request로 제출됩니다. 자세한 절차는 [문서 기여 방법](./contributing.md)을 참고하세요.
