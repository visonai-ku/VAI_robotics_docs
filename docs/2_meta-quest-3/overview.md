---
sidebar_position: 1
title: 개요
---

# Meta Quest 3 개요

:::note
팀에서 VR teleoperation 입력 장치로 사용하는 Meta Quest 3의 역할과 사양입니다.
기본 사용법은 [초기 설정 및 사용법](./setup.md), 공식 안내는 [Meta Quest 3 시작하기](https://www.meta.com/ko-kr/help/quest/1994971530885728/)를 참고하세요.
:::

## 팀에서의 역할

Quest 3는 **컨트롤러의 위치·자세·버튼 입력을 맥북으로 보내는 입력 장치**로 사용합니다.

```text title="입력 경로"
Quest 3 브라우저 ──(WebXR, wss:8443)──▶ 맥북 노트북 ──▶ Orin ──ROS 2──▶ FFW-SG2
```

- Quest에는 앱을 따로 설치하지 않습니다. **브라우저로 맥북이 띄운 페이지(`https://<맥북 IP>:8443/`)에 접속**하는 방식입니다.
- 헤드셋의 인사이드-아웃 트래킹이 컨트롤러 6DoF 위치를 계산하고, 그 값이 맥북에서 IK를 거쳐 로봇 팔 명령이 됩니다.
- 로봇의 카메라 영상은 Quest가 아니라 **맥북 화면(MuJoCo 뷰·녹화 창)** 에서 확인합니다.

:::warning[컨트롤러 전용]
현재 파이프라인은 **Touch Plus 컨트롤러만** 인식합니다. 맨손(핸드 트래킹)으로는 동작하지 않습니다.
:::

## 주요 사양

| 항목 | 값 |
| --- | --- |
| 디스플레이 | LCD 2개, 눈당 2064 x 2208 |
| 렌즈 | 팬케이크 렌즈 |
| 시야각 | 약 110°(H) x 96°(V) |
| 주사율 | 72 / 90 / 120 Hz |
| 프로세서 | Qualcomm Snapdragon XR2 Gen 2 (Adreno 740) |
| 메모리 / 저장 용량 | 8 GB RAM / 128 GB 또는 512 GB |
| 무게 | 약 515 g (헤드셋) |
| 배터리 | 일반 사용 기준 약 2.2시간 |
| 트래킹 | 인사이드-아웃 6DoF (외부 센서 불필요) |
| 컨트롤러 | Touch Plus 2개 |
| 패스스루 | 컬러 패스스루 지원 |
| 무선 | Wi-Fi 6E |

## 컨트롤러 버튼

파이프라인에서 쓰는 이름 기준입니다.

| 버튼 | 위치 | 파이프라인에서의 역할 |
| --- | --- | --- |
| grip (옆 버튼) | 양손 | 누르고 있는 동안 팔이 따라 움직임 |
| trigger (검지) | 양손 | 그리퍼 열고 닫기 |
| X | 왼쪽 | 녹화 시작 / 종료 |
| Y | 왼쪽 | 녹화 버리기 / 마지막 에피소드에 폐기 표시 |
| A | 오른쪽 | Initial pose 복귀 |
| B | 오른쪽 | (1초) reset pose |
| Meta(Oculus) · 메뉴 버튼 | 양손 | 시스템 전용이라 웹 페이지에서 읽히지 않음 |

자세한 조작 규칙은 [VR Teleoperation 실행](../5_vr-teleoperation/3_run.md)에 정리되어 있습니다.

## 관련 문서

- [초기 설정 및 사용법](./setup.md)
- [VR Teleoperation](../5_vr-teleoperation/1_overview.md)
- [AI WORKER 개요](../1_ai-worker/1_overview.md)
