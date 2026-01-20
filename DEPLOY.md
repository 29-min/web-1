# 배포 가이드 (Deployment Guide)

이 프로젝트는 **Frontend (Vercel)**와 **Backend (Railway)**에 무료로 배포할 수 있도록 설정되어 있습니다.

## 1. Backend 배포 (Railway)

1. [Railway](https://railway.app/)에 로그인합니다.
2. **New Project** > **Deploy from GitHub repo**를 선택합니다.
3. 이 저장소(`web-1`)를 선택합니다.
4. **Service Settings (중요!)**:
   - 생성된 서비스의 **Settings** 탭으로 이동합니다.
   - **Root Directory**를 `/backend` 로 설정합니다. (이것이 핵심입니다!)
   - 이렇게 하면 Railway가 `backend` 폴더 안의 `requirements.txt`와 `Procfile`을 인식합니다.
5. **Variables**:
   - **Variables** 탭으로 이동합니다.
   - `GEMINI_API_KEY` (또는 `GOOGLE_API_KEY`)를 추가하고 값을 입력합니다. (필수)
   - `PORT`는 Railway가 자동으로 할당하므로 설정할 필요가 없습니다.

배포가 완료되면 **제공된 도메인 URL** (예: `https://web-1-production.up.railway.app`)을 복사하세요.

## 2. Frontend 배포 (Vercel)

1. [Vercel](https://vercel.com/)에 로그인합니다.
2. **Add New...** > **Project**를 선택합니다.
3. 이 저장소(`web-1`)를 Import 합니다.
4. **Framework Preset**: Next.js (자동 감지됨)
5. **Root Directory**: `frontend` 폴더를 선택합니다. (Edit 버튼 클릭 후 `frontend` 선택)
6. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: 위에서 복사한 **Backend URL**을 입력합니다. (뒤에 `/` 없이 입력, 예: `https://web-1-production.up.railway.app`)
7. **Deploy** 클릭!

## 3. 확인

배포된 Vercel URL로 접속하여 다음 기능이 작동하는지 확인하세요:
1. 스타일 분석 (Extract Prompt) - Backend API 호출
2. 카드 생성 취소/저장 등

---
**Troubleshooting**:
- 만약 Railway 빌드가 실패하면 **Root Directory**가 `/backend`로 되어 있는지 다시 확인하세요.
- Python 버전은 `3.11`로 고정되어 있습니다 (`backend/runtime.txt`).
