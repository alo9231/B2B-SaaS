# 🚀 TaskFlow (B2B SaaS Collaboration Dashboard)

> **실시간 협업 관리 솔루션**입니다.  
> 단순한 기능 구현을 넘어, 데이터 안정성과 고성능 인터랙티브 UI 구현에 초점을 맞췄습니다.

<div align="center">
  <img src="https://capsule-render.vercel.app/render?type=waving&color=auto&height=200&section=header&text=TaskFlow&fontSize=90" />
</div>

### 🔗 Project Links
- **Live Demo**: [https://my-baas-project.vercel.app/](https://my-baas-project.vercel.app/)

---

### 🛠 Tech Stack
| Category | Tech Stack |
| :--- | :--- |
| **Framework** | **Next.js 14 (App Router)**, TypeScript |
| **State** | **Zustand** (UI State), **TanStack Query** (Server State) |
| **Backend** | **Supabase** (Auth, Database, Real-time) |
| **Styling** | **Tailwind CSS**, **GSAP** (Interactive Motion) |
| **Deployment** | **Vercel** |

---

### 📋 주요 기능 (Key Features)

#### ✅ 스마트 칸반 보드 (Interactive Kanban Board)
- **Drag & Drop**: Zustand 기반의 전역 상태 관리를 통해 실시간으로 작업 카테고리를 이동 및 저장합니다.
- **GSAP Smooth Motion**: 단순 CSS를 넘어 **GSAP Stagger**를 활용, 카드 이동 및 리스트 순서 변경 시 부드럽고 직관적인 피드백을 제공합니다.

#### ✅ 실시간 데이터 동기화 (Real-time Sync)
- **Server State Optimization**: TanStack Query를 활용하여 서버 데이터를 캐싱하고, Supabase Real-time을 연동하여 협업 중인 팀원의 변경사항을 즉각 반영합니다.
- **Responsive Layout**: 6년의 퍼블리싱 내공을 녹여, 복잡한 대시보드 레이아웃을 모바일부턴 와이드 모니터까지 완벽하게 대응했습니다.

#### ✅ 데이터 시각화 & 필터링 (Data Visualization)
- **Complex Filtering**: TypeScript의 엄격한 타입 정의를 통해 다중 조건 필터링 기능을 버그 없이 안정적으로 구현했습니다.
- **UX Detail**: Skeleton UI와 부드러운 트랜지션을 적용하여 데이터 로딩 시의 사용자 이탈률을 최소화했습니다.

---

### 🧠 기술적 고민 & 해결 (Problem Solving)

#### 1. 복잡한 UI 상태 관리 최적화
- **Issue**: 대시보드 특성상 여러 컴포넌트에서 동일한 작업 데이터를 참조하여 Prop Drilling 발생 우려.
- **Solution**: **Zustand**를 도입하여 보일러플레이트를 최소화하고, 클라이언트 상태와 서버 상태(TanStack Query)를 명확히 분리하여 데이터 흐름을 설계했습니다.

#### 2. 고성능 애니메이션과 브라우저 최적화
- **Issue**: 대량의 카드 데이터 렌더링 시 애니메이션 끊김 현상 발생 가능성.
- **Solution**: 브라우저 렌더링 파이프라인을 고려하여 **GSAP**로 애니메이션을 제어, 저사양 기기에서도 끊김 없는 사용자 경험을 제공하도록 최적화했습니다.

#### 3. 컴포넌트 재사용성 및 확장성 (Atomic Design)
- **Approach**: 공통 UI 컴포넌트를 분리하여 유지보수 비용을 절감하고, 일관된 디자인 시스템을 유지하도록 설계했습니다. 이는 퍼블리셔로서 지향해온 '관리 효율성'을 코드 수준으로 확장한 결과입니다.

---

### 📂 폴더 구조 (Folder Structure)
```text
src/
 ├── components/  # 공통 UI 및 페이지별 단위 컴포넌트
 ├── hooks/       # 비즈니스 로직 분리 (Custom Hooks)
 ├── store/       # Zustand를 활용한 전역 UI 상태 관리
 ├── types/       # TypeScript Interface & Type 정의
 ├── lib/         # Supabase 및 외부 라이브러리 Config
 └── app/         # Next.js App Router (Pages & Layouts)
