# 배포 가이드 (Deployment Guide)

이 프로젝트는 **Frontend (Vercel)**와 **Backend (Railway)**에 무료로 배포할 수 있도록 설정되어 있습니다.

## 1. Backend 배포 (Railway)

1. [Railway](https://railway.app/)에 로그인합니다.
2. **New Project** > **Deploy from GitHub repo**를 선택합니다.
3. 이 저장소(`web-1`)를 선택합니다.
4. **설정 불필요 (Zero Config)**:
   - 프로젝트 루트에 있는 `railway.json` 파일이 자동으로 설정을 처리합니다.
   - `build` 명령: `cd backend && pip install -r requirements.txt`
   - `start` 명령: `cd backend && uvicorn main:app ...`
   - **Root Directory 설정을 찾을 필요가 없습니다.** (기본값 `/` 사용)

5. **Variables**:
   - **Variables** 탭으로 이동합니다.
   - `GEMINI_API_KEY` (또는 `GOOGLE_API_KEY`)를 추가하고 값을 입력합니다. (필수)
   - `PORT`는 Railway가 자동으로 할당합니다.

## 2. Frontend 배포 (Vercel)

1. [Vercel](https://vercel.com/)에 로그인합니다.
2. **Add New...** > **Project**를 선택합니다.
3. 이 저장소(`web-1`)를 Import 합니다.
4. **Framework Preset**: Next.js (자동 감지됨)
5. **Root Directory**: `frontend` 폴더를 선택합니다.
6. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: 위에서 복사한 **Backend URL**을 입력합니다. (뒤에 `/` 없이 입력)
7. **Deploy** 클릭!

## 3. 확인

배포된 Vercel URL로 접속하여 기능이 작동하는지 확인하세요.

---
**Troubleshooting**:
- 만약 Python 빌드 에러가 나면 `railway.json`의 `builder`가 `NIXPACKS`로 되어 있는지 확인하세요.
- `requirements.txt`가 `backend/` 폴더 안에 있어야 합니다.
