(() => {
  "use strict";

  const app = document.querySelector("#app");
  const status = document.querySelector("#header-status");
  const toast = document.querySelector("#toast");
  const storageKey = "ankang-ai-experience-v1";
  let state = { game: null, step: 0, answers: [], scores: {}, locale: null, locked: false };
  let breathTimer = null;
  let flightFrame = null;
  let flightLastTime = 0;
  let flightMap = null;
  let flightCameraMap = null;
  let flightDroneMarker = null;
  let flightCameraMarkers = [];
  let googleCameraMap = null;
  let googleMiniMap = null;
  let googleDroneMarker = null;
  let googleMapsMode = false;
  let googleMapsPromise = null;
  let flightFallbackStarted = false;
  let flightMapUpdateAt = 0;
  let activeJoystick = null;
  const schoolCoordinate = [121.5145853, 24.9696795];
  const sunshineParkCoordinate = [121.51994, 24.97692];
  const xizhouParkCoordinate = [121.532693, 24.964708];
  const taipingTempleCoordinate = [121.533087, 24.958744];
  const hemeiMountainCoordinate = [121.5348159, 24.9562198];
  const zhitanPlantCoordinate = [121.5275, 24.9427];
  const wenshanFarmCoordinate = [121.54323, 24.93014];
  const bitanCoordinate = [121.53699, 24.956896];
  const realFlightRoute = [
    schoolCoordinate,
    sunshineParkCoordinate,
    xizhouParkCoordinate,
    taipingTempleCoordinate,
    hemeiMountainCoordinate,
    zhitanPlantCoordinate,
    wenshanFarmCoordinate,
    bitanCoordinate
  ];
  const scenicLandmarks = [
    {
      p: .015, type: "school", label: "安康高中", short: "安康高中", lane: -.28, coord: schoolCoordinate,
      photo: "./assets/landmarks/ankang-high-school-campus.jpg", photoAlt: "安康高中校舍、操場與校園全景",
      photoKind: "校園實拍", credit: "全國運動場館資訊網 iPlay", sourceUrl: "https://iplay.sports.gov.tw/gyminfo/index/7877",
      intro: "從校園上空完成起飛檢查；鏡頭可看見校舍、操場與環山校景，接著展開新店實景航程。"
    },
    {
      p: .145, type: "park", label: "陽光運動園區", short: "陽光公園", lane: .24, coord: sunshineParkCoordinate,
      photo: "./assets/landmarks/sunshine-sports-park.jpg", photoAlt: "陽光運動園區草地、足球活動與陽光橋",
      photoKind: "景點實拍", credit: "新北市政府觀光旅遊局", sourceUrl: "https://newtaipei.travel/zh-tw/attractions/detail/112381",
      intro: "新店溪畔的大型運動園區，從空中可辨認草地、跑道與造型鮮明的陽光橋。"
    },
    {
      p: .285, type: "xizhou", label: "溪洲公園", short: "溪洲公園", lane: -.18, coord: xizhouParkCoordinate,
      photo: "./assets/landmarks/xizhou-park.jpg", photoAlt: "新店溪左岸溪洲公園的河岸綠地",
      photoKind: "景點實拍", credit: "新北市政府", sourceUrl: "https://www.hrcm.ntpc.gov.tw/Zone/Assets/%E6%96%B0%E5%BA%97%E6%BA%AA%E5%B7%A6%E5%B2%B8/%E6%BA%AA%E6%B4%B2%E5%85%AC%E5%9C%92",
      intro: "溪洲公園位於陽光橋與碧潭之間，沿新店溪左岸串起河濱綠地、自行車道與水岸生態。"
    },
    {
      p: .425, type: "temple", label: "太平宮", short: "太平宮", lane: .25, coord: taipingTempleCoordinate,
      photo: "./assets/landmarks/taiping-temple-remote.jpg", photoAlt: "新店太平宮正面外觀",
      photoKind: "景點實拍", credit: "新北市客家文化典藏資料庫", sourceUrl: "https://www.hakka-portal.ntpc.gov.tw/article/%E6%96%B0%E5%BA%97%E5%A4%AA%E5%B9%B3%E5%AE%AE0311490144657502",
      intro: "太平宮位於安坑外五張大坪頂，主祀開漳聖王，是航線上色彩鮮明的地方信仰地標。"
    },
    {
      p: .565, type: "hemei", label: "和美山步道", short: "和美山", lane: .16, coord: hemeiMountainCoordinate,
      photo: "./assets/landmarks/hemeishan-fireflies.jpg", photoAlt: "和美山步道夜間螢火蟲點亮林間石階",
      photoKind: "螢火蟲實拍", credit: "新北市政府觀光旅遊局", sourceUrl: "https://newtaipei.travel/zh-tw/news/detail/3797",
      intro: "和美山緊鄰碧潭，春季夜晚可見螢火蟲點亮林間；賞螢時應避免強光並保持安靜。"
    },
    {
      p: .705, type: "waterworks", label: "直潭淨水場", short: "直潭淨水場", lane: -.14, coord: zhitanPlantCoordinate,
      photo: "./assets/landmarks/zhitan-water-treatment-plant.webp", photoAlt: "直潭淨水場入口與中英文場名",
      photoKind: "外觀實拍", credit: "OPEN HOUSE TAIPEI", sourceUrl: "https://www.opentaipei.org/house/2023ChihtanWaterPurificationPlant",
      intro: "直潭淨水場取用新店溪原水，是大臺北重要的供水設施；本關僅作虛擬辨識，不提供真實飛航指引。"
    },
    {
      p: .845, type: "wenshan", label: "文山農場", short: "文山農場", lane: .2, coord: wenshanFarmCoordinate,
      photo: "./assets/landmarks/wenshan-farm.jpg", photoAlt: "文山農場的茶園與山林景觀",
      photoKind: "景點實拍", credit: "新北市政府觀光旅遊局", sourceUrl: "https://newtaipei.travel/zh-tw/attractions/detail/109976",
      intro: "文山農場以茶園、生態與環境教育聞名；完成這個倒數第二站後，航線折返前往碧潭終點。"
    },
    {
      p: .985, type: "bitan", label: "碧潭吊橋", short: "碧潭", lane: 0, coord: bitanCoordinate,
      photo: "./assets/landmarks/bitan-suspension-bridge.jpg", photoAlt: "夜間點燈的碧潭吊橋與新店溪",
      photoKind: "景點實拍", credit: "新北市政府觀光旅遊局", sourceUrl: "https://newtaipei.travel/zh-tw/attractions/detail/110096",
      intro: "看見新店溪與碧潭吊橋，就代表這趟安康高中到碧潭的 FPV 航程抵達終點。"
    }
  ];
  const flightObstacles = [
    { p: .30, type: "wires", label: "高壓電線", lane: 0 },
    { p: .64, type: "birds", label: "飛行鳥群", lane: .22 }
  ];

  const games = {
    drone: { title: "AI 無人機", icon: "⌁", time: "約 90 秒", desc: "從 Google 衛星空拍影像操控雙搖桿無人機，沿小地圖飛越新店地標抵達碧潭。", tags: ["Google 衛星", "雙搖桿", "AI 避障"] },
    body: { title: "身心調整", icon: "◌", time: "約 2 分鐘", desc: "回答四個身體感受問題，找出你此刻最需要的覺察方式。", tags: ["能力探索", "身體構圖", "30 秒練習"] },
    language: { title: "第二外語", icon: "あ", time: "約 2–3 分鐘", desc: "選擇日、韓、德其中一站，完成咖啡館裡的三輪對話任務。", tags: ["角色扮演", "語音播放", "護照集章"] }
  };

  const droneStages = [
    {
      kicker: "任務 01｜路徑規劃",
      title: "暴雨過後，如何安全抵達？",
      prompt: "救援包必須送到河谷另一側。電量 68%，前方有樹林、高壓電線與陣風。你會選哪條航線？",
      choices: [
        { title: "升高後走開闊弧線", sub: "距離稍長，但保留與障礙物的安全距離", score: { safety: 3, planning: 3, ai: 0 }, feedback: "穩健規劃！先取得開闊視野，再讓感測器持續修正航線，是兼顧安全與續航的選擇。" },
        { title: "貼著樹梢直線前進", sub: "距離較短，但氣流與枝葉變化大", score: { safety: 0, planning: 1, ai: 1 }, feedback: "快速，但風場與細小枝葉會增加感測難度。無人機任務通常要把風險也算進最短路徑。" },
        { title: "沿高壓電線旁穿越", sub: "看似容易辨認方向，也是最直接的路線", score: { safety: -2, planning: 0, ai: 0 }, feedback: "高壓電線是高風險環境，可能干擾定位，也不應成為貼近飛行的導航線。" }
      ]
    },
    {
      kicker: "任務 02｜AI 視覺辨識",
      title: "畫面中哪個才是待救目標？",
      prompt: "AI 畫面同時標出橘色物體、移動黑影與微弱熱源。哪一種判斷最值得優先複核？",
      choices: [
        { title: "只追蹤最大的移動黑影", sub: "移動最明顯，可能是人或動物", score: { safety: 0, planning: 0, ai: 0 }, feedback: "單一『移動』特徵容易誤判。AI 辨識需要交叉比對多種線索。" },
        { title: "比對熱源與橘色衣物位置", sub: "讓兩種不同感測資訊互相驗證", score: { safety: 2, planning: 1, ai: 3 }, feedback: "辨識成功！熱源與顏色位置重疊，代表兩種線索彼此支持，再由操作者確認會更可靠。" },
        { title: "只鎖定最鮮豔的橘色物體", sub: "救難衣常使用醒目顏色", score: { safety: 1, planning: 0, ai: 1 }, feedback: "顏色是重要線索，但也可能是背包或標示物。加入熱影像能降低誤判。" }
      ]
    },
    {
      kicker: "任務 03｜智慧避障",
      title: "飛行途中突然出現移動障礙！",
      prompt: "一面被強風吹動的廣告布進入航線，距離正在縮短。你的即時指令是？",
      choices: [
        { title: "懸停、重新掃描、改道", sub: "先停止接近，再讓感測器更新環境模型", score: { safety: 3, planning: 3, ai: 2 }, feedback: "最佳處置！懸停爭取判斷時間，重新感知並規劃，是智慧避障的核心流程。" },
        { title: "立刻急升並保持原航向", sub: "迅速離開目前高度", score: { safety: 1, planning: 1, ai: 0 }, feedback: "急升可能避開眼前障礙，但若上方環境未確認，仍會產生新的風險。" },
        { title: "關閉感測器，改用高速手控", sub: "相信操作者能更快穿過空隙", score: { safety: -2, planning: 0, ai: -1 }, feedback: "在動態障礙前關閉感測器會失去重要資訊。人與 AI 應互相補位，而不是移除安全機制。" }
      ]
    }
  ];

  const bodyQuestions = [
    { title: "忙了一天，你最先注意到哪個訊號？", prompt: "沒有標準答案，選擇最接近此刻感受的項目。", choices: [
      { title: "肩頸位置好像變得模糊", sub: "想重新感覺身體的輪廓與位置", type: "map" },
      { title: "身體坐不住，想換個方向動動", sub: "想伸展、旋轉或改變重心", type: "move" },
      { title: "呼吸變淺，整個人有點緊", sub: "想慢下來，讓身體重新歸零", type: "recover" }
    ]},
    { title: "面對一個陌生動作，你通常會……", prompt: "AI 覺察助手會從你的偏好推測適合的探索方式。", choices: [
      { title: "先想像骨骼與關節怎麼排列", sub: "理解結構後，再開始動作", type: "map" },
      { title: "試試看不同方向與幅度", sub: "在變化裡找到最順的路徑", type: "move" },
      { title: "先放慢呼吸、感受緊繃處", sub: "讓身體準備好再前進", type: "recover" }
    ]},
    { title: "你最喜歡哪一種課堂體驗？", prompt: "想一想什麼活動最容易讓你進入專注狀態。", choices: [
      { title: "把感覺畫成一張身體地圖", sub: "用圖像看見原本忽略的細節", type: "map" },
      { title: "延展、螺旋與重心轉換", sub: "感受動作在三度空間裡流動", type: "move" },
      { title: "呼吸與全身放鬆練習", sub: "暫停外界刺激，回到自己", type: "recover" }
    ]},
    { title: "現在最想送給身體的一句話是？", prompt: "最後一題，選擇最符合你當下需要的句子。", choices: [
      { title: "讓我再認識你一點", sub: "看見身體結構與習慣", type: "map" },
      { title: "我們換一條路試試看", sub: "探索更多動作可能", type: "move" },
      { title: "不用急，先好好呼吸", sub: "允許自己停下與調整", type: "recover" }
    ]}
  ];

  const bodyTypes = {
    map: { icon: "◎", title: "身體地圖觀察家", subtitle: "Understanding｜瞭解自己", copy: "你擅長先看懂結構，再做出調整。當身體位置變得模糊時，畫一畫、摸一摸或慢慢確認關節方向，會幫助你建立清楚的身體地圖。", chips: ["觀察細節", "理解結構", "身體構圖"], practice: "坐穩，感受雙腳、骨盆與肩膀三個位置；不用改變姿勢，只要辨認它們現在在哪裡。" },
    move: { icon: "↻", title: "螺旋動作探索家", subtitle: "Awareness｜覺察自己", copy: "你會透過移動來理解身體。延展、螺旋與重心轉換，能幫你發現同一個動作不只一條路，並在變化中找到平衡。", chips: ["空間探索", "重心轉換", "Gyrokinesis"], practice: "坐穩，雙手輕放大腿；吸氣延伸脊椎，吐氣時胸口向右轉一點，再回到中央換邊。" },
    recover: { icon: "◌", title: "呼吸調整引導家", subtitle: "Adjustment｜調整自己", copy: "你很容易注意到呼吸與緊繃的變化。比起立刻完成更多動作，先給身體一段放慢與重新歸零的時間，會讓後續行動更有餘裕。", chips: ["呼吸感知", "放鬆歸零", "肌膜放鬆"], practice: "雙腳踩地，肩膀自然放鬆；用鼻子吸氣 4 秒，再慢慢吐氣 6 秒，不必刻意吸得很深。" }
  };

  const languageData = {
    ja: { name: "日本", flag: "🇯🇵", locale: "ja-JP", hello: "こんにちは", roman: "Konnichiwa", questions: [
      { npc: "店員說：いらっしゃいませ！", trans: "歡迎光臨！你想先有禮貌地打招呼。", options: ["こんにちは", "さようなら", "おやすみなさい"], correct: 0, explain: "こんにちは（Konnichiwa）是白天常用的招呼語。" },
      { npc: "你想問：有什麼推薦？", trans: "選出最適合的日語說法。", options: ["これはいくらですか", "おすすめは何ですか", "駅はどこですか"], correct: 1, explain: "おすすめは何ですか（Osusume wa nan desu ka）就是『有什麼推薦？』。" },
      { npc: "餐點送來了，店員說：どうぞ。", trans: "用一句話向店員道謝。", options: ["すみません", "いただきます", "ありがとうございます"], correct: 2, explain: "ありがとうございます（Arigatō gozaimasu）是禮貌的『謝謝』。" }
    ], phrases: [["こんにちは", "你好"], ["おすすめは何ですか", "有什麼推薦？"], ["ありがとうございます", "謝謝您"]] },
    ko: { name: "韓國", flag: "🇰🇷", locale: "ko-KR", hello: "안녕하세요", roman: "Annyeonghaseyo", questions: [
      { npc: "店員說：어서 오세요!", trans: "歡迎光臨！你想先有禮貌地打招呼。", options: ["안녕하세요", "안녕히 가세요", "잘 자요"], correct: 0, explain: "안녕하세요（Annyeonghaseyo）是常用且有禮貌的招呼語。" },
      { npc: "你想問：推薦的餐點是什麼？", trans: "選出最適合的韓語說法。", options: ["얼마예요?", "화장실이 어디예요?", "추천 메뉴가 뭐예요?"], correct: 2, explain: "추천 메뉴가 뭐예요?（Chucheon menyuga mwoyeyo?）就是『推薦的餐點是什麼？』。" },
      { npc: "餐點送來了，店員說：맛있게 드세요!", trans: "用一句話向店員道謝。", options: ["감사합니다", "미안합니다", "괜찮아요"], correct: 0, explain: "감사합니다（Gamsahamnida）是正式、有禮貌的『謝謝』。" }
    ], phrases: [["안녕하세요", "你好"], ["추천 메뉴가 뭐예요?", "推薦的餐點是什麼？"], ["감사합니다", "謝謝"]] },
    de: { name: "德國", flag: "🇩🇪", locale: "de-DE", hello: "Guten Tag!", roman: "Guten Tag", questions: [
      { npc: "店員說：Guten Tag!", trans: "你想先有禮貌地打招呼。", options: ["Gute Nacht!", "Guten Tag!", "Auf Wiedersehen!"], correct: 1, explain: "Guten Tag 是白天常見、禮貌的招呼語。" },
      { npc: "你想問：您推薦什麼？", trans: "選出最適合的德語說法。", options: ["Was empfehlen Sie?", "Wo ist der Bahnhof?", "Wie viel kostet das?"], correct: 0, explain: "Was empfehlen Sie? 就是禮貌地詢問『您推薦什麼？』。" },
      { npc: "餐點送來了，店員說：Bitte schön!", trans: "用一句話向店員道謝。", options: ["Entschuldigung", "Bis morgen", "Danke schön!"], correct: 2, explain: "Danke schön 是親切、有禮貌的『非常謝謝』。" }
    ], phrases: [["Guten Tag!", "您好"], ["Was empfehlen Sie?", "您推薦什麼？"], ["Danke schön!", "非常謝謝"]] }
  };

  function readProgress() {
    try { return JSON.parse(localStorage.getItem(storageKey)) || {}; }
    catch { return {}; }
  }

  function complete(game) {
    const progress = readProgress();
    progress[game] = true;
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch {}
  }

  function escapeText(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1700);
  }

  function setQuery(game) {
    const url = new URL(location.href);
    if (game) url.searchParams.set("game", game); else url.searchParams.delete("game");
    history.replaceState({}, "", url);
  }

  function focusMain() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => app.focus({ preventScroll: true }), 120);
  }

  function renderHome() {
    clearInterval(breathTimer);
    stopFlightLoop();
    state = { game: null, step: 0, answers: [], scores: {}, locale: null, locked: false };
    setQuery(null);
    document.documentElement.style.setProperty("--page-bg", "#eef4fb");
    status.textContent = "三站任選｜免登入";
    const progress = readProgress();
    const doneCount = Object.values(progress).filter(Boolean).length;
    app.innerHTML = `
      <section class="screen">
        <div class="hero">
          <div>
            <p class="eyebrow">Ankang AI Experience Lab</p>
            <h1>掃一掃，讓課程<br><em>開始回應你。</em></h1>
            <p class="lead">三個 1–3 分鐘的智慧互動任務。做選擇、看回饋、帶走一張屬於自己的課程結果。</p>
            <span class="micro-note">所有分析只留在這台裝置，不需輸入姓名</span>
          </div>
          <div class="hero-visual" aria-hidden="true"><div class="orbit"></div><div class="ai-core">AI<span>×3</span></div></div>
        </div>
        <div class="section-title">
          <h2>選擇你的體驗</h2>
          <p>本機完成進度 ${doneCount} / 3</p>
        </div>
        <div class="game-grid">
          ${Object.entries(games).map(([key, game]) => `
            <article class="game-card ${key}">
              <div class="card-icon" aria-hidden="true">${game.icon}</div>
              <h3>${game.title}</h3>
              <p>${game.desc}</p>
              <div class="tag-row">${game.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
              <div class="card-actions">
                <button class="play-btn" type="button" data-start="${key}">開始體驗</button>
                <span class="done-mark">${progress[key] ? "✓ 已完成" : game.time}</span>
              </div>
              <button class="text-btn" type="button" data-copy="${key}">複製此體驗連結</button>
            </article>`).join("")}
        </div>
      </section>`;
    focusMain();
  }

  function topBar(theme, step, total, label) {
    const pct = Math.min(100, Math.round((step / total) * 100));
    return `<div class="experience-top"><div class="top-line"><button class="back-btn" type="button" data-home>← 回到三門課程</button><span class="step-label">${label}</span></div><div class="progress" style="--progress:${pct}%"><span></span></div></div>`;
  }

  function startGame(game) {
    clearInterval(breathTimer);
    stopFlightLoop();
    state = { game, step: 0, answers: [], scores: { safety: 0, planning: 0, ai: 0, map: 0, move: 0, recover: 0, language: 0 }, locale: null, locked: false };
    setQuery(game);
    status.textContent = `${games[game].title}｜${games[game].time}`;
    if (game === "drone") renderTaiwanFlightIntro();
    if (game === "body") renderBody();
    if (game === "language") renderLanguageSelect();
    focusMain();
  }

  function renderTaiwanFlightIntro() {
    app.innerHTML = `<section class="experience drone-theme screen">
      ${topBar("drone", 0, 1, "實景 FPV 航程簡報")}
      <div class="experience-body">
        <p class="kicker">REAL AERIAL FPV · XINDIAN</p>
        <h1>打開真實空拍影像，從安康高中飛到碧潭</h1>
        <p class="prompt">主畫面優先使用 Google 衛星地圖模擬無人機攝影機；降低高度會放大地面細節，升高則縮小並看見更大範圍。右側小地圖顯示重新規劃的完整航線，抵達八個特色地標時會顯示代表照片。</p>
        <div class="map-source-status ${String(window.AK_GOOGLE_MAPS_KEY || "").trim() ? "ready" : "pending"}"><b>${String(window.AK_GOOGLE_MAPS_KEY || "").trim() ? "GOOGLE SATELLITE READY" : "GOOGLE MAPS KEY 待設定"}</b><span>${String(window.AK_GOOGLE_MAPS_KEY || "").trim() ? "遊戲將載入 Google 衛星影像與 Google 導航地圖。" : "尚未填入金鑰時，會先使用國土測繪中心正射影像，避免現場出現空白地圖。"}</span></div>
        <div class="fpv-preview-card">
          <div class="preview-camera"><span class="preview-rec">● REC</span><i>⌖</i><b>安康高中</b><em>→ 碧潭</em></div>
          <div class="preview-map">N<br><strong>↗</strong><small>小地圖</small></div>
        </div>
        <div class="scenic-strip">${scenicLandmarks.map((item, i) => `<span><b>${i + 1}</b>${item.short}</span>`).join("")}</div>
        <ul class="flight-rules">
          <li><b>左搖桿</b><span>上下控制高度，左右控制機頭方向。</span></li>
          <li><b>右搖桿</b><span>向上推前進，左右控制橫向移動。</span></li>
          <li><b>AI 視覺</b><span>障礙物警示會疊在真實影像上；看見紅框時立即改變高度或方向。</span></li>
        </ul>
        <div class="action-row"><button class="primary-btn" type="button" data-launch-taiwan-flight>開啟實景 FPV 鏡頭 →</button></div>
        <p class="flight-tip">Google 地圖需要瀏覽器 API 金鑰；遊戲航線與障礙情境經過簡化，不可作為真實飛航導航。</p>
      </div>
    </section>`;
  }

  function launchTaiwanFlight() {
    stopFlightLoop();
    state.flight = {
      progress: 0, altitude: 18, lateral: 0, heading: routeBearing(0), speed: 0,
      controls: { throttle: 0, yaw: 0, pitch: 0, roll: 0 },
      battery: 100, collisions: 0, autopilotUsed: 0, auto: false,
      startedAt: performance.now(), finished: false, hitObstacles: new Set(),
      lastWarning: "", visited: new Set(), shownLandmarks: new Set(), activeLandmark: "", landmarkCardUntil: 0, arrivalAt: 0
    };
    renderTaiwanFlight();
    window.setTimeout(initFlightMaps, 0);
    flightLastTime = performance.now();
    flightFrame = requestAnimationFrame(taiwanFlightTick);
    focusMain();
  }

  function renderTaiwanFlight() {
    app.innerHTML = `<section class="experience drone-theme screen">
      ${topBar("drone", 0, 1, "FPV｜安康高中 → 碧潭")}
      <div class="experience-body fpv-body">
        <div class="flight-hud">
          <div class="hud-item"><small>BATTERY</small><strong id="hud-battery">100%</strong></div>
          <div class="hud-item"><small>ALTITUDE</small><strong id="hud-altitude">18 m</strong></div>
          <div class="hud-item"><small>ROUTE</small><strong id="hud-distance">0%</strong></div>
          <div class="hud-item"><small>NEXT</small><strong id="hud-next">陽光公園</strong></div>
        </div>
        <div class="fpv-layout">
          <div class="fpv-camera" id="flight-field" aria-label="Google 衛星地圖無人機空拍攝影機畫面">
            <div class="fpv-real-map" id="fpv-real-map" aria-hidden="true"></div>
            <canvas id="fpv-canvas"></canvas>
            <div class="camera-scanlines"></div>
            <div class="camera-top"><span class="rec-dot">● REC</span><span id="camera-heading">${headingName(routeBearing(0))} ${Math.round(routeBearing(0))}°</span><span>FPV 1080P</span></div>
            <div class="camera-crosshair" aria-hidden="true"><i></i><b></b></div>
            <div class="altitude-tape"><small>ALT</small><strong id="camera-altitude">18</strong><span>m</span></div>
            <div class="scene-label" id="scene-label">真實空拍｜安康高中</div>
            <div class="obstacle-alert" id="obstacle-alert" hidden>⚠ AI 偵測障礙物</div>
            <article class="landmark-arrival-card" id="landmark-arrival-card" aria-live="polite" aria-hidden="true">
              <div class="landmark-photo-frame"><img id="landmark-card-photo" src="" alt=""><span id="landmark-card-kind">景點實拍</span></div>
              <div class="landmark-card-copy"><small>LANDMARK REACHED</small><h2 id="landmark-card-title">抵達景點</h2><p id="landmark-card-intro"></p><a id="landmark-card-credit" href="#" target="_blank" rel="noreferrer"></a></div>
            </article>
            <a class="imagery-credit" id="imagery-credit" href="https://maps.nlsc.gov.tw/" target="_blank" rel="noreferrer">正射影像 © 內政部國土測繪中心</a>
            <div class="flight-message" id="flight-message">向上推右搖桿開始前進；左搖桿可先提高飛行高度。</div>
          </div>
          <aside class="mini-nav" id="mini-nav">
            <div class="mini-map-head"><span>航向小地圖</span><b>N ↑</b></div>
            <div class="real-map" id="real-map" aria-label="安康高中至碧潭的航向小地圖"></div>
            <a class="map-credit" id="mini-map-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a>
            <div class="route-chips">${scenicLandmarks.map(item => `<span class="route-chip" data-route-p="${item.p}"><i></i>${item.short}</span>`).join("")}</div>
          </aside>
        </div>
        <div class="remote-controller">
          <div class="stick-block"><strong>左搖桿</strong><small>高度／轉向</small><div class="joystick" data-joystick="left" aria-label="左搖桿：高度與轉向"><i class="axis-v">高<br>低</i><i class="axis-h">左　右</i><b class="stick-knob"></b></div></div>
          <div class="remote-screen"><small>FLIGHT MODE</small><strong id="remote-mode">MANUAL</strong><span id="remote-status">HOVER</span><button class="autopilot-btn" type="button" data-autopilot>AI 導航協助</button></div>
          <div class="stick-block"><strong>右搖桿</strong><small>前進／橫移</small><div class="joystick" data-joystick="right" aria-label="右搖桿：前進與橫向移動"><i class="axis-v">前<br>後</i><i class="axis-h">左　右</i><b class="stick-knob"></b></div></div>
        </div>
        <p class="flight-tip">鏡頭內紅框就是 AI 辨識到的障礙物；抵達特色地標時會跳出代表照片，抵達碧潭後自動完成課程。</p>
      </div>
    </section>`;
  }

  function stopFlightLoop() {
    if (flightFrame) cancelAnimationFrame(flightFrame);
    flightFrame = null;
    flightLastTime = 0;
    flightMapUpdateAt = 0;
    activeJoystick = null;
    flightDroneMarker = null;
    flightCameraMarkers = [];
    googleCameraMap = null;
    googleMiniMap = null;
    googleDroneMarker = null;
    googleMapsMode = false;
    flightFallbackStarted = false;
    if (flightMap) {
      try { flightMap.remove(); } catch {}
      flightMap = null;
    }
    if (flightCameraMap) {
      try { flightCameraMap.remove(); } catch {}
      flightCameraMap = null;
    }
  }

  function routeCoordinate(progress, lateral = 0) {
    const p = Math.max(0, Math.min(.9999, progress));
    const scaled = p * (realFlightRoute.length - 1);
    const index = Math.min(realFlightRoute.length - 2, Math.floor(scaled));
    const local = scaled - index;
    const a = realFlightRoute[index];
    const b = realFlightRoute[index + 1];
    return [a[0] + (b[0] - a[0]) * local, a[1] + (b[1] - a[1]) * local + lateral * .00035];
  }

  function flightRouteBounds() {
    const longitudes = realFlightRoute.map(coordinate => coordinate[0]);
    const latitudes = realFlightRoute.map(coordinate => coordinate[1]);
    return [[Math.min(...longitudes), Math.min(...latitudes)], [Math.max(...longitudes), Math.max(...latitudes)]];
  }

  function makeMapMarker(label, kind) {
    const element = document.createElement("div");
    element.className = `map-pin ${kind}`;
    element.innerHTML = `<i>${kind === "school" ? "🏫" : kind === "bitan" ? "🏞️" : "➤"}</i><span>${label}</span>`;
    return element;
  }

  function initFlightMaps() {
    const key = String(window.AK_GOOGLE_MAPS_KEY || "").trim();
    if (!key) return startFallbackMaps();
    loadGoogleMaps(key).then(initGoogleFlightMaps).catch(() => {
      startFallbackMaps("Google 地圖金鑰尚未通過驗證，已切換正射影像備援。");
    });
  }

  function loadGoogleMaps(key) {
    if (window.google?.maps) return Promise.resolve(window.google.maps);
    if (googleMapsPromise) return googleMapsPromise;
    googleMapsPromise = new Promise((resolve, reject) => {
      const callback = "__ankangGoogleMapsReady";
      let settled = false;
      const timeout = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error("Google Maps load timeout"));
      }, 10000);
      window.gm_authFailure = () => {
        if (!settled) {
          settled = true;
          window.clearTimeout(timeout);
          reject(new Error("Google Maps authentication failed"));
        } else if (state.flight) {
          startFallbackMaps("Google 地圖金鑰驗證失敗，已切換正射影像備援。");
        }
      };
      window[callback] = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        delete window[callback];
        resolve(window.google.maps);
      };
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=${callback}`;
      script.async = true;
      script.onerror = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        reject(new Error("Google Maps script failed"));
      };
      document.head.appendChild(script);
    });
    return googleMapsPromise;
  }

  function startFallbackMaps(message = "") {
    if (flightFallbackStarted || !state.flight) return;
    flightFallbackStarted = true;
    googleMapsMode = false;
    googleCameraMap = null;
    googleMiniMap = null;
    googleDroneMarker = null;
    document.querySelector("#fpv-real-map")?.replaceChildren();
    document.querySelector("#real-map")?.replaceChildren();
    const field = document.querySelector("#flight-field");
    const panel = document.querySelector("#mini-nav");
    field?.classList.remove("google-imagery");
    panel?.classList.remove("google-map-ready");
    const imageryCredit = document.querySelector("#imagery-credit");
    if (imageryCredit) { imageryCredit.textContent = "正射影像 © 內政部國土測繪中心"; imageryCredit.href = "https://maps.nlsc.gov.tw/"; }
    const miniCredit = document.querySelector("#mini-map-credit");
    if (miniCredit) { miniCredit.textContent = "© OpenStreetMap"; miniCredit.href = "https://www.openstreetmap.org/copyright"; }
    initRealFlightMap();
    initFpvRealMap();
    if (message) updateFlightMessage(message);
  }

  function googlePosition(coordinate) {
    return { lng: coordinate[0], lat: coordinate[1] };
  }

  function initGoogleFlightMaps() {
    const cameraContainer = document.querySelector("#fpv-real-map");
    const miniContainer = document.querySelector("#real-map");
    const field = document.querySelector("#flight-field");
    const panel = document.querySelector("#mini-nav");
    const maps = window.google?.maps;
    if (!cameraContainer || !miniContainer || !field || !panel || !maps || !state.flight) return;
    try {
      const routePath = realFlightRoute.map(googlePosition);
      const baseOptions = { disableDefaultUI: true, gestureHandling: "none", keyboardShortcuts: false, clickableIcons: false, backgroundColor: "#0b2f46" };
      googleCameraMap = new maps.Map(cameraContainer, { ...baseOptions, center: googlePosition(schoolCoordinate), zoom: 19, mapTypeId: maps.MapTypeId.SATELLITE, tilt: 0, heading: routeBearing(0), isFractionalZoomEnabled: true });
      googleMiniMap = new maps.Map(miniContainer, { ...baseOptions, center: googlePosition(schoolCoordinate), zoom: 14.5, mapTypeId: maps.MapTypeId.ROADMAP, isFractionalZoomEnabled: true });
      new maps.Polyline({ path: routePath, geodesic: true, strokeColor: "#041c33", strokeOpacity: .5, strokeWeight: 9, map: googleCameraMap });
      new maps.Polyline({ path: routePath, geodesic: true, strokeColor: "#63fff2", strokeOpacity: .9, strokeWeight: 3, map: googleCameraMap });
      new maps.Polyline({ path: routePath, geodesic: true, strokeColor: "#16cfc8", strokeOpacity: .95, strokeWeight: 4, map: googleMiniMap });
      scenicLandmarks.forEach(item => new maps.Marker({
        position: googlePosition(item.coord),
        map: googleCameraMap,
        title: item.label,
        label: { text: item.short, color: "#ffffff", fontSize: "11px", fontWeight: "700" },
        icon: { path: maps.SymbolPath.CIRCLE, scale: item.type === "bitan" ? 7 : 5, fillColor: item.type === "bitan" ? "#ffc64e" : "#19ddd4", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2 }
      }));
      new maps.Marker({ position: googlePosition(schoolCoordinate), map: googleMiniMap, title: "安康高中", label: "起" });
      new maps.Marker({ position: googlePosition(bitanCoordinate), map: googleMiniMap, title: "碧潭", label: "終" });
      googleDroneMarker = new maps.Marker({
        position: googlePosition(schoolCoordinate), map: googleMiniMap, title: "目前位置",
        icon: { path: maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 6, fillColor: "#13e5dd", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2, rotation: routeBearing(0) }
      });
      googleMapsMode = true;
      field.classList.add("imagery-ready", "google-imagery");
      panel.classList.add("map-ready", "google-map-ready");
      const imageryCredit = document.querySelector("#imagery-credit");
      if (imageryCredit) { imageryCredit.textContent = "Google 衛星地圖"; imageryCredit.href = "https://www.google.com/maps"; }
      const miniCredit = document.querySelector("#mini-map-credit");
      if (miniCredit) { miniCredit.textContent = "Google Maps"; miniCredit.href = "https://www.google.com/maps"; }
      updateGoogleFlightMaps(true);
    } catch {
      startFallbackMaps("Google 地圖初始化失敗，已切換正射影像備援。");
    }
  }

  function nlscImageryStyle() {
    return {
      version: 8,
      sources: {
        "nlsc-photo": {
          type: "raster",
          tiles: ["https://wmts.nlsc.gov.tw/wmts/PHOTO2/default/EPSG:3857/{z}/{y}/{x}"],
          tileSize: 256,
          minzoom: 0,
          maxzoom: 19,
          attribution: "© 內政部國土測繪中心"
        }
      },
      layers: [{ id: "nlsc-photo-base", type: "raster", source: "nlsc-photo", paint: { "raster-fade-duration": 180, "raster-saturation": .08, "raster-contrast": .08 } }]
    };
  }

  function routeBearing(progress) {
    const here = routeCoordinate(progress);
    const ahead = routeCoordinate(Math.min(.999, progress + .012));
    const dx = (ahead[0] - here[0]) * Math.cos((here[1] + ahead[1]) * Math.PI / 360);
    const dy = ahead[1] - here[1];
    return (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
  }

  function makeFpvLandmarkMarker(item) {
    const element = document.createElement("div");
    element.className = `fpv-landmark-pin ${item.type}`;
    element.innerHTML = `<i></i><span>${item.short}</span>`;
    return element;
  }

  function initFpvRealMap() {
    const container = document.querySelector("#fpv-real-map");
    const field = document.querySelector("#flight-field");
    if (!container || !field || !state.flight) return;
    if (!window.maplibregl) {
      window.addEventListener("maplibre-ready", initFpvRealMap, { once: true });
      return;
    }
    try {
      flightCameraMap = new window.maplibregl.Map({
        container,
        style: nlscImageryStyle(),
        center: schoolCoordinate,
        zoom: 17.8,
        bearing: routeBearing(0),
        pitch: 66,
        maxPitch: 78,
        interactive: false,
        renderWorldCopies: false,
        attributionControl: false,
        fadeDuration: 0
      });
      flightCameraMap.on("load", () => {
        if (!flightCameraMap || !document.querySelector("#fpv-real-map")) return;
        flightCameraMap.addSource("camera-route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: realFlightRoute } } });
        flightCameraMap.addLayer({ id: "camera-route-shadow", type: "line", source: "camera-route", paint: { "line-color": "#031a2e", "line-width": 8, "line-opacity": .42 } });
        flightCameraMap.addLayer({ id: "camera-route-line", type: "line", source: "camera-route", paint: { "line-color": "#66fff2", "line-width": 3, "line-opacity": .84, "line-dasharray": [1.2, 1.2] } });
        flightCameraMarkers = scenicLandmarks.map(item => new window.maplibregl.Marker({ element: makeFpvLandmarkMarker(item), anchor: "bottom" }).setLngLat(item.coord).addTo(flightCameraMap));
        field.classList.add("imagery-ready");
        updateFpvRealMap(true);
      });
      flightCameraMap.on("error", () => field.classList.add("imagery-delayed"));
    } catch {
      flightCameraMap = null;
      field.classList.add("imagery-delayed");
    }
  }

  function initRealFlightMap() {
    const container = document.querySelector("#real-map");
    const panel = document.querySelector("#mini-nav");
    if (!container || !panel || !state.flight) return;
    if (!window.maplibregl) {
      window.addEventListener("maplibre-ready", initRealFlightMap, { once: true });
      return;
    }
    try {
      flightMap = new window.maplibregl.Map({
        container,
        style: { version: 8, sources: { "osm-raster": { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, minzoom: 0, maxzoom: 19, attribution: "© OpenStreetMap contributors" } }, layers: [{ id: "osm-base", type: "raster", source: "osm-raster" }] },
        center: schoolCoordinate, zoom: 14.1, bearing: 0, pitch: 0,
        interactive: false, renderWorldCopies: false, attributionControl: false
      });
      flightMap.on("load", () => {
        if (!flightMap || !document.querySelector("#real-map")) return;
        flightMap.addSource("flight-route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: realFlightRoute } } });
        flightMap.addLayer({ id: "flight-route-glow", type: "line", source: "flight-route", paint: { "line-color": "#073457", "line-width": 9, "line-opacity": .4 } });
        flightMap.addLayer({ id: "flight-route-line", type: "line", source: "flight-route", paint: { "line-color": "#19f4ea", "line-width": 4, "line-dasharray": [1.4, 1.4] } });
        new window.maplibregl.Marker({ element: makeMapMarker("安康", "school"), anchor: "bottom" }).setLngLat(schoolCoordinate).addTo(flightMap);
        new window.maplibregl.Marker({ element: makeMapMarker("碧潭", "bitan"), anchor: "bottom" }).setLngLat(bitanCoordinate).addTo(flightMap);
        flightDroneMarker = new window.maplibregl.Marker({ element: makeMapMarker("航機", "current"), anchor: "center" }).setLngLat(schoolCoordinate).addTo(flightMap);
        panel.classList.add("map-ready");
        flightMap.fitBounds(flightRouteBounds(), { padding: 18, duration: 0 });
        updateRealFlightMap(true);
      });
    } catch { flightMap = null; }
  }

  function updateFpvRealMap(force = false) {
    const f = state.flight;
    if (!f || !flightCameraMap || !flightCameraMap.isStyleLoaded()) return;
    const center = routeCoordinate(f.progress, f.lateral);
    const heightRatio = Math.max(0, Math.min(1, (f.altitude - 6) / 52));
    const yawOffset = ((f.heading - routeBearing(f.progress) + 540) % 360 - 180) * .38;
    flightCameraMap.jumpTo({
      center,
      zoom: 19 - heightRatio * 2.2,
      bearing: routeBearing(f.progress) + yawOffset,
      pitch: 72 - heightRatio * 15
    });
    if (force) flightCameraMap.resize();
  }

  function updateGoogleFlightMaps(force = false) {
    const f = state.flight;
    if (!f || !googleMapsMode || !googleCameraMap || !googleMiniMap) return;
    const coordinate = routeCoordinate(f.progress, f.lateral);
    const center = googlePosition(coordinate);
    const heightRatio = Math.max(0, Math.min(1, (f.altitude - 6) / 52));
    const yawOffset = ((f.heading - routeBearing(f.progress) + 540) % 360 - 180) * .38;
    googleCameraMap.moveCamera({
      center,
      zoom: 19.4 - heightRatio * 2.7,
      heading: routeBearing(f.progress) + yawOffset,
      tilt: 0
    });
    if (force) {
      const bounds = new window.google.maps.LatLngBounds();
      realFlightRoute.forEach(item => bounds.extend(googlePosition(item)));
      googleMiniMap.fitBounds(bounds, 18);
    }
    googleDroneMarker?.setPosition(center);
  }

  function updateRealFlightMap(force = false) {
    const f = state.flight;
    if (!f) return;
    const now = performance.now();
    if (!force && now - flightMapUpdateAt < 65) return;
    flightMapUpdateAt = now;
    const center = routeCoordinate(f.progress, f.lateral);
    if (googleMapsMode) {
      updateGoogleFlightMaps(force);
      return;
    }
    if (flightMap && flightMap.isStyleLoaded()) {
      flightDroneMarker?.setLngLat(center);
      if (force) {
        flightMap.resize();
        flightMap.fitBounds(flightRouteBounds(), { padding: 18, duration: 0 });
      }
    }
    updateFpvRealMap(force);
  }

  function useTaiwanAutopilot() {
    const f = state.flight;
    if (!f || f.finished || f.autopilotUsed) return;
    f.autopilotUsed = 1;
    f.auto = true;
    const button = document.querySelector("[data-autopilot]");
    if (button) { button.disabled = true; button.textContent = "AI 巡航中"; }
    updateFlightMessage("AI 已接管：會自動調整高度，依小地圖航線飛往碧潭。");
  }

  function obstacleRisk(f, obstacle) {
    if (obstacle.type === "wires") return f.altitude < 25 && Math.abs(f.lateral - obstacle.lane) < .55;
    return f.altitude > 20 && f.altitude < 40 && Math.abs(f.lateral - obstacle.lane) < .52;
  }

  function showLandmarkCard(item, now = performance.now()) {
    const f = state.flight;
    const card = document.querySelector("#landmark-arrival-card");
    if (!f || !card) return;
    const photo = document.querySelector("#landmark-card-photo");
    const kind = document.querySelector("#landmark-card-kind");
    const title = document.querySelector("#landmark-card-title");
    const intro = document.querySelector("#landmark-card-intro");
    const credit = document.querySelector("#landmark-card-credit");
    if (photo) { photo.src = item.photo; photo.alt = item.photoAlt; }
    if (kind) kind.textContent = item.photoKind;
    if (title) title.textContent = item.label;
    if (intro) intro.textContent = item.intro;
    if (credit) { credit.textContent = `照片來源：${item.credit}`; credit.href = item.sourceUrl; }
    f.activeLandmark = item.type;
    f.landmarkCardUntil = now + (item.type === "bitan" ? 3600 : 4200);
    card.setAttribute("aria-hidden", "false");
    card.classList.remove("show");
    requestAnimationFrame(() => card.classList.add("show"));
    document.querySelector("#scene-label")?.classList.add("is-card-open");
  }

  function hideLandmarkCard() {
    const f = state.flight;
    const card = document.querySelector("#landmark-arrival-card");
    if (card) { card.classList.remove("show"); card.setAttribute("aria-hidden", "true"); }
    document.querySelector("#scene-label")?.classList.remove("is-card-open");
    if (f) f.activeLandmark = "";
  }

  function taiwanFlightTick(now) {
    const f = state.flight;
    if (!f || f.finished) return stopFlightLoop();
    const dt = Math.min(.05, (now - flightLastTime) / 1000 || .016);
    flightLastTime = now;

    if (f.auto) {
      const targetAltitude = f.progress > .53 && f.progress < .70 ? 47 : 34;
      f.altitude += (targetAltitude - f.altitude) * Math.min(1, dt * 1.4);
      f.lateral += (0 - f.lateral) * Math.min(1, dt * 1.8);
      const desiredHeading = routeBearing(f.progress);
      const headingDelta = ((desiredHeading - f.heading + 540) % 360) - 180;
      f.heading = (f.heading + headingDelta * Math.min(1, dt * 2.2) + 360) % 360;
      f.speed = .027;
    } else {
      f.altitude = Math.max(6, Math.min(58, f.altitude + f.controls.throttle * 13 * dt));
      f.heading = (f.heading + f.controls.yaw * 42 * dt + 360) % 360;
      f.lateral = Math.max(-1, Math.min(1, f.lateral + (f.controls.roll * .34 + f.controls.yaw * .1) * dt));
      f.speed = f.controls.pitch > .08 ? .005 + f.controls.pitch * .014 : f.controls.pitch < -.12 ? f.controls.pitch * .006 : 0;
    }

    f.progress = Math.max(0, Math.min(1, f.progress + f.speed * dt));
    f.battery = Math.max(0, f.battery - dt * (.17 + Math.abs(f.speed) * 5));

    let warning = null;
    for (const obstacle of flightObstacles) {
      const distance = obstacle.p - f.progress;
      const risky = obstacleRisk(f, obstacle);
      if (distance > 0 && distance < .10 && risky) warning = obstacle;
      if (Math.abs(distance) < .012 && risky && !f.hitObstacles.has(obstacle.type)) {
        f.hitObstacles.add(obstacle.type);
        f.progress = Math.max(0, f.progress - .018);
        f.collisions += 1;
        f.battery = Math.max(0, f.battery - 5);
        f.auto = false;
        f.speed = 0;
        updateFlightMessage(`⚠ AI 緊急避障：${obstacle.label}太近，無人機已自動後退。`);
      }
    }

    if (warning && f.lastWarning !== warning.type) {
      f.lastWarning = warning.type;
      updateFlightMessage(`⚠ 鏡頭偵測到${warning.label}：請調整${warning.type === "wires" ? "高度" : "高度或橫向位置"}。`);
    } else if (!warning) f.lastWarning = "";

    for (const item of scenicLandmarks) {
      if (f.progress >= item.p) {
        f.visited.add(item.type);
        if (!f.shownLandmarks.has(item.type)) {
          f.shownLandmarks.add(item.type);
          showLandmarkCard(item, now);
          if (item.type === "bitan") {
            f.arrivalAt = now;
            f.progress = .985;
            f.speed = 0;
            f.auto = false;
            updateFlightMessage("✓ 已抵達碧潭：欣賞終點代表照片，課程即將完成。");
          } else {
            updateFlightMessage(`✓ 抵達${item.label}：鏡頭已辨識景點，請沿小地圖繼續前進。`);
          }
        }
      }
    }
    if (f.activeLandmark && now >= f.landmarkCardUntil) hideLandmarkCard();
    if (f.arrivalAt) {
      updateTaiwanFlightDom(null);
      if (now - f.arrivalAt >= 3300) return finishTaiwanFlight(true);
      flightFrame = requestAnimationFrame(taiwanFlightTick);
      return;
    }
    if (f.battery <= 0) return finishTaiwanFlight(false);
    updateTaiwanFlightDom(warning);
    flightFrame = requestAnimationFrame(taiwanFlightTick);
  }

  function canvasMetrics(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  }

  function roundedPath(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + width, y, x + width, y + height, r); ctx.arcTo(x + width, y + height, x, y + height, r); ctx.arcTo(x, y + height, x, y, r); ctx.arcTo(x, y, x + width, y, r); ctx.closePath();
  }

  function drawLandmarkSprite(ctx, item, x, y, scale) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.lineJoin = "round"; ctx.lineCap = "round";
    if (item.type === "school") {
      ctx.fillStyle = "#f6f2dc"; ctx.fillRect(-48, -42, 96, 42); ctx.fillStyle = "#d94e45"; ctx.beginPath(); ctx.moveTo(-55,-42); ctx.lineTo(0,-66); ctx.lineTo(55,-42); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#3c80b6"; for (let i=-32;i<=32;i+=22) ctx.fillRect(i,-29,12,15); ctx.fillStyle="#123f73"; ctx.fillRect(-17,-18,34,18); ctx.fillStyle="#fff"; ctx.font="900 11px sans-serif"; ctx.textAlign="center"; ctx.fillText("AKHS",0,-6);
    } else if (item.type === "park") {
      ctx.fillStyle="#58b86f"; ctx.beginPath(); ctx.ellipse(0,-8,62,31,0,0,Math.PI*2); ctx.fill(); ctx.strokeStyle="#f5a347"; ctx.lineWidth=7; ctx.beginPath(); ctx.ellipse(0,-8,48,23,0,0,Math.PI*2); ctx.stroke(); ctx.strokeStyle="#fff"; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(24,-28,34,Math.PI,0); ctx.stroke(); ctx.fillStyle="#ffe15b"; ctx.beginPath(); ctx.arc(-35,-49,13,0,Math.PI*2); ctx.fill();
    } else if (item.type === "xizhou") {
      ctx.fillStyle="#3e9f68";ctx.beginPath();ctx.ellipse(0,-12,63,28,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#55c6ec";ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-67,-1);ctx.quadraticCurveTo(-15,-35,67,-8);ctx.stroke();ctx.fillStyle="#d4f08a";for(let i=-42;i<=42;i+=21){ctx.beginPath();ctx.arc(i,-37-Math.abs(i)*.15,10,0,Math.PI*2);ctx.fill();}
    } else if (item.type === "hemei") {
      ctx.fillStyle="#173f2a";ctx.beginPath();ctx.arc(-24,-20,34,0,Math.PI*2);ctx.arc(19,-31,39,0,Math.PI*2);ctx.fill();ctx.fillStyle="#9cff72";for(let i=0;i<10;i++){const a=i*.7;ctx.beginPath();ctx.arc(Math.sin(a)*48,-15-Math.cos(a)*32,3,0,Math.PI*2);ctx.fill();}
    } else if (item.type === "temple") {
      ctx.fillStyle="#c73d3d"; ctx.fillRect(-38,-36,76,36); ctx.fillStyle="#f0c34a"; ctx.beginPath(); ctx.moveTo(-52,-36);ctx.lineTo(-22,-59);ctx.lineTo(0,-48);ctx.lineTo(22,-59);ctx.lineTo(52,-36);ctx.closePath();ctx.fill(); ctx.fillStyle="#b92f33";ctx.fillRect(-29,-29,8,29);ctx.fillRect(21,-29,8,29);ctx.fillStyle="#f5df86";ctx.beginPath();ctx.arc(0,-20,9,0,Math.PI*2);ctx.fill();
    } else if (item.type === "waterworks") {
      ctx.fillStyle="#9fd8ed";for(let i=-1;i<=1;i++){ctx.beginPath();ctx.arc(i*36,-23,19,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#eefbff";ctx.lineWidth=4;ctx.stroke();}ctx.fillStyle="#eef5f3";ctx.fillRect(-62,-8,124,12);ctx.fillStyle="#2275a8";ctx.fillRect(-30,-52,60,12);
    } else if (item.type === "wenshan") {
      ctx.fillStyle="#2f8c54";for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(-43+i*29,-16-i*6,31,10,-.12,0,Math.PI*2);ctx.fill();}ctx.fillStyle="#b75a3e";ctx.fillRect(-18,-56,36,32);ctx.fillStyle="#f3d8b5";ctx.beginPath();ctx.moveTo(-27,-56);ctx.lineTo(0,-72);ctx.lineTo(27,-56);ctx.closePath();ctx.fill();ctx.fillStyle="#f0dc7e";ctx.beginPath();ctx.arc(43,-58,10,0,Math.PI*2);ctx.fill();
    } else {
      ctx.fillStyle="#43b8d1";ctx.fillRect(-75,-14,150,24);ctx.strokeStyle="#e6504d";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-55,-12);ctx.lineTo(-55,-65);ctx.moveTo(55,-12);ctx.lineTo(55,-65);ctx.moveTo(-55,-59);ctx.quadraticCurveTo(0,-26,55,-59);ctx.stroke();ctx.strokeStyle="#fff";ctx.lineWidth=2;for(let i=-45;i<50;i+=15){ctx.beginPath();ctx.moveTo(i,-52);ctx.lineTo(i,-13);ctx.stroke();}
    }
    roundedPath(ctx,-54,8,108,22,8);ctx.fillStyle="rgba(4,34,60,.86)";ctx.fill();ctx.fillStyle="#fff";ctx.font="800 12px 'Microsoft JhengHei',sans-serif";ctx.textAlign="center";ctx.fillText(item.label,0,23); ctx.restore();
  }

  function drawObstacleSprite(ctx, obstacle, x, y, scale) {
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.lineJoin="round";
    if (obstacle.type === "wires") {
      ctx.strokeStyle="#5b6068";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-66,35);ctx.lineTo(-49,-52);ctx.moveTo(66,35);ctx.lineTo(49,-52);ctx.stroke();ctx.lineWidth=3;for(let n=-1;n<=1;n++){ctx.beginPath();ctx.moveTo(-72,-34+n*17);ctx.quadraticCurveTo(0,-22+n*17,72,-34+n*17);ctx.stroke();}
    } else {
      ctx.strokeStyle="#252f43";ctx.lineWidth=5;for(let i=-34;i<=34;i+=34){ctx.beginPath();ctx.moveTo(i,-10);ctx.quadraticCurveTo(i+10,-25,i+21,-10);ctx.stroke();}
    }
    ctx.strokeStyle="#ff565c";ctx.lineWidth=3;ctx.setLineDash([7,5]);ctx.strokeRect(-82,-67,164,112);ctx.setLineDash([]);roundedPath(ctx,-60,-88,120,24,7);ctx.fillStyle="#e83f4b";ctx.fill();ctx.fillStyle="#fff";ctx.font="900 12px sans-serif";ctx.textAlign="center";ctx.fillText(`AI：${obstacle.label}`,0,-71);ctx.restore();
  }

  function drawFPVScene() {
    const f = state.flight;
    const canvas = document.querySelector("#fpv-canvas");
    if (!f || !canvas) return;
    const { ctx, width: w, height: h } = canvasMetrics(canvas);
    ctx.clearRect(0, 0, w, h);
    const field = document.querySelector("#flight-field");
    if (!field?.classList.contains("imagery-ready")) {
      const loading = ctx.createLinearGradient(0, 0, 0, h);
      loading.addColorStop(0, "#163b52"); loading.addColorStop(1, "#08243a");
      ctx.fillStyle = loading; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(92,244,234,.15)"; ctx.beginPath(); ctx.arc(w / 2, h / 2 - 10, 42, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#63f2e8"; ctx.lineWidth = 4; ctx.setLineDash([18, 10]); ctx.beginPath(); ctx.arc(w / 2, h / 2 - 10, 32, 0, Math.PI * 1.65); ctx.stroke(); ctx.setLineDash([]);
      const useGoogle = Boolean(String(window.AK_GOOGLE_MAPS_KEY || "").trim());
      ctx.fillStyle = "#eafffd"; ctx.font = "800 14px 'Microsoft JhengHei',sans-serif"; ctx.textAlign = "center"; ctx.fillText(useGoogle ? "正在載入 Google 衛星地圖…" : "正在載入臺灣正射空拍影像…", w / 2, h / 2 + 60);
      ctx.font = "500 10px 'Microsoft JhengHei',sans-serif"; ctx.fillStyle = "rgba(234,255,253,.68)"; ctx.fillText(useGoogle ? "需要網路連線｜影像來源：Google Maps" : "需要網路連線｜影像來源：內政部國土測繪中心", w / 2, h / 2 + 80);
      return;
    }
    const horizon = h * .28;
    const vanishingX = w * .5 - f.lateral * w * .18 - ((f.heading - routeBearing(f.progress) + 540) % 360 - 180) * .45;
    flightObstacles.forEach(item => {
      const d = item.p - f.progress;
      if (d < -.02 || d > .16) return;
      const close = 1 - Math.max(0, d) / .16;
      const y = horizon + Math.pow(close, 1.5) * (h - horizon - 70);
      const scale = .35 + Math.pow(close, 1.6) * 1.2;
      const x = vanishingX + (item.lane - f.lateral) * w * .42 * close;
      drawObstacleSprite(ctx, item, x, y, scale);
    });
    const shade = ctx.createRadialGradient(w / 2, h / 2, h * .2, w / 2, h / 2, h * .78);
    shade.addColorStop(0, "rgba(0,0,0,0)"); shade.addColorStop(1, "rgba(0,13,27,.30)");
    ctx.fillStyle = shade; ctx.fillRect(0, 0, w, h);
  }

  function updateTaiwanFlightDom(warning) {
    const f = state.flight;
    document.querySelector("#hud-battery").textContent = `${Math.ceil(f.battery)}%`;
    document.querySelector("#hud-altitude").textContent = `${Math.round(f.altitude)} m`;
    document.querySelector("#hud-distance").textContent = `${Math.round(f.progress * 100)}%`;
    document.querySelector("#camera-altitude").textContent = Math.round(f.altitude);
    document.querySelector("#camera-heading").textContent = `${headingName(f.heading)} ${Math.round(f.heading)}°`;
    const next = scenicLandmarks.find(item => item.p > Math.max(.02, f.progress + .01)) || scenicLandmarks.at(-1);
    document.querySelector("#hud-next").textContent = next.short;
    const current = scenicLandmarks.slice().reverse().find(item => f.progress >= item.p - .035) || scenicLandmarks[0];
    const sceneLabel = document.querySelector("#scene-label");
    if (sceneLabel) sceneLabel.textContent = `真實空拍｜${current.label}`;
    document.querySelector("#remote-mode").textContent = f.auto ? "AI AUTO" : "MANUAL";
    document.querySelector("#remote-status").textContent = f.auto ? "ROUTE LOCK" : f.speed > .002 ? "FORWARD" : "HOVER";
    const alert = document.querySelector("#obstacle-alert");
    alert.hidden = !warning; if (warning) alert.textContent = `⚠ ${warning.label}｜立即迴避`;
    document.querySelectorAll(".route-chip").forEach(chip=>{const p=Number(chip.dataset.routeP);chip.classList.toggle("done",p<=.02||f.progress>=p);chip.classList.toggle("current",p===next.p);});
    drawFPVScene();
    updateRealFlightMap();
  }

  function headingName(degrees) {
    return ["N","NE","E","SE","S","SW","W","NW"][Math.round(degrees/45)%8];
  }

  function updateFlightMessage(message) {
    const element = document.querySelector("#flight-message");
    if (element) element.textContent = message;
  }

  function finishTaiwanFlight(success) {
    const f = state.flight;
    if (!f || f.finished) return;
    f.finished = true; f.success = success; f.elapsed = Math.max(1, Math.round((performance.now() - f.startedAt) / 1000));
    stopFlightLoop(); complete("drone");
    const safety = Math.max(0, 100 - f.collisions * 18);
    const title = success ? "實景 FPV 鏡頭抵達碧潭，航程完成！" : "電量耗盡，再試一次！";
    const copy = success ? `你從安康高中起飛，在 ${f.elapsed} 秒內經過 ${f.visited.size} 個新店特色地標並抵達碧潭；AI 共啟動 ${f.collisions} 次緊急避障。` : "這次沒有在電量耗盡前抵達碧潭。重新練習雙搖桿，或啟動一次 AI 導航協助。";
    app.innerHTML = `<section class="experience drone-theme screen">${topBar("drone",1,1,"抵達碧潭")}<div class="experience-body"><div class="result-badge">🏞️</div><p class="kicker">REAL FPV ARRIVED · ANKANG → BITAN</p><h1 class="result-title">${title}</h1><p class="prompt result-copy">${copy}</p><div class="score-grid"><div class="score-item"><span>虛擬航程</span><strong>${f.elapsed}<small> 秒</small></strong><div class="score-bar"><i style="width:${Math.max(10,Math.min(100,130-f.elapsed))}%"></i></div></div><div class="score-item"><span>安全飛行</span><strong>${safety}<small> 分</small></strong><div class="score-bar"><i style="width:${safety}%"></i></div></div><div class="score-item"><span>地標辨識</span><strong>${f.visited.size}<small> / ${scenicLandmarks.length}</small></strong><div class="score-bar"><i style="width:${f.visited.size/scenicLandmarks.length*100}%"></i></div></div></div><div class="feedback"><strong>你剛才體驗了真正的無人機操作邏輯</strong><p>Google 衛星地圖提供地面視野、小地圖負責完整航向；降低高度看清細節，升高則掌握更大範圍，AI 視覺同時協助標示障礙物。</p></div><div class="action-row"><button class="primary-btn" type="button" data-launch-taiwan-flight>再飛一次</button><button class="secondary-btn" type="button" data-home>挑戰另一門課</button></div></div></section>`;
    focusMain();
  }

  function renderDrone() {
    const stage = droneStages[state.step];
    const result = state.step >= droneStages.length;
    app.innerHTML = `<section class="experience drone-theme screen">
      ${topBar("drone", result ? 3 : state.step, 3, result ? "任務完成" : `飛行任務 ${state.step + 1} / 3`)}
      <div class="experience-body">${result ? droneResult() : `
        <p class="kicker">${stage.kicker}</p>
        <h1>${stage.title}</h1>
        <p class="prompt">${stage.prompt}</p>
        <div class="mission-map" aria-hidden="true"><span class="map-point start"></span><span class="mini-drone">✣</span><span class="map-point goal"></span><span class="telemetry">BAT 68% · GPS OK</span></div>
        <div class="choice-list">${stage.choices.map((c, i) => `<button class="choice" type="button" data-drone-choice="${i}"><span class="choice-key">${String.fromCharCode(65 + i)}</span><span><strong>${c.title}</strong><small>${c.sub}</small></span><span class="choice-arrow">›</span></button>`).join("")}</div>
        <div id="feedback-slot"></div>`}</div>
      </section>`;
  }

  function pickDrone(index) {
    if (state.locked) return;
    state.locked = true;
    const selected = droneStages[state.step].choices[index];
    Object.entries(selected.score).forEach(([key, value]) => state.scores[key] += value);
    state.answers.push(index);
    document.querySelectorAll("[data-drone-choice]").forEach((btn, i) => { btn.disabled = true; if (i === index) btn.classList.add("selected"); });
    document.querySelector("#feedback-slot").innerHTML = `<div class="feedback"><strong>AI 飛航教練回饋</strong><p>${selected.feedback}</p></div><div class="action-row"><button class="primary-btn" type="button" data-drone-next>${state.step === 2 ? "查看任務報告" : "繼續飛行"} →</button></div>`;
  }

  function droneResult() {
    complete("drone");
    const s = state.scores;
    const total = s.safety + s.planning + s.ai;
    const title = total >= 14 ? "智慧救援領航員" : total >= 8 ? "冷靜任務飛行員" : "勇敢的飛行實習生";
    const copy = total >= 14 ? "你能把感測資訊、風險與航線一起思考，展現了人機協作需要的全局判斷。" : total >= 8 ? "你已經能在時間與安全之間做選擇；多使用交叉驗證，任務會更加穩定。" : "你的直覺很有行動力；下一步是讓感測資料與安全檢查先替行動多爭取幾秒。";
    const scores = [["安全判斷", s.safety, 8], ["路徑規劃", s.planning, 7], ["AI 協作", s.ai, 5]];
    return `<div class="result-badge">✣</div><p class="kicker">MISSION COMPLETE</p><h1 class="result-title">${title}</h1><p class="prompt result-copy">${copy}</p><div class="score-grid">${scores.map(([label, val, max]) => { const pct = Math.max(8, Math.min(100, Math.round(((val + 2) / (max + 2)) * 100))); return `<div class="score-item"><span>${label}</span><strong>${Math.max(0, val)}<small> / ${max}</small></strong><div class="score-bar"><i style="width:${pct}%"></i></div></div>`; }).join("")}</div><div class="feedback"><strong>這正是課程裡的四個關鍵</strong><p>飛行基礎 → 指令設定 → AI 視覺辨識 → 智慧避障。回到易拉展，找找你剛才在哪一步用到了它們。</p></div><div class="action-row"><button class="primary-btn" type="button" data-restart="drone">再飛一次</button><button class="secondary-btn" type="button" data-home>挑戰另一門課</button></div>`;
  }

  function renderBody() {
    const result = state.step >= bodyQuestions.length;
    const q = bodyQuestions[state.step];
    app.innerHTML = `<section class="experience body-theme screen">${topBar("body", result ? 4 : state.step, 4, result ? "覺察完成" : `覺察問題 ${state.step + 1} / 4`)}<div class="experience-body">${result ? bodyResult() : `<p class="kicker">AI BODY AWARENESS</p><h1>${q.title}</h1><p class="prompt">${q.prompt}</p>${state.step === 0 ? `<div class="body-aura" aria-hidden="true"><span class="body-figure">♙</span></div>` : ""}<div class="choice-list">${q.choices.map((c, i) => `<button class="choice" type="button" data-body-choice="${i}"><span class="choice-key">${String.fromCharCode(65 + i)}</span><span><strong>${c.title}</strong><small>${c.sub}</small></span><span class="choice-arrow">›</span></button>`).join("")}</div><p class="safety-note">這是課程探索活動，不是健康檢測或醫療建議；請依自己的舒適程度選擇。</p>`}</div></section>`;
  }

  function pickBody(index) {
    const q = bodyQuestions[state.step];
    const chosen = q.choices[index];
    state.scores[chosen.type] += 1;
    state.answers.push(chosen.type);
    state.step += 1;
    renderBody();
    focusMain();
  }

  function bodyResult() {
    complete("body");
    const order = ["map", "move", "recover"];
    const typeKey = order.sort((a, b) => state.scores[b] - state.scores[a])[0];
    const type = bodyTypes[typeKey];
    return `<div class="result-badge">${type.icon}</div><p class="kicker">${type.subtitle}</p><h1 class="result-title">${type.title}</h1><p class="prompt result-copy">${type.copy}</p><div class="type-chips">${type.chips.map(c => `<span class="type-chip">${c}</span>`).join("")}</div><div class="practice"><strong>給你的 30 秒覺察練習</strong><p>${type.practice}</p><div class="breath-circle" id="breath-circle"><span id="breath-label">30</span></div><button class="primary-btn" type="button" data-breathe>開始 30 秒</button></div><p class="safety-note">動作應保持輕鬆、自然且不疼痛；若感到不適，請立即停止。此結果只反映本次回答，不代表固定性格或健康狀況。</p><div class="action-row"><button class="secondary-btn" type="button" data-restart="body">重新探索</button><button class="secondary-btn" type="button" data-home>挑戰另一門課</button></div>`;
  }

  function startBreathing() {
    clearInterval(breathTimer);
    const circle = document.querySelector("#breath-circle");
    const label = document.querySelector("#breath-label");
    const button = document.querySelector("[data-breathe]");
    if (!circle || !label || !button) return;
    button.disabled = true;
    button.textContent = "跟著圓圈慢慢呼吸";
    circle.classList.add("active");
    let remaining = 30;
    const update = () => {
      const within = (30 - remaining) % 10;
      label.textContent = within < 4 ? "吸氣" : "吐氣";
      circle.setAttribute("aria-label", `${label.textContent}，剩下 ${remaining} 秒`);
      remaining -= 1;
      if (remaining < 0) {
        clearInterval(breathTimer);
        label.textContent = "完成";
        button.textContent = "✓ 已完成練習";
        showToast("謝謝你給自己 30 秒");
      }
    };
    update();
    breathTimer = window.setInterval(update, 1000);
  }

  function renderLanguageSelect() {
    app.innerHTML = `<section class="experience language-theme screen">${topBar("language", 0, 3, "選擇目的地")}<div class="experience-body"><p class="kicker">AI LANGUAGE PASSPORT</p><h1>今天想去哪一站？</h1><p class="prompt">你的 AI 旅伴會帶你走進當地咖啡館。聽一句、選一句，完成三輪對話就能獲得電子護照章。</p><div class="country-grid">${Object.entries(languageData).map(([key, d]) => `<button class="country" type="button" data-country="${key}"><span class="flag">${d.flag}</span><strong>${d.name}</strong><small>${d.hello} · ${d.roman}</small></button>`).join("")}</div><p class="safety-note">可使用喇叭按鈕播放語音；不同手機的系統發音可能略有差異。</p></div></section>`;
  }

  function chooseCountry(locale) {
    state.locale = locale;
    state.step = 0;
    state.answers = [];
    state.scores.language = 0;
    state.locked = false;
    renderLanguageQuestion();
    focusMain();
  }

  function renderLanguageQuestion() {
    const d = languageData[state.locale];
    const result = state.step >= d.questions.length;
    const q = d.questions[state.step];
    app.innerHTML = `<section class="experience language-theme screen">${topBar("language", result ? 3 : state.step, 3, result ? "護照完成" : `${d.flag} 對話 ${state.step + 1} / 3`)}<div class="experience-body">${result ? languageResult() : `<p class="kicker">${d.name}｜CAFÉ MISSION</p><h1>${state.step === 0 ? "走進咖啡館" : state.step === 1 ? "詢問推薦" : "完成點餐"}</h1><div class="dialogue"><div class="dialogue-label"><span>情境對話</span><button class="speech-btn" type="button" data-speak="${escapeText(q.npc.replace(/^.*：/, ""))}" data-locale="${d.locale}" aria-label="播放外語句子">🔊</button></div><p class="foreign-line">${q.npc}</p><p class="translation">${q.trans}</p></div><div class="choice-list">${q.options.map((option, i) => `<button class="choice" type="button" data-language-choice="${i}"><span class="choice-key">${String.fromCharCode(65 + i)}</span><span><strong>${option}</strong></span><span class="choice-arrow">›</span></button>`).join("")}</div><div id="feedback-slot"></div>`}</div></section>`;
  }

  function pickLanguage(index) {
    if (state.locked) return;
    state.locked = true;
    const d = languageData[state.locale];
    const q = d.questions[state.step];
    const correct = index === q.correct;
    if (correct) state.scores.language += 1;
    state.answers.push(index);
    document.querySelectorAll("[data-language-choice]").forEach((btn, i) => { btn.disabled = true; if (i === q.correct) btn.classList.add("correct"); else if (i === index) btn.classList.add("wrong"); });
    document.querySelector("#feedback-slot").innerHTML = `<div class="feedback"><strong>${correct ? "答對了！AI 旅伴替你蓋下一格" : "差一點，AI 旅伴給你一句提示"}</strong><p>${q.explain}</p></div><div class="action-row"><button class="primary-btn" type="button" data-language-next>${state.step === 2 ? "領取護照章" : "繼續對話"} →</button><button class="speech-btn" type="button" data-speak="${escapeText(q.options[q.correct])}" data-locale="${d.locale}" aria-label="播放正確句子">🔊</button></div>`;
  }

  function languageResult() {
    complete("language");
    const d = languageData[state.locale];
    const score = state.scores.language;
    const title = score === 3 ? `${d.name}情境溝通達人` : score === 2 ? `${d.name}自信旅行者` : `${d.name}勇敢開口新手`;
    const copy = score === 3 ? "你能在招呼、詢問與道謝三個時機選出合適表達，已完成一段有禮貌的微型對話。" : "語言任務不是一次答對，而是願意聽、模仿並再次開口。你已經收下三句可以立刻使用的表達。";
    return `<div class="result-badge">${d.flag}</div><p class="kicker">LANGUAGE PASSPORT</p><h1 class="result-title">${title}</h1><p class="prompt result-copy">${copy}</p><div class="passport"><div class="passport-head">ANKANG · ${d.name.toUpperCase()} · ${score}/3</div><div class="stamp-row">${[0,1,2].map(i => `<span class="stamp ${i < score ? "" : "off"}">${i < score ? "✓" : "·"}</span>`).join("")}</div><strong>我的三句旅行用語</strong><ul class="phrase-list">${d.phrases.map(([foreign, trans]) => `<li><button class="speech-btn" type="button" data-speak="${escapeText(foreign)}" data-locale="${d.locale}" aria-label="播放 ${escapeText(foreign)}">🔊</button> <b>${foreign}</b>｜${trans}</li>`).join("")}</ul></div><div class="feedback"><strong>這就是第二外語課程的核心</strong><p>看見、聽見、說出來。從語言進入情境，再從情境理解文化與溝通方式。</p></div><div class="action-row"><button class="primary-btn" type="button" data-restart="language">換一個國家</button><button class="secondary-btn" type="button" data-home>挑戰另一門課</button></div>`;
  }

  function speak(text, locale) {
    if (!("speechSynthesis" in window)) return showToast("這台裝置不支援語音播放");
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = locale;
    utter.rate = .84;
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith(locale.slice(0, 2).toLowerCase()));
    if (voice) utter.voice = voice;
    window.speechSynthesis.speak(utter);
  }

  async function copyLink(game) {
    const url = new URL(location.href);
    url.searchParams.set("game", game);
    try { await navigator.clipboard.writeText(url.href); showToast("已複製此體驗的直接連結"); }
    catch { showToast("請從瀏覽器網址列複製連結"); }
  }

  document.addEventListener("click", event => {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.matches("[data-home]")) return renderHome();
    if (target.dataset.start) return startGame(target.dataset.start);
    if (target.dataset.copy) return copyLink(target.dataset.copy);
    if (target.dataset.restart) return startGame(target.dataset.restart);
    if (target.hasAttribute("data-launch-taiwan-flight")) return launchTaiwanFlight();
    if (target.hasAttribute("data-autopilot")) return useTaiwanAutopilot();
    if (target.dataset.droneChoice) return pickDrone(Number(target.dataset.droneChoice));
    if (target.hasAttribute("data-drone-next")) { state.step += 1; state.locked = false; renderDrone(); return focusMain(); }
    if (target.dataset.bodyChoice) return pickBody(Number(target.dataset.bodyChoice));
    if (target.hasAttribute("data-breathe")) return startBreathing();
    if (target.dataset.country) return chooseCountry(target.dataset.country);
    if (target.dataset.languageChoice) return pickLanguage(Number(target.dataset.languageChoice));
    if (target.hasAttribute("data-language-next")) { state.step += 1; state.locked = false; renderLanguageQuestion(); return focusMain(); }
    if (target.dataset.speak) return speak(target.dataset.speak, target.dataset.locale);
  });

  function updateJoystick(event) {
    if (!activeJoystick || !state.flight || state.flight.finished) return;
    const { element, side } = activeJoystick;
    const rect = element.getBoundingClientRect();
    const radius = Math.max(1, rect.width * .32);
    let dx = (event.clientX - (rect.left + rect.width / 2)) / radius;
    let dy = (event.clientY - (rect.top + rect.height / 2)) / radius;
    const length = Math.hypot(dx, dy);
    if (length > 1) { dx /= length; dy /= length; }
    if (Math.abs(dx) < .06) dx = 0; if (Math.abs(dy) < .06) dy = 0;
    const knob = element.querySelector(".stick-knob");
    if (knob) knob.style.transform = `translate(calc(-50% + ${dx * radius}px), calc(-50% + ${dy * radius}px))`;
    const controls = state.flight.controls;
    if (side === "left") { controls.yaw = dx; controls.throttle = -dy; }
    else { controls.roll = dx; controls.pitch = -dy; }
  }

  function releaseJoystick(event) {
    if (!activeJoystick || (event.pointerId != null && activeJoystick.pointerId !== event.pointerId)) return;
    const { element, side } = activeJoystick;
    const knob = element.querySelector(".stick-knob");
    if (knob) knob.style.transform = "translate(-50%, -50%)";
    if (state.flight?.controls) {
      if (side === "left") { state.flight.controls.yaw = 0; state.flight.controls.throttle = 0; }
      else { state.flight.controls.roll = 0; state.flight.controls.pitch = 0; }
    }
    activeJoystick = null;
  }

  document.addEventListener("pointerdown", event => {
    const joystick = event.target.closest("[data-joystick]");
    if (!joystick || !state.flight || state.flight.finished) return;
    event.preventDefault();
    if (state.flight.auto) { state.flight.auto = false; updateFlightMessage("已切回手動模式，請繼續操作雙搖桿。"); }
    joystick.setPointerCapture?.(event.pointerId);
    activeJoystick = { element: joystick, side: joystick.dataset.joystick, pointerId: event.pointerId };
    updateJoystick(event);
  });
  document.addEventListener("pointermove", event => { if (activeJoystick?.pointerId === event.pointerId) updateJoystick(event); });
  document.addEventListener("pointerup", releaseJoystick);
  document.addEventListener("pointercancel", releaseJoystick);

  document.addEventListener("keydown", event => {
    const f = state.flight;
    if (!f || f.finished) return;
    const key = event.key.toLowerCase();
    if (!["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"].includes(key)) return;
    event.preventDefault();
    if (key === "arrowup") f.controls.pitch = 1;
    if (key === "arrowdown") f.controls.pitch = -1;
    if (key === "arrowleft") f.controls.roll = -1;
    if (key === "arrowright") f.controls.roll = 1;
    if (key === "w") f.controls.throttle = 1;
    if (key === "s") f.controls.throttle = -1;
    if (key === "a") f.controls.yaw = -1;
    if (key === "d") f.controls.yaw = 1;
  });

  document.addEventListener("keyup", event => {
    const f = state.flight; if (!f?.controls) return;
    const key = event.key.toLowerCase();
    if (key.startsWith("arrow")) { if (key === "arrowup" || key === "arrowdown") f.controls.pitch = 0; else f.controls.roll = 0; }
    if (key === "w" || key === "s") f.controls.throttle = 0;
    if (key === "a" || key === "d") f.controls.yaw = 0;
  });

  const initialParams = new URL(location.href).searchParams;
  const initialGame = initialParams.get("game");
  if (games[initialGame]) {
    startGame(initialGame);
    if (initialGame === "drone" && initialParams.get("fly") === "1") {
      launchTaiwanFlight();
      const previewProgress = Number(initialParams.get("progress"));
      const previewAltitude = Number(initialParams.get("altitude"));
      if (Number.isFinite(previewProgress)) state.flight.progress = Math.max(0, Math.min(.98, previewProgress));
      if (Number.isFinite(previewAltitude)) state.flight.altitude = Math.max(6, Math.min(58, previewAltitude));
      if (initialParams.get("auto") === "1") useTaiwanAutopilot();
    }
  } else renderHome();
})();
