# aserc

Apple Music에서 영감을 받은 블러·글래스 스타일의 음악 라이브러리 프로토타입입니다. 현재 노래 데이터는 비어 있으며, 샘플 곡이나 오디오를 넣지 않았습니다.

## 포함된 기능

- 홈, 추천, 검색, 플레이리스트, 랭킹 화면
- 플레이리스트 생성 및 현재 브라우저의 `localStorage` 저장
- 곡이 없는 상태를 명확하게 보여주는 라이브러리와 플레이어
- Google Identity Services 로그인 버튼 연결 지점
- 모바일 화면용 하단 내비게이션

플레이리스트와 로그인은 아직 서버 계정과 동기화되지 않습니다. 노래를 추가하거나 여러 기기에서 동기화하는 기능은 후속 작업으로 분리되어 있습니다.

## Google 로그인

Google Cloud 프로젝트 `aserc`의 웹 OAuth 클라이언트 ID를 `index.html`에 연결했습니다. 승인된 JavaScript 원본은 다음 주소로 설정되어 있어야 합니다.

- `https://aserc.p-e.kr`
- `https://tkxl1214-web.github.io`
- `http://localhost:4173`

Google Identity Services의 팝업 로그인만 사용하므로 리디렉션 URI는 필요하지 않습니다. 클라이언트 비밀번호는 이 저장소나 브라우저 코드에 넣지 않습니다. 이 정적 프로토타입은 Google ID 토큰에서 이름과 프로필 사진만 표시하며 토큰을 저장하지 않습니다. 토큰의 서버 검증, 계정 저장, 기기 간 동기화는 백엔드가 준비될 때 추가해야 합니다.

## GitHub Pages

`.github/workflows/pages.yml`은 `main` 브랜치에 변경이 올라올 때 정적 페이지를 배포합니다. 저장소 Settings → Pages의 게시 소스는 **GitHub Actions**로 설정되어 있습니다. 사용자 지정 도메인은 Pages 설정에 `aserc.p-e.kr`로 등록했습니다. 도메인 제공업체에서 루트 CNAME(`aserc.p-e.kr`)의 대상으로 `tkxl1214-web.github.io`를 지정해야 합니다.

로컬 미리보기는 Python이 설치된 환경에서 아래 명령으로 실행할 수 있습니다.

```powershell
python -m http.server 4173
```

그 다음 `http://localhost:4173/outputs/aserc/`를 엽니다.

