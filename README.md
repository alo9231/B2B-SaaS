# 🏢 B2B SaaS Platform

기업(Organization) 단위로 사용자 관리와 서비스 이용이 가능한  
B2B SaaS 구조를 구현한 웹 애플리케이션입니다.

단순 CRUD 구현을 넘어  
**멀티 유저 환경에서의 상태 관리와 구조 설계**에 초점을 맞췄습니다.

<br/>

## 🔗 배포 링크 & 프리뷰

- 실제 배포: [Dashboard 접속하기](https://my-baas-project.vercel.app/dashboard)
- 진입 로그인 폼 -> ID: admin@test.com / PW:admin 

<br/>

## 📌 프로젝트 목적

B2B SaaS 서비스는 개인이 아닌  
**조직 단위로 사용자와 권한을 관리하는 구조**가 핵심입니다.

이 프로젝트에서는 다음을 목표로 구현했습니다:

- 조직(Organization) 기반 사용자 구조 이해
- 사용자 상태 및 데이터 흐름 설계
- 확장 가능한 프론트엔드 구조 구성

<br/>
## ✨ Key Features

1. 효율적인 데이터 관리 (Dashboard)
CRUD 구현: Supabase를 통한 게시글 생성, 수정, 삭제 및 실시간 업데이트.

데이터 필터링: 제목 기반 실시간 검색 및 상태별/날짜별 정렬 기능.

모달 시스템: Zustand를 활용한 중앙 집중식 모달 상태 관리로 상세 데이터 확인.

2. 인터랙티브 칸반 보드 (Kanban)
Drag & Drop: dnd-kit을 활용하여 직관적으로 업무 상태 변경 가능.

리팩토링: TanStack Query를 도입하여 서버 데이터와 클라이언트 상태 간의 동기화 최적화.

3. 데이터 통계 분석 (Analytics)
시각화: Recharts를 사용하여 전체 데이터의 상태 비율을 파이 차트로 표현.

요약 카드: 전체/활성/대기/종료 상태별 개수를 한눈에 파악할 수 있는 대시보드 UI.

4. 아키텍처 및 클린 코드
타입 시스템: src/types 폴더에 핵심 인터페이스를 모아 데이터 규격 일원화.

컴포넌트 분리: 관심사 분리를 통해 재사용성과 유지보수성 향상.

## 💡 문제 해결 과정

### 1. 사용자 상태 관리 복잡도 해결
여러 사용자와 조직 데이터를 동시에 다루면서  
상태가 분산되고 관리가 어려운 문제가 있었습니다.

→ 전역 상태 관리 구조를 도입하여  
**사용자 및 조직 데이터를 일관되게 관리**하도록 개선했습니다.

---

### 2. 컴포넌트 역할 분리
UI와 로직이 혼재되어 컴포넌트 복잡도가 증가하는 문제 해결

→ UI와 비즈니스 로직을 분리하여  
**관심사 분리(Separation of Concerns)** 구조로 개선

---

### 3. API 구조 개선
컴포넌트 내부에서 API 호출 → 로직 분산

→ API 모듈을 분리하고 공통 클라이언트 도입  
**데이터 처리 구조 통일**

---

### 4. 사용자 경험 개선
데이터 로딩 및 처리 과정에서 사용자 피드백 부족 문제

→ 로딩 상태, 에러 처리 추가  
**사용자 경험 개선**

<br/>

## 🛠 기술 스택

- **Frontend**: React
- **Language**: TypeScript
- **State Management**: (Zustand / Redux / Context API)
- **Routing**: React Router
- **API**: Fetch / Axios

<br/>

## 📁 프로젝트 구조

## 📂 폴더 구조 (Project Structure)

# 🚀 B2B SaaS Dashboard Project

Supabase와 Next.js를 활용한 효율적인 데이터 관리 및 분석 대시보드 시스템입니다.  
사용자 친화적인 인터페이스와 실시간 데이터 동기화를 중점적으로 구현하였습니다.

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Database & Auth**: Supabase
- **State Management**: Zustand, TanStack Query (React Query)
- **Visualization**: Recharts
- **Interaction**: dnd-kit (Kanban Board)

## 📂 Project Structure

```text
src/
 ├── app/                  # Next.js App Router (Pages & Layouts)
 ├── components/           
 │    ├── common/          # 공통 UI 컴포넌트
 │    ├── dashboard/       # 대시보드 메인 컴포넌트
 │    └── kanban/          # 칸반 보드 전용 컴포넌트
 ├── store/                # Zustand 전역 상태 관리 (Modal, Auth 등)
 ├── types/                # 공통 타입 정의 (Task, Post, Modal 등)
 ├── lib/                  # 외부 라이브러리 설정 (Supabase Client 등)
 └── hooks/                # 커스텀 훅 관리
