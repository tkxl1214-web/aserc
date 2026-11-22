# aserc

Apple Music에서 영감을 받은 블러·글래스 스타일의 음악 라이브러리 프로토타입입니다. 현재 노래 데이터는 비어 있으며, 샘플 곡이나 오디오를 넣지 않았습니다.

## 포함된 기능

- 홈, 추천, 검색, 플레이리스트, 랭킹 화면
- 플레이리스트 생성 및 현재 브라우저의 `localStorage` 저장
- 곡이 없는 상태를 명확하게 보여주는 라이브러리와 플레이어
- Google Identity Services 로그인 버튼 연결 지점
- 모바일 화면용 하단 내비게이션

플레이리스트와 로그인은 아직 서버 계정과 동기화되지 않습니다. 노래를 추가하거나 여러 기기에서 동기화하는 기능은 후속 작업으로 분리되어 있습니다.

## Google 로그인 연결

1. Google Cloud Console에서 `aserc` 프로젝트에 웹 애플리케이션 OAuth 클라이언트 ID를 만듭니다.
2. 승인된 JavaScript 원본에 배포 도메인 `https://aserc.p-e.kr`과 로컬 미리보기 주소를 추가합니다.
3. 발급된 **클라이언트 ID**를 `index.html`의 `window.ASERC_GOOGLE_CLIENT_ID` 값에 넣습니다.
4. 클라이언트 비밀번호는 이 저장소나 브라우저 코드에 넣지 않습니다. Google 로그인 토큰을 서버에서 검증하고 계정을 저장하는 기능은 백엔드가 준비될 때 추가해야 합니다.

이 정적 프로토타입은 Google의 서명된 ID 토큰에서 이름과 프로필 사진만 표시합니다. 토큰은 저장하지 않습니다.

## GitHub Pages

`.github/workflows/pages.yml`은 `main` 브랜치에 변경이 올라올 때 정적 페이지를 배포합니다. 첫 배포 전에 저장소 Settings → Pages에서 게시 소스를 **GitHub Actions**로 설정하세요. 사용자 지정 도메인을 쓸 경우 Pages 설정에 `aserc.p-e.kr`을 추가하고, DNS 제공업체에서 `aserc.p-e.kr`의 CNAME을 `tkxl1214-web.github.io`로 지정합니다.

로컬 미리보기는 Python이 설치된 환경에서 아래 명령으로 실행할 수 있습니다.

```powershell
python -m http.server 4173
```

그 다음 `http://localhost:4173/outputs/aserc/`를 엽니다.

