(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const content = $("#viewContent");
  const modalLayer = $("#modalLayer");
  const GOOGLE_CLIENT_ID = (window.ASERC_GOOGLE_CLIENT_ID || "").trim();
  const playlistKey = "aserc.playlists.v1";

  const iconPaths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    sparkles: '<path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/><path d="m5 3 .6 1.4L7 5l-1.4.6L5 7l-.6-1.4L3 5l1.4-.6L5 3Z"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/>',
    disc: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.2"/><path d="M12 3a9 9 0 0 1 8.8 7.1"/>',
    chart: '<path d="M4 19V5"/><path d="M4 19h17"/><path d="m7 15 4-4 3 2 5-6"/><path d="M16 7h3v3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    wave: '<path d="M2 12h3l2-7 4 14 3-10 2 6 2-3h4"/>',
    logout: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>',
    play: '<path d="m8 5 12 7-12 7z" fill="currentColor" stroke="none"/>',
    "skip-back": '<path d="M6 5v14M19 5l-9 7 9 7z"/>',
    "skip-forward": '<path d="M18 5v14M5 5l9 7-9 7z"/>',
    volume: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    heart: '<path d="M20.8 8.8c0 5.1-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.8a4.6 4.6 0 0 1 8.8-1.6 4.6 4.6 0 0 1 8.8 1.6Z"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  };

  function icon(name, className = "") {
    return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.music}</svg>`;
  }

  function readPlaylists() {
    try {
      const saved = JSON.parse(localStorage.getItem(playlistKey) || "[]");
      return Array.isArray(saved) ? saved.filter((item) => item && typeof item.id === "string" && typeof item.name === "string") : [];
    } catch {
      return [];
    }
  }

  let playlists = readPlaylists();
  let activeView = "home";
  let selectedPlaylist = null;
  let searchTerm = "";
  let toastTimer;
  let signedInUser = null;

  const pageMeta = {
    home: { title: "홈", crumb: "나만의 음악 공간", eyebrow: "YOUR PERSONAL SOUNDSPACE", index: "01" },
    recommend: { title: "추천", crumb: "당신을 위한 발견", eyebrow: "A LITTLE INSPIRATION", index: "02" },
    search: { title: "검색", crumb: "음악을 찾아보세요", eyebrow: "FIND YOUR FREQUENCY", index: "03" },
    playlists: { title: "플레이리스트", crumb: "나의 플레이리스트", eyebrow: "COLLECT YOUR MOMENTS", index: "04" },
    ranking: { title: "랭킹", crumb: "지금의 흐름", eyebrow: "THE SOUND INDEX", index: "05" },
    detail: { title: "플레이리스트", crumb: "나의 플레이리스트", eyebrow: "YOUR COLLECTION", index: "04" },
  };

  const palette = [
    "linear-gradient(135deg, #655984, #c185a8 58%, #d4a887)",
    "linear-gradient(135deg, #446f78, #72958c 50%, #d2b886)",
    "linear-gradient(135deg, #5e5b8e, #8972b0 52%, #c594a7)",
    "linear-gradient(135deg, #8e675d, #c98e7e 54%, #e0bd95)",
    "linear-gradient(135deg, #496b83, #678cb0 50%, #aaa1cb)",
    "linear-gradient(135deg, #655879, #9a7292 52%, #d7a8c2)",
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function updateNav() {
    $$(".nav-item, .mobile-nav-item").forEach((button) => {
      const active = button.dataset.view === (activeView === "detail" ? "playlists" : activeView);
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    $("#playlistCount").textContent = playlists.length;
  }

  function setPageMeta() {
    const meta = pageMeta[activeView] || pageMeta.home;
    $("#pageTitle").textContent = activeView === "detail" && selectedPlaylist ? selectedPlaylist.name : meta.title;
    $("#breadcrumbLabel").textContent = meta.crumb;
    $("#pageEyebrow").textContent = meta.eyebrow;
    $("#headingIndex").innerHTML = `${meta.index} <i></i> 05`;
    document.title = `${activeView === "detail" && selectedPlaylist ? selectedPlaylist.name : meta.title} — aserc`;
  }

  function renderHome() {
    const playlistSummary = playlists.length ? `${playlists.length}개의 플레이리스트` : "아직 만든 플레이리스트가 없어요";
    return `
      <section class="hero">
        <div class="hero-copy">
          <p class="hero-label">A SERENE PLACE FOR SOUND</p>
          <h2>듣고 싶은 순간을<br />천천히 담아보세요.</h2>
          <p>비어 있는 선반에서 시작해도 좋아요. 지금의 기분을 위한 플레이리스트를 만들어보세요.</p>
          <button class="hero-action" type="button" data-action="create-playlist">플레이리스트 만들기 ${icon("arrow")}</button>
        </div>
        <div class="hero-art" aria-hidden="true"><span class="orbit-ring"></span><span class="hero-disc"></span><span class="disc-sticker">SIDE A<br />YOUR MOMENT</span><span class="hero-caption">ASERC · PERSONAL SOUND</span></div>
      </section>

      <div class="section-head"><div><h2>내 라이브러리</h2><p>나만의 음악 공간을 채워보세요</p></div><button type="button" class="text-button" data-view="playlists">전체 보기 ${icon("arrow")}</button></div>
      <section class="collection-grid" aria-label="내 음악 컬렉션">
        <article class="collection-card" data-open-view="playlists" style="--tint:#d7c6ff;--glow:rgba(182,156,248,.2)"><span class="card-icon">${icon("layers")}</span><h3>플레이리스트</h3><p>${escapeHtml(playlistSummary)}</p><span class="card-arrow">${icon("arrow")}</span></article>
        <article class="collection-card" data-open-view="playlists" style="--tint:#f0b5d0;--glow:rgba(220,147,185,.18)"><span class="card-icon">${icon("heart")}</span><h3>좋아하는 노래</h3><p>노래 없음</p><span class="card-arrow">${icon("arrow")}</span></article>
        <article class="collection-card" data-open-view="recommend" style="--tint:#a4ddd0;--glow:rgba(120,201,176,.16)"><span class="card-icon">${icon("clock")}</span><h3>최근 들은 음악</h3><p>아직 재생 기록이 없어요</p><span class="card-arrow">${icon("arrow")}</span></article>
      </section>

      <div class="home-lower">
        <article class="soft-card"><h3>오늘의 선반</h3><p>새로운 음악이 추가되면 이곳에서 바로 확인할 수 있어요. 지금은 당신의 첫 번째 플레이리스트를 기다리고 있어요.</p><div class="soft-meta"><span>●</span><span>0 TRACKS</span><span>·</span><span>READY WHEN YOU ARE</span></div></article>
        <article class="soft-card"><h3>조용히 시작하기</h3><p>음악이 없는 상태로 준비되어 있어요. 마음에 드는 곡을 찾으면 그때 이곳에 모아보세요.</p><div class="soft-meta"><span>✳</span><span>NO SONGS ADDED</span></div></article>
      </div>`;
  }

  function renderRecommend() {
    return `<section class="empty-state">
      <div class="empty-visual">${icon("sparkles")}</div>
      <p class="empty-overline">A QUIET BEGINNING</p>
      <h2>아직 추천할 음악이 없어요.</h2>
      <p>aserc에는 곡이 추가되면 취향에 맞는 발견을 담아둘게요. 지금은 플레이리스트부터 만들어보세요.</p>
      <button class="primary-button" type="button" data-action="create-playlist">첫 플레이리스트 만들기 ${icon("arrow")}</button>
    </section>
    <div class="section-head"><div><h2>기다리는 공간</h2><p>새로운 발견은 이곳에 쌓일 예정이에요</p></div><span class="result-count">0 RECOMMENDATIONS</span></div>`;
  }

  function renderSearch() {
    const message = searchTerm ? `“${escapeHtml(searchTerm)}”에 대한 결과가 없어요.` : "아직 검색할 노래가 없어요.";
    const helper = searchTerm ? "노래가 추가되면 제목, 아티스트, 앨범을 찾아볼 수 있어요." : "새 노래가 들어오면 제목이나 아티스트로 찾아보세요.";
    return `<label class="search-box">${icon("search")}<input id="musicSearch" type="search" autocomplete="off" placeholder="노래, 아티스트, 앨범 검색" value="${escapeHtml(searchTerm)}" aria-label="노래 검색" /></label>
      <p class="search-meta">라이브러리 검색 · 0곡</p>
      <section class="empty-state compact" id="searchEmpty"><div class="empty-visual">${icon("music")}</div><p class="empty-overline">NOTHING IN THE LIBRARY YET</p><h2>${message}</h2><p>${helper}</p></section>`;
  }

  function playlistCard(playlist, index) {
    return `<button class="playlist-card" type="button" data-open-playlist="${escapeHtml(playlist.id)}">
      <span class="playlist-cover" style="--cover:${palette[index % palette.length]}"><span class="playlist-cover-mark">${icon("disc")}</span><span class="playlist-cover-code">ASERC · ${String(index + 1).padStart(2, "0")}</span></span>
      <span class="playlist-info"><span><strong>${escapeHtml(playlist.name)}</strong><small>노래 없음 · 0곡</small></span><span class="arrow">${icon("arrow")}</span></span>
    </button>`;
  }

  function renderPlaylists() {
    if (!playlists.length) return `<section class="empty-state">
      <div class="empty-visual">${icon("disc")}</div>
      <p class="empty-overline">YOUR COLLECTION STARTS HERE</p>
      <h2>플레이리스트가 비어 있어요.</h2>
      <p>좋아하는 순간을 위한 이름을 붙여보세요. 만든 플레이리스트는 이 브라우저에 저장되고, 노래는 아직 담기지 않아요.</p>
      <button class="primary-button" type="button" data-action="create-playlist">플레이리스트 만들기 ${icon("plus")}</button>
    </section>`;
    return `<div class="playlist-toolbar"><span class="result-count">${String(playlists.length).padStart(2, "0")} PLAYLIST${playlists.length === 1 ? "" : "S"}</span><button class="text-button" type="button" data-action="create-playlist">${icon("plus")} 새로 만들기</button></div><section class="playlist-grid" aria-label="플레이리스트">${playlists.map(playlistCard).join("")}</section><div class="section-head"><div><h2>내 컬렉션</h2><p>모든 플레이리스트에는 아직 노래가 없어요</p></div><span class="result-count">0 TRACKS</span></div>`;
  }

  function renderDetail() {
    if (!selectedPlaylist) return renderPlaylists();
    return `<div class="detail-top"><button class="back-button" type="button" data-view="playlists" aria-label="플레이리스트 목록으로">${icon("back")}</button><span class="result-count">PLAYLIST · 0 TRACKS</span></div>
      <div class="detail-art" aria-hidden="true"></div>
      <div class="section-head"><div><h2>${escapeHtml(selectedPlaylist.name)}</h2><p>나만의 플레이리스트 · 0곡</p></div><button class="text-button" type="button" data-view="playlists">목록으로 돌아가기</button></div>
      <section class="empty-state compact"><div class="empty-visual">${icon("music")}</div><p class="empty-overline">THE FIRST NOTE IS STILL AHEAD</p><h2>노래 없음</h2><p>이 플레이리스트에는 아직 담긴 노래가 없어요.</p></section>`;
  }

  function renderRanking() {
    return `<div class="ranking-topline"><span>ASERC CHART</span><span class="line"></span><span>WEEK 01</span></div>
      <section class="empty-state">
        <div class="empty-visual">${icon("chart")}</div>
        <p class="empty-overline">A CHART WITH ROOM TO GROW</p>
        <h2>아직 순위가 없어요.</h2>
        <p>재생할 음악이 추가되면 지금 많이 듣는 곡을 보여드릴게요. 서두르지 않아도 괜찮아요.</p>
      </section>`;
  }

  function render() {
    setPageMeta();
    updateNav();
    const templates = { home: renderHome, recommend: renderRecommend, search: renderSearch, playlists: renderPlaylists, ranking: renderRanking, detail: renderDetail };
    content.innerHTML = (templates[activeView] || renderHome)();
    if (activeView === "search") {
      const input = $("#musicSearch");
      input?.addEventListener("input", (event) => {
        searchTerm = event.target.value;
        const start = event.target.selectionStart;
        const end = event.target.selectionEnd;
        render();
        const next = $("#musicSearch");
        next?.focus();
        next?.setSelectionRange(start, end);
      });
    }
  }

  function setView(view) {
    if (!pageMeta[view]) return;
    activeView = view;
    selectedPlaylist = null;
    render();
    $("#pageScroll").scrollTo?.({ top: 0, behavior: "smooth" });
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  function openCreateModal() {
    modalLayer.innerHTML = `<form class="modal-card" id="playlistForm" aria-labelledby="modalTitle">
      <div class="modal-head"><div><h2 id="modalTitle">새 플레이리스트</h2><p>지금 떠오르는 이름을 붙여주세요.</p></div><button class="modal-close" type="button" data-close-modal aria-label="닫기">${icon("close")}</button></div>
      <label class="form-label" for="playlistName">플레이리스트 이름</label><input class="form-input" id="playlistName" name="name" maxlength="36" required placeholder="예: 늦은 오후의 공기" autocomplete="off" />
      <p class="modal-note">플레이리스트는 현재 브라우저에 저장돼요. 노래는 아직 추가되지 않습니다.</p>
      <div class="modal-actions"><button class="secondary-button" type="button" data-close-modal>취소</button><button class="primary-button small" type="submit">만들기 ${icon("arrow")}</button></div>
    </form>`;
    modalLayer.hidden = false;
    $("#playlistName")?.focus();
  }

  function openLoginInfo() {
    modalLayer.innerHTML = `<section class="modal-card" aria-labelledby="loginModalTitle">
      <div class="modal-icon">${icon("sparkles")}</div>
      <div class="modal-head"><div><h2 id="loginModalTitle">Google 로그인 연결 중</h2><p>Google Cloud에서 웹 OAuth 클라이언트를 만든 뒤 클라이언트 ID를 앱 설정에 넣으면 로그인 버튼이 활성화돼요.</p></div><button class="modal-close" type="button" data-close-modal aria-label="닫기">${icon("close")}</button></div>
      <p class="modal-note">플레이리스트는 지금 이 브라우저에만 저장됩니다. 이 초기 버전은 계정 동기화나 서버 저장을 하지 않아요.</p>
      <div class="modal-actions"><button class="primary-button small" type="button" data-close-modal>알겠어요</button></div>
    </section>`;
    modalLayer.hidden = false;
  }

  function closeModal() {
    modalLayer.hidden = true;
    modalLayer.innerHTML = "";
  }

  function savePlaylists() {
    try {
      localStorage.setItem(playlistKey, JSON.stringify(playlists));
      return true;
    } catch {
      showToast("브라우저 저장을 사용할 수 없어요.");
      return false;
    }
  }

  function onPlaylistSubmit(event) {
    if (event.target.id !== "playlistForm") return;
    event.preventDefault();
    const name = new FormData(event.target).get("name")?.toString().trim();
    if (!name) return;
    const playlist = { id: crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}-${Math.random().toString(16).slice(2)}`, name, createdAt: Date.now() };
    playlists = [playlist, ...playlists];
    savePlaylists();
    closeModal();
    activeView = "detail";
    selectedPlaylist = playlist;
    render();
    showToast("플레이리스트를 만들었어요.");
  }

  function decodeCredential(token) {
    const payload = token.split(".")[1];
    if (!payload) throw new Error("Invalid credential");
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(Array.from(atob(normalized), (char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")));
  }

  function onGoogleCredential(response) {
    try {
      const claims = decodeCredential(response.credential);
      const validIssuer = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
      const validClient = claims.aud === GOOGLE_CLIENT_ID;
      const validTime = Number(claims.exp) * 1000 > Date.now();
      if (!validIssuer || !validClient || !validTime || !claims.sub) throw new Error("Unrecognized Google credential");
      signedInUser = { id: claims.sub, name: claims.name || claims.email || "Google 사용자", picture: claims.picture || "" };
      $("#userName").textContent = signedInUser.name;
      const avatar = $("#userAvatar");
      if (signedInUser.picture) { avatar.src = signedInUser.picture; avatar.hidden = false; }
      else { avatar.hidden = true; }
      $("#signedIn").hidden = false;
      $("#googleButton").hidden = true;
      $("#loginFallback").hidden = true;
      showToast(`${signedInUser.name}님, 반가워요.`);
    } catch {
      showToast("Google 로그인을 확인하지 못했어요. 다시 시도해 주세요.");
    }
  }

  function setupGoogleSignIn() {
    const fallback = $("#loginFallback");
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes("YOUR_GOOGLE_CLIENT_ID")) {
      fallback.hidden = false;
      fallback.addEventListener("click", openLoginInfo);
      $("#mobileLogin").addEventListener("click", openLoginInfo);
      return;
    }
    const renderButton = () => {
      if (!window.google?.accounts?.id || $("#googleButton").dataset.ready) return false;
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: onGoogleCredential, ux_mode: "popup", auto_select: false });
      window.google.accounts.id.renderButton($("#googleButton"), { type: "standard", theme: "filled_black", size: "large", shape: "pill", text: "signin_with", logo_alignment: "left", width: 208, locale: "ko" });
      $("#googleButton").dataset.ready = "true";
      fallback.hidden = true;
      $("#mobileLogin").addEventListener("click", () => window.google.accounts.id.prompt());
      return true;
    };
    if (!renderButton()) {
      const timer = window.setInterval(() => { if (renderButton()) window.clearInterval(timer); }, 250);
      window.setTimeout(() => window.clearInterval(timer), 10000);
    }
  }

  document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-view]");
    if (viewButton) { event.preventDefault(); setView(viewButton.dataset.view); return; }
    const viewCard = event.target.closest("[data-open-view]");
    if (viewCard) { setView(viewCard.dataset.openView); return; }
    if (event.target.closest("[data-action='create-playlist']")) { openCreateModal(); return; }
    const playlistButton = event.target.closest("[data-open-playlist]");
    if (playlistButton) {
      selectedPlaylist = playlists.find((item) => item.id === playlistButton.dataset.openPlaylist) || null;
      activeView = "detail";
      render();
      return;
    }
    if (event.target.closest("[data-close-modal]")) { closeModal(); return; }
    if (event.target === modalLayer) closeModal();
  });
  modalLayer.addEventListener("submit", onPlaylistSubmit);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modalLayer.hidden) closeModal(); });
  $("#signOut").addEventListener("click", () => {
    signedInUser = null;
    $("#signedIn").hidden = true;
    $("#googleButton").hidden = false;
    if (window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect();
    showToast("로그아웃했어요.");
  });

  $$("[data-icon]").forEach((element) => {
    const name = element.dataset.icon;
    element.innerHTML = icon(name);
  });
  render();
  setupGoogleSignIn();
})();

