# 배포 가이드 (Deployment Guide)

이 프로젝트는 **Frontend (Vercel)**와 **Backend (Railway)**에 무료로 배포할 수 있도록 설정되어 있습니다.

## 1. Backend 배포 (Railway)

1. [Railway](https://railway.app/)에 로그인합니다.
2. **New Project** > **Deploy from GitHub repo**를 선택합니다.
3. 이 저장소(`web-1`)를 선택합니다.
4. **Variable** 설정:
   - 프로젝트 설정(Settings) 또는 변수(Variables) 탭으로 이동합니다.
   - `GEMINI_API_KEY` (또는 `GOOGLE_API_KEY`)를 추가하고 값을 입력합니다. (필수)
   - `PORT`는 Railway가 자동으로 할당하므로 설정할 필요가 없습니다. (코드에서 자동 감지)
5. **Root Directory**:
   - `backend` 폴더가 루트가 아니므로, Root Directory 설정이 필요할 수 있습니다.
   - 하지만 현재 구조상 `Procfile`이 루트에 있고 `uvicorn backend.main:app`을 실행하므로 기본 설정으로도 작동할 수 있습니다.
   - 만약 실행이 안 된다면 Settings > Root Directory를 `./` (기본값)로 유지하거나 필요시 조정하세요. (현재 설정은 루트 기준입니다)
   - **Start Command**: `Procfile`이 자동으로 감지되어야 합니다. 수동 설정 시: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

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
**참고**: 로컬에서 실행할 때는 `api/constants.ts`의 기본값(`http://localhost:8000`)이 사용되거나 `.env.local`의 `NEXT_PUBLIC_API_URL`이 사용됩니다.
