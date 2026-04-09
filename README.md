# 🏢 B2B SaaS Dashboard Project
> **Supabase**와 **Next.js**를 활용한 기업용 데이터 관리 및 분석 대시보드 시스템입니다.  
> 단순한 기능 구현을 넘어, **확장 가능한 아키텍처 설계**와 **서버 상태 관리 최적화**에 집중했습니다.

<br/>

## 🔗 링크 및 테스트 계정
- **배포 링크**: [Dashboard 바로가기](https://my-baas-project.vercel.app/dashboard)
- **테스트 계정**: 
  - **ID**: `admin@test.com`
  - **PW**: `admin`

<br/>

## 🛠 Tech Stack
| 분류 | 기술 |
| :--- | :--- |
| **Framework** | **Next.js 14 (App Router)** |
| **Language** | **TypeScript** |
| **State** | **Zustand**, **TanStack Query (React Query)** |
| **Backend** | **Supabase** (Auth, Database, Real-time) |
| **Library** | **dnd-kit** (Kanban), **Recharts** (Analytics), **Tailwind CSS** |

<br/>

## ✨ Key Features

### 1. 실시간 데이터 대시보드
- **Supabase Real-time**: 데이터 변경 사항을 실시간으로 감지하여 UI 업데이트.
- **Dynamic CRUD**: 게시글 생성/수정/삭제 및 검색, 상태별 필터링 기능.
- **상태 최적화**: TanStack Query를 사용하여 캐싱 및 서버 데이터 동기화 최적화.

### 2. 인터랙티브 칸반 보드
- **Drag & Drop**: `dnd-kit`을 활용한 직관적인 태스크 상태 전환.
- **Optimistic Updates**: 데이터 변경 시 즉각적인 UI 반응으로 사용자 경험 향상.

### 3. 통계 및 데이터 분석
- **Visual Analytics**: `Recharts` 라이브러리를 이용한 상태별 게시글 비율 시각화.
- **Summary Cards**: 전체/활성/대기/종료 상태를 한눈에 파악하는 요약 카드 UI.

<br/>

## 📂 Project Structure
```text
src/
 ├── app/                  # Next.js App Router (Pages & Layouts)
 ├── components/           # 관심사 분리에 따른 컴포넌트 관리
 │    ├── common/          # 재사용 가능한 공통 UI
 │    ├── dashboard/       # 게시판 및 리스트 관련 컴포넌트
 │    └── kanban/          # 칸반 보드 및 드래그 앤 드롭 로직
 ├── store/                # Zustand (Modal, UI 상태 등 클라이언트 전역 상태)
 ├── types/                # 공통 인터페이스 및 타입 정의 (Task, Post 등)
 ├── lib/                  # 외부 라이브러리 설정 (Supabase client 등)
 └── hooks/                # 데이터 페칭 및 공통 로직 커스텀 훅
