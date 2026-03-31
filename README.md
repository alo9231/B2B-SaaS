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

## 🚀 주요 기능

- 👤 사용자 로그인 / 인증
- 🏢 조직(Organization) 기반 데이터 구조
- 👥 사용자 목록 및 관리
- 🔐 권한 기반 UI 분기
- 📊 서비스 데이터 조회

<br/>

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
```bash
src/
├── app/
│   ├── layout.tsx          # 최상위 레이아웃 (ReactQuery, Toast, 전역 설정)
│   ├── page.tsx            # 메인 루트 (접속 시 /dashboard로 리다이렉트)
│   ├── login/
│   │   └── page.tsx        # 로그인 페이지 (사이드바/헤더 제외)
│   └── dashboard/
│        ├── layout.tsx     # 대시보드 전용 레이아웃 (Sidebar, Header 배치)
│        └── page.tsx       # 대시보드 메인 (게시판/칸반 보드 로직)
├── components/
│   ├── dashboard/          # 대시보드 전용 컴포넌트 (모달 등)
│   ├── layout/             # 공통 레이아웃 컴포넌트
│   │    ├── Sidebar.tsx    # 사이드바
│   │    ├── Header.tsx     # 헤더
│   │    └── PageLayoutWrapper.tsx  # 배경 및 애니메이션 래퍼
│   └── providers/          # 전역 Context/Query Provider
├── lib/
│   └── supabase.ts         # Supabase 클라이언트 설정
└── store/
    └── useModalStore.ts    # Zustand 상태 관리 (모달 등)
