# 🚀 TaskFlow (B2B-SaaS Dashboard)

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=Next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=Zustand&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=GreenSock&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=Tailwind-CSS&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=Vercel&logoColor=white)

> ** B2B 협업 대시보드입니다.**
단순한 기능 구현을 넘어, 복잡한 데이터 구조를 안정적으로 설계하고 사용자 경험을 극대화하는 인터랙티브 UI를 구현하는 데 초점을 맞췄습니다.

---

## 🔗 프로젝트 링크

* **Live Demo:** URL

---

## 📋 주요 기능 (Key Features)

### ✅ 스마트 칸반 보드 (Interactive Kanban Board)
* **Drag & Drop:** `Zustand` 기반의 전역 상태 관리를 통해 실시간으로 작업 카테고리를 이동 및 저장합니다.
* **Smooth Motion:** `GSAP`를 활용하여 카드 이동 및 리스트 순서 변경 시 부드럽고 직관적인 피드백을 제공합니다.

### ✅ 실시간 알림 & 사이드바 (Notification & Layout)
* **Real-time Sync:** `TanStack Query`를 활용하여 실시간 서버 데이터를 동기화하고 캐싱하여 성능을 최적화했습니다.
* **Responsive UI:** 6년의 퍼블리싱 노하우를 녹여 복잡한 대시보드 레이아웃을 모든 해상도에서 완벽하게 대응했습니다.

### ✅ 데이터 시각화 & 필터링 (Data Visualization)
* **Dynamic Filtering:** 복잡한 조건의 프로젝트 및 멤버 필터링 기능을 `TypeScript`의 엄격한 타입 정의로 안정적으로 구현했습니다.
* **Micro-interaction:** 데이터 로딩 시 Skeleton UI 및 세련된 트랜지션 애니메이션으로 사용자 이탈률을 최소화했습니다.

---

## 🛠 기술적 고민 (Problem Solving)

### 1. 복잡한 UI 상태 관리 최적화
* 기존의 Prop Drilling 문제를 해결하기 위해 **Zustand**를 도입, 보일러플레이트를 최소화하고 컴포넌트 간 데이터 흐름을 명확하게 설계했습니다.

### 2. 고성능 애니메이션 구현 (GSAP)
* 단순 CSS 애니메이션의 한계를 넘어, **GSAP ScrollTrigger**와 **Stagger**를 활용하여 대량의 데이터를 렌더링할 때도 끊김 없는 부드러운 사용자 경험을 제공합니다.

### 3. 컴포넌트 재사용성 및 확장성
* **Atomic Design** 패턴을 참고하여 공통 UI 컴포넌트를 분리, 유지보수 비용을 절감하고 일관된 디자인 시스템을 유지하도록 설계했습니다.

---

## 📂 폴더 구조 (Folder Structure)

```text
src/
 ├── components/  # 공통 UI 및 페이지별 컴포넌트
 ├── hooks/       # 커스텀 훅 (비즈니스 로직 분리)
 ├── store/       # Zustand 전역 상태 관리
 ├── types/       # TypeScript 인터페이스 정의
 └── lib/         # API 및 라이브러리 설정
