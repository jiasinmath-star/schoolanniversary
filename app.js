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
    language: { title: "第二外語", icon: "あ", time: "約 2–3 分鐘", desc: "12 張日、韓、德外語牌混合挑戰，配對『你好』與『謝謝』並練習發音。", tags: ["12 張混合牌", "語音播放", "三國外語"] },
    business: { title: "創意文學與實作", icon: "✎", time: "約 2–3 分鐘", desc: "經營安康飲食企業，逐格跳過 16 格食品棋盤，用有畫面的廣告文案賺取收入。", tags: ["16 格棋盤", "1～3 格骰子", "廣告文案"] }
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
    ja: { name: "日本", language: "日語", flag: "🇯🇵", locale: "ja-JP", hello: "こんにちは", roman: "Konnichiwa", phrases: {
      hello: { translation: "你好", foreign: "こんにちは", roman: "Konnichiwa", phonetic: "空你七哇", icon: "👋", note: "白天見面時常用的招呼語。" },
      thanks: { translation: "謝謝", foreign: "ありがとう", roman: "Arigatō", phonetic: "阿里嘎多", icon: "🙏", note: "向熟悉的人表達感謝；更禮貌可說「ありがとうございます」。" }
    } },
    ko: { name: "韓國", language: "韓語", flag: "🇰🇷", locale: "ko-KR", hello: "안녕하세요", roman: "Annyeonghaseyo", phrases: {
      hello: { translation: "你好", foreign: "안녕하세요", roman: "Annyeonghaseyo", phonetic: "安妞哈誰唷", icon: "👋", note: "日常最常用、也很有禮貌的問候語。" },
      thanks: { translation: "謝謝", foreign: "감사합니다", roman: "Gamsahamnida", phonetic: "康撒哈密達", icon: "🙏", note: "正式且有禮貌的感謝說法。" }
    } },
    de: { name: "德國", language: "德語", flag: "🇩🇪", locale: "de-DE", hello: "Hallo!", roman: "Hallo", phrases: {
      hello: { translation: "你好", foreign: "Hallo!", roman: "Hallo", phonetic: "哈囉", icon: "👋", note: "輕鬆、常見的日常招呼語。" },
      thanks: { translation: "謝謝", foreign: "Danke!", roman: "Danke", phonetic: "丹可", icon: "🙏", note: "最常用的感謝說法。" }
    } }
  };

  const businessSpaces = [
    { name: "晨光橙香氣泡飲", short: "橙香氣泡飲", icon: "🍊", type: "飲料", choices: [
      { copy: "橙子汽水，冰涼又好喝。", revenue: 420, tier: "basic" },
      { copy: "一口橙香，替午後按下清爽鍵。", revenue: 980, tier: "benefit" },
      { copy: "陽光掉進氣泡裡，啵一聲，把悶熱變成橙色的好心情。", revenue: 1480, tier: "story" }
    ] },
    { name: "蜂蜜檸檬茶", short: "蜂蜜檸檬", icon: "🍋", type: "飲料", choices: [
      { copy: "檸檬的亮、蜂蜜的柔，剛好是一杯放學後的平衡。", revenue: 1520, tier: "story" },
      { copy: "酸甜順口，課間補水的清新選擇。", revenue: 910, tier: "benefit" },
      { copy: "蜂蜜加檸檬，酸酸甜甜。", revenue: 450, tier: "basic" }
    ] },
    { name: "黑糖珍珠鮮奶", short: "黑糖珍珠", icon: "🧋", type: "飲料", choices: [
      { copy: "黑糖香、珍珠Q、鮮奶濃。", revenue: 720, tier: "benefit" },
      { copy: "杯壁的黑糖像晚霞慢慢流下，每一口都嚼得到甜甜的放學時光。", revenue: 1580, tier: "story" },
      { copy: "好喝的黑糖珍珠鮮奶。", revenue: 460, tier: "basic" }
    ] },
    { name: "青梅冰茶", short: "青梅冰茶", icon: "🍵", type: "飲料", choices: [
      { copy: "酸香回甘，冰涼解膩。", revenue: 880, tier: "benefit" },
      { copy: "一顆青梅，把夏天皺起的眉頭，泡成一杯清涼的微笑。", revenue: 1450, tier: "story" },
      { copy: "青梅口味的冰茶。", revenue: 390, tier: "basic" }
    ] },
    { name: "海鹽洋芋片", short: "海鹽洋芋片", icon: "🥔", type: "零食", choices: [
      { copy: "喀嚓一聲，像把海風和午後陽光一起咬進嘴裡。", revenue: 1500, tier: "story" },
      { copy: "薄脆不膩，海鹽襯出馬鈴薯香。", revenue: 960, tier: "benefit" },
      { copy: "鹹鹹脆脆的洋芋片。", revenue: 410, tier: "basic" }
    ] },
    { name: "金黃起司脆餅", short: "起司脆餅", icon: "🧀", type: "餅乾", choices: [
      { copy: "起司口味的脆餅乾。", revenue: 400, tier: "basic" },
      { copy: "濃郁起司、方形小包，隨手分享剛剛好。", revenue: 890, tier: "benefit" },
      { copy: "金黃小方塊一打開，起司香就先跑出來，邀大家一起喀嚓。", revenue: 1490, tier: "story" }
    ] },
    { name: "青蔥蘇打餅", short: "青蔥蘇打餅", icon: "🧅", type: "餅乾", choices: [
      { copy: "層層酥脆，青蔥鹹香，讀書空檔也能吃得不膩。", revenue: 940, tier: "benefit" },
      { copy: "青蔥落在一層層餅乾上，喀嚓聲替安靜的自習時間加了標點。", revenue: 1510, tier: "story" },
      { copy: "有青蔥的蘇打餅乾。", revenue: 380, tier: "basic" }
    ] },
    { name: "巧克力夾心餅", short: "巧克力夾心", icon: "🍫", type: "餅乾", choices: [
      { copy: "雙層可可餅，夾住濃滑巧克力。", revenue: 920, tier: "benefit" },
      { copy: "咬開深色餅乾，巧克力像藏在書頁裡的小驚喜，悄悄甜了今天。", revenue: 1560, tier: "story" },
      { copy: "巧克力口味的夾心餅。", revenue: 430, tier: "basic" }
    ] },
    { name: "草莓星星軟糖", short: "草莓軟糖", icon: "🍓", type: "零食", choices: [
      { copy: "草莓軟糖，甜甜QQ。", revenue: 420, tier: "basic" },
      { copy: "星星造型、草莓果香，小包裝方便分享。", revenue: 900, tier: "benefit" },
      { copy: "把草莓做成一袋小星星，分一顆給朋友，今天就多一點閃亮。", revenue: 1530, tier: "story" }
    ] },
    { name: "海苔米果", short: "海苔米果", icon: "🍘", type: "零食", choices: [
      { copy: "米香酥脆，海苔鹹香，一口一個不沾手。", revenue: 930, tier: "benefit" },
      { copy: "米粒變成酥脆的小月亮，披上海苔外衣，陪你走過每個課間。", revenue: 1470, tier: "story" },
      { copy: "有海苔味的米果。", revenue: 390, tier: "basic" }
    ] },
    { name: "焦糖爆米花", short: "焦糖爆米花", icon: "🍿", type: "零食", choices: [
      { copy: "每一顆都裹上焦糖，香甜酥脆。", revenue: 970, tier: "benefit" },
      { copy: "焦糖香在袋口排隊，爆米花一開場，平凡午後立刻變成好看的電影。", revenue: 1600, tier: "story" },
      { copy: "甜甜的焦糖爆米花。", revenue: 440, tier: "basic" }
    ] },
    { name: "香辣花生", short: "香辣花生", icon: "🥜", type: "零食", choices: [
      { copy: "酥脆花生配上微辣香料，越嚼越香。", revenue: 950, tier: "benefit" },
      { copy: "第一口是花生香，第二口辣意追上來，像一場越跑越熱鬧的接力賽。", revenue: 1540, tier: "story" },
      { copy: "辣辣的花生零食。", revenue: 400, tier: "basic" }
    ] },
    { name: "蘋果清甜果汁", short: "蘋果果汁", icon: "🍎", type: "飲料", choices: [
      { copy: "清甜果香，冰過更好喝。", revenue: 900, tier: "benefit" },
      { copy: "紅蘋果在杯中醒來，一口喝下，像走進剛下過雨的果園。", revenue: 1500, tier: "story" },
      { copy: "蘋果口味的果汁。", revenue: 410, tier: "basic" }
    ] },
    { name: "牛奶小圓餅", short: "牛奶小圓餅", icon: "🥛", type: "餅乾", choices: [
      { copy: "小巧酥鬆，帶著溫柔奶香，課間分享剛剛好。", revenue: 920, tier: "benefit" },
      { copy: "一顆顆小圓餅像口袋裡的月亮，咬下去，奶香替忙碌按了暫停。", revenue: 1520, tier: "story" },
      { copy: "有牛奶味的小餅乾。", revenue: 400, tier: "basic" }
    ] },
    { name: "抹茶威化餅", short: "抹茶威化餅", icon: "🍵", type: "餅乾", choices: [
      { copy: "多層酥脆威化，抹茶微苦回甘。", revenue: 940, tier: "benefit" },
      { copy: "薄脆一層層打開，抹茶香像綠色的風，從午後課桌輕輕吹過。", revenue: 1550, tier: "story" },
      { copy: "抹茶口味的威化餅。", revenue: 420, tier: "basic" }
    ] },
    { name: "陽光芒果果乾", short: "芒果果乾", icon: "🥭", type: "零食", choices: [
      { copy: "果肉厚實、酸甜有嚼勁，隨身補充水果香。", revenue: 960, tier: "benefit" },
      { copy: "把盛夏的芒果切成金黃書籤，每咬一口，都翻回陽光最甜的那一頁。", revenue: 1580, tier: "story" },
      { copy: "甜甜的芒果果乾。", revenue: 430, tier: "basic" }
    ] }
  ];

  const businessPositions = [[1,1],[1,2],[1,3],[1,4],[1,5],[2,5],[3,5],[4,5],[5,5],[5,4],[5,3],[5,2],[5,1],[4,1],[3,1],[2,1]];
  const businessTierFeedback = {
    story: { label: "畫面故事文案", copy: "你把味道、聲音或情境寫成一幅畫，讓顧客不只看見商品，也想像自己正在享用它。" },
    benefit: { label: "產品特色文案", copy: "你清楚說出商品特色與適合的時機，資訊完整，也能吸引有需要的顧客。" },
    basic: { label: "基本說明文案", copy: "商品說明正確，但畫面感較少；加入感官、情境或故事，會更容易被記住。" }
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
    status.textContent = "四站任選｜免登入";
    const progress = readProgress();
    const gameCount = Object.keys(games).length;
    const doneCount = Object.keys(games).filter(key => progress[key]).length;
    app.innerHTML = `
      <section class="screen">
        <div class="hero">
          <div>
            <p class="eyebrow">Ankang AI Experience Lab</p>
            <h1>掃一掃，讓課程<br><em>開始回應你。</em></h1>
            <p class="lead">四個 1–3 分鐘的智慧互動任務。做選擇、看回饋、帶走一張屬於自己的課程結果。</p>
            <span class="micro-note">所有分析只留在這台裝置，不需輸入姓名</span>
          </div>
          <div class="hero-visual" aria-hidden="true"><div class="orbit"></div><div class="ai-core">AI<span>×4</span></div></div>
        </div>
        <div class="section-title">
          <h2>選擇你的體驗</h2>
          <p>本機完成進度 ${doneCount} / ${gameCount}</p>
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
    return `<div class="experience-top"><div class="top-line"><button class="back-btn" type="button" data-home>回到四門課程</button><span class="step-label">${label}</span></div><div class="progress" style="--progress:${pct}%"><span></span></div></div>`;
  }

  function startGame(game) {
    clearInterval(breathTimer);
    stopFlightLoop();
    state = { game, step: 0, answers: [], scores: { safety: 0, planning: 0, ai: 0, map: 0, move: 0, recover: 0, language: 0 }, locale: null, locked: false };
    setQuery(game);
    status.textContent = `${games[game].title}｜${games[game].time}`;
    if (game === "drone") renderTaiwanFlightIntro();
    if (game === "body") renderBody();
    if (game === "language") startLanguageMemory();
    if (game === "business") startBusinessGame();
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
            <div class="camera-top"><span class="rec-dot">● REC</span><span id="camera-heading">${headingName(routeBearing(0))} ${Math.round(routeBearing(0))}°</span><span id="camera-attitude">TILT 58°</span></div>
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
      googleCameraMap = new maps.Map(cameraContainer, {
        ...baseOptions,
        center: googlePosition(schoolCoordinate),
        zoom: 19,
        mapTypeId: maps.MapTypeId.SATELLITE,
        renderingType: maps.RenderingType.VECTOR,
        tiltInteractionEnabled: false,
        headingInteractionEnabled: false,
        tilt: 58,
        heading: routeBearing(0),
        isFractionalZoomEnabled: true
      });
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
      maps.event.addListenerOnce(googleCameraMap, "tilesloaded", () => {
        if (!googleCameraMap || !document.querySelector("#flight-field")) return;
        const rendering = String(googleCameraMap.getRenderingType?.() || "unknown");
        field.dataset.mapRendering = rendering;
        field.classList.toggle("simulated-perspective", rendering !== "VECTOR");
        updateGoogleFlightMaps(true);
      });
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

  function flightCameraAttitude(f) {
    const routeHeading = routeBearing(f.progress);
    const heightRatio = Math.max(0, Math.min(1, (f.altitude - 6) / 52));
    const headingError = ((f.heading - routeHeading + 540) % 360) - 180;
    const manualPitch = f.auto ? Math.sin(f.progress * Math.PI * 6) * 1.8 : f.controls.pitch * 7;
    const bank = Math.max(-12, Math.min(12, f.auto ? -headingError * .24 : -(f.controls.roll * 10 + f.controls.yaw * 5)));
    const tilt = Math.max(38, Math.min(67, 62 - heightRatio * 15 + manualPitch));
    return { routeHeading, heightRatio, heading: (f.heading + 360) % 360, tilt, bank };
  }

  function updateFpvRealMap(force = false) {
    const f = state.flight;
    if (!f || !flightCameraMap || !flightCameraMap.isStyleLoaded()) return;
    const center = routeCoordinate(f.progress, f.lateral);
    const camera = flightCameraAttitude(f);
    flightCameraMap.jumpTo({
      center,
      zoom: 19 - camera.heightRatio * 2.2,
      bearing: camera.heading,
      pitch: camera.tilt
    });
    if (force) flightCameraMap.resize();
  }

  function updateGoogleFlightMaps(force = false) {
    const f = state.flight;
    if (!f || !googleMapsMode || !googleCameraMap || !googleMiniMap) return;
    const coordinate = routeCoordinate(f.progress, f.lateral);
    const center = googlePosition(coordinate);
    const camera = flightCameraAttitude(f);
    googleCameraMap.moveCamera({
      center,
      zoom: 19.4 - camera.heightRatio * 2.7,
      heading: camera.heading,
      tilt: camera.tilt
    });
    const field = document.querySelector("#flight-field");
    if (field) {
      const initialHeading = routeBearing(0);
      const headingDelta = ((camera.heading - initialHeading + 540) % 360) - 180;
      const visualYaw = Math.max(-28, Math.min(28, -headingDelta * .32));
      const visualPitch = 10 + (camera.tilt - 38) * .42;
      const visualBank = camera.bank * .55;
      const cameraContainer = document.querySelector("#fpv-real-map");
      cameraContainer?.style.setProperty("--fpv-visual-yaw", `${visualYaw.toFixed(2)}deg`);
      cameraContainer?.style.setProperty("--fpv-visual-pitch", `${visualPitch.toFixed(2)}deg`);
      cameraContainer?.style.setProperty("--fpv-visual-bank", `${visualBank.toFixed(2)}deg`);
      field.dataset.cameraHeading = camera.heading.toFixed(1);
      field.dataset.cameraTilt = camera.tilt.toFixed(1);
      field.dataset.cameraBank = camera.bank.toFixed(1);
      field.dataset.visualYaw = visualYaw.toFixed(1);
      field.dataset.visualPitch = visualPitch.toFixed(1);
    }
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
    const camera = flightCameraAttitude(f);
    document.querySelector("#camera-heading").textContent = `${headingName(camera.heading)} ${Math.round(camera.heading)}°`;
    const attitude = document.querySelector("#camera-attitude");
    if (attitude) attitude.textContent = `TILT ${Math.round(camera.tilt)}° · BANK ${Math.round(camera.bank)}°`;
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

  function shuffleLanguageDeck(items) {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function startLanguageMemory() {
    state.step = 0;
    state.answers = [];
    state.locked = false;
    const deck = Object.keys(languageData).flatMap(locale =>
      ["hello", "hello", "thanks", "thanks"].map((phraseKey, index) => ({
        id: `${locale}-${phraseKey}-${index}`,
        locale,
        phraseKey,
        pairKey: `${locale}-${phraseKey}`,
        removed: false
      }))
    );
    state.languageGame = {
      deck: shuffleLanguageDeck(deck),
      flipped: [], matched: [], attempts: 0, locked: false, lesson: null,
      startedAt: performance.now(), completedAt: 0
    };
    renderLanguageMemory();
    focusMain();
  }

  function renderLanguageMemory() {
    const game = state.languageGame;
    if (!game) return startLanguageMemory();
    const remaining = game.deck.filter(card => !card.removed);
    const matchedCount = game.matched.length;
    const lessonLanguage = game.lesson ? languageData[game.lesson.locale] : null;
    const lesson = game.lesson ? lessonLanguage.phrases[game.lesson.phraseKey] : null;
    app.innerHTML = `<section class="experience language-theme screen">${topBar("language", matchedCount, 6, `已收下 ${matchedCount} / 6 組`)}<div class="experience-body"><p class="kicker">JAPAN · KOREA · GERMANY</p><h1>12 張外語牌混合挑戰</h1><p class="prompt">日語、韓語、德語的「你好」與「謝謝」全混在一起。記住位置，找出同一國、同一個詞的兩張牌。</p><div class="memory-stage"><div class="memory-table-head"><span id="memory-status">翻開兩張牌，找出完全相同的外語文字</span><b>嘗試 ${game.attempts} 次｜剩下 ${remaining.length} 張</b></div><div class="memory-grid" data-count="${remaining.length}">${remaining.map((card, index) => { const d = languageData[card.locale]; const phrase = d.phrases[card.phraseKey]; const flipped = game.flipped.includes(card.id) || game.lesson?.cardIds.includes(card.id); return `<button class="memory-card ${flipped ? "is-flipped" : ""}" type="button" data-memory-card="${card.id}" aria-label="第 ${index + 1} 張牌${flipped ? `，${d.language}${phrase.translation}，${phrase.foreign}` : "，尚未翻開"}" aria-pressed="${flipped}" ${game.locked || flipped ? "disabled" : ""}><span class="memory-card-inner"><span class="memory-face memory-back"><i>🌏</i><strong>?</strong><small>日・韓・德</small></span><span class="memory-face memory-front"><i>${d.flag} ${phrase.icon}</i><small>${d.language}｜${phrase.translation}</small><strong>${phrase.foreign}</strong><em>${phrase.roman}</em></span></span></button>`; }).join("")}</div>${lesson ? `<aside class="memory-lesson" role="dialog" aria-modal="true" aria-label="${lessonLanguage.language}${lesson.translation}的發音教學"><span class="lesson-success">${lessonLanguage.flag} ${lessonLanguage.language}配對成功</span><div class="lesson-icon">${lesson.icon}</div><p>${lesson.translation}</p><h2>${lesson.foreign}</h2><strong>${lesson.roman}</strong><div class="phonetic-help"><small>中文近似音</small><b>${lesson.phonetic}</b></div><p class="lesson-note">${lesson.note}</p><div class="lesson-actions"><button class="speech-btn lesson-speech" type="button" data-speak="${escapeText(lesson.foreign)}" data-locale="${lessonLanguage.locale}" aria-label="播放 ${escapeText(lesson.foreign)}">🔊 聽發音</button><button class="primary-btn" type="button" data-memory-collect>我會了，收下這組牌</button></div></aside>` : ""}</div><p class="memory-tip">牌背完全相同；翻開後可用國旗、圖案、文字和聲音一起記憶。</p></div></section>`;
  }

  function flipLanguageCard(cardId) {
    const game = state.languageGame;
    if (!game || game.locked || game.flipped.includes(cardId)) return;
    const card = game.deck.find(item => item.id === cardId && !item.removed);
    if (!card) return;
    game.flipped.push(card.id);
    const button = [...document.querySelectorAll("[data-memory-card]")].find(item => item.dataset.memoryCard === card.id);
    button?.classList.add("is-flipped");
    button?.setAttribute("aria-pressed", "true");
    if (button) button.disabled = true;
    const statusLine = document.querySelector("#memory-status");
    if (game.flipped.length === 1) {
      if (statusLine) statusLine.textContent = "再翻一張，看看是不是同一個字";
      return;
    }
    game.attempts += 1;
    const [firstId, secondId] = game.flipped;
    const first = game.deck.find(item => item.id === firstId);
    const second = game.deck.find(item => item.id === secondId);
    game.locked = true;
    if (first.pairKey === second.pairKey) {
      const d = languageData[first.locale];
      game.lesson = { locale: first.locale, phraseKey: first.phraseKey, pairKey: first.pairKey, cardIds: [firstId, secondId] };
      if (statusLine) statusLine.textContent = "配對成功！準備進入發音教學";
      speak(d.phrases[first.phraseKey].foreign, d.locale);
      window.setTimeout(renderLanguageMemory, 520);
      return;
    }
    if (statusLine) statusLine.textContent = "這兩張不同，記住位置再試一次";
    window.setTimeout(() => {
      game.flipped.forEach(id => {
        const cardButton = [...document.querySelectorAll("[data-memory-card]")].find(item => item.dataset.memoryCard === id);
        cardButton?.classList.remove("is-flipped");
        cardButton?.setAttribute("aria-pressed", "false");
        if (cardButton) cardButton.disabled = false;
      });
      game.flipped = [];
      game.locked = false;
      const status = document.querySelector("#memory-status");
      if (status) status.textContent = "再試一次，找出相同的外語文字";
    }, 900);
  }

  function collectLanguagePair() {
    const game = state.languageGame;
    if (!game?.lesson) return;
    const lesson = game.lesson;
    lesson.cardIds.forEach(id => {
      const card = [...document.querySelectorAll("[data-memory-card]")].find(item => item.dataset.memoryCard === id);
      card?.classList.add("is-removing");
    });
    document.querySelector("[data-memory-collect]")?.setAttribute("disabled", "");
    window.setTimeout(() => {
      game.deck.forEach(card => { if (lesson.cardIds.includes(card.id)) card.removed = true; });
      if (!game.matched.includes(lesson.pairKey)) game.matched.push(lesson.pairKey);
      game.flipped = [];
      game.lesson = null;
      game.locked = false;
      if (game.deck.every(card => card.removed)) renderLanguageResult();
      else renderLanguageMemory();
    }, 620);
  }

  function renderLanguageResult() {
    const game = state.languageGame;
    if (!game) return startLanguageMemory();
    if (!game.completedAt) game.completedAt = performance.now();
    const elapsed = Math.max(1, Math.round((game.completedAt - game.startedAt) / 1000));
    complete("language");
    const phraseSummary = Object.values(languageData).flatMap(d => Object.values(d.phrases).map(phrase => `<article><span>${d.flag} ${phrase.icon}</span><div><small>${d.language}｜${phrase.translation}</small><strong>${phrase.foreign}</strong><em>${phrase.roman}｜${phrase.phonetic}</em></div><button class="speech-btn" type="button" data-speak="${escapeText(phrase.foreign)}" data-locale="${d.locale}" aria-label="播放 ${escapeText(phrase.foreign)}">🔊</button></article>`)).join("");
    app.innerHTML = `<section class="experience language-theme screen">${topBar("language", 6, 6, "全部配對完成")}<div class="experience-body"><div class="result-badge">🌏</div><p class="kicker">MEMORY MATCH COMPLETE</p><h1 class="result-title">三國外語配對成功！</h1><p class="prompt result-copy">你已經把日語、韓語、德語的「你好」與「謝謝」六組牌全部收下，並完成文字與發音練習。</p><div class="score-grid"><div class="score-item"><span>完成配對</span><strong>6<small> / 6</small></strong><div class="score-bar"><i style="width:100%"></i></div></div><div class="score-item"><span>翻牌嘗試</span><strong>${game.attempts}<small> 次</small></strong><div class="score-bar"><i style="width:${Math.max(20, 125 - game.attempts * 5)}%"></i></div></div><div class="score-item"><span>完成時間</span><strong>${elapsed}<small> 秒</small></strong><div class="score-bar"><i style="width:${Math.max(20, 150 - elapsed)}%"></i></div></div></div><div class="memory-summary">${phraseSummary}</div><div class="feedback"><strong>記憶的祕訣：圖像、文字、聲音一起記</strong><p>你先用國旗與圖案辨認線索，再配對外語文字，最後透過語音模仿唸法；多重線索會讓新字更容易留下來。</p></div><div class="action-row"><button class="primary-btn" type="button" data-restart="language">再玩一次</button><button class="secondary-btn" type="button" data-home>挑戰另一門課</button></div></div></section>`;
    focusMain();
  }

  function formatBusinessMoney(value) {
    return new Intl.NumberFormat("zh-TW").format(value);
  }

  function startBusinessGame() {
    state.business = {
      position: -1,
      stepsTaken: 0,
      earnings: 0,
      campaigns: [],
      moving: false,
      lastRoll: 0,
      challenge: null,
      pendingFinish: false,
      startedAt: performance.now(),
      completedAt: 0
    };
    renderBusinessBoard();
  }

  function renderBusinessBoard() {
    const game = state.business;
    if (!game) return startBusinessGame();
    const totalSpaces = businessSpaces.length;
    const progress = Math.min(totalSpaces, game.stepsTaken);
    const marketed = new Set(game.campaigns.map(item => item.spotIndex));
    const challenge = game.challenge;
    const challengeProduct = challenge ? businessSpaces[challenge.spotIndex] : null;
    const challengeMarkup = challenge ? `<section class="ad-studio" aria-live="polite"><div class="ad-studio-head"><span>${challengeProduct.icon}</span><div><small>${challengeProduct.type}廣告案</small><h2>替「${challengeProduct.name}」選一句文案</h2></div></div><p>觀察商品特色，再把味道、聲音或使用情境轉譯成文字。哪一句最能讓顧客看見畫面？</p><div class="ad-copy-list">${challenge.order.map(choiceIndex => { const choice = challengeProduct.choices[choiceIndex]; const selected = challenge.selected === choiceIndex; return `<button class="ad-copy-choice ${selected ? "selected" : ""}" type="button" data-business-choice="${choiceIndex}" ${challenge.selected !== null ? "disabled" : ""}><span>${choice.copy}</span>${challenge.selected !== null ? `<small>${selected ? `本次收入 NT$ ${formatBusinessMoney(choice.revenue)}` : "另一種文案方向"}</small>` : `<small>選擇這則廣告文案</small>`}</button>`; }).join("")}</div>${challenge.selected !== null ? (() => { const choice = challengeProduct.choices[challenge.selected]; const tier = businessTierFeedback[choice.tier]; return `<div class="ad-income-result"><span>廣告入帳</span><strong>+ NT$ ${formatBusinessMoney(choice.revenue)}</strong><b>${tier.label}</b><p>${tier.copy}</p><button class="primary-btn" type="button" data-business-next>${game.pendingFinish ? "完成本圈並結算" : "入帳並繼續擲骰"}</button></div>`; })() : ""}</section>` : game.moving ? `<div class="business-instruction moving-note"><strong>棋子正在逐格前進</strong><p>請先看公事包跳過每一格；抵達商品後，才會前往廣告文案選擇區。</p></div>` : `<div class="business-instruction"><strong>${game.stepsTaken === 0 ? "公司開張！" : "上一筆廣告收入已入帳"}</strong><p>${game.stepsTaken === 0 ? "按下 1～3 點骰子開始巡迴市場；每次落地都要替一項食品挑選廣告文案。" : "繼續擲 1～3 點骰子，完成一圈即可查看安康飲食企業的總獲利。"}</p></div>`;

    app.innerHTML = `<section class="experience business-theme screen business-live">${topBar("business", progress, totalSpaces, `一圈進度 ${progress} / ${totalSpaces}`)}<div class="experience-body business-body"><p class="kicker">ANKANG FOOD ENTERPRISE</p><h1>食品廣告創意大富翁</h1><p class="prompt">從日常觀察出發，把商品的滋味變成有畫面的故事。每次前進 1～3 格，替安康飲食企業賺進廣告收入。</p><div class="business-board" aria-label="${totalSpaces} 格食品大富翁棋盤">${businessSpaces.map((spot, index) => { const [row, col] = businessPositions[index]; const current = game.position === index; return `<div class="business-space ${current ? "current" : ""} ${current && game.moving ? "moving" : ""} ${marketed.has(index) ? "marketed" : ""}" style="grid-row:${row};grid-column:${col}" aria-label="第 ${index + 1} 格，${spot.name}"><span class="space-number">${index + 1}</span><i>${spot.icon}</i><strong>${spot.short}</strong>${marketed.has(index) ? `<b class="marketed-mark">✓</b>` : ""}${current ? `<em class="business-token" aria-label="目前位置">💼</em>` : ""}</div>`; }).join("")}<div class="business-hq"><small>安康飲食企業</small><strong>NT$ ${formatBusinessMoney(game.earnings)}</strong><span>${game.moving ? `骰出 ${game.lastRoll}，逐格前進中…` : game.lastRoll ? `上次骰出 ${game.lastRoll}` : "從企業總部出發"}</span><button class="dice-button" type="button" data-business-roll ${game.moving || challenge ? "disabled" : ""}><b>${game.lastRoll || "🎲"}</b><span>${game.moving ? "看棋子跳動" : "擲 1～3 點"}</span></button></div></div><div class="creative-route"><span>觀察商品</span><b>轉譯感受</b><em>創作文案</em><strong>分享故事</strong></div>${challengeMarkup}</div></section>`;
  }

  function updateBusinessMovementFrame(game) {
    const spaces = [...document.querySelectorAll(".business-space")];
    spaces.forEach(space => {
      space.classList.remove("current", "moving");
      space.querySelector(".business-token")?.remove();
    });
    const current = spaces[game.position];
    if (current) {
      current.classList.add("current", "moving");
      const token = document.createElement("em");
      token.className = "business-token";
      token.setAttribute("aria-label", "目前位置");
      token.textContent = "💼";
      current.append(token);
    }
    const progress = Math.min(businessSpaces.length, game.stepsTaken);
    const label = document.querySelector(".step-label");
    if (label) label.textContent = `一圈進度 ${progress} / ${businessSpaces.length}`;
    document.querySelector(".progress")?.style.setProperty("--progress", `${Math.round(progress / businessSpaces.length * 100)}%`);
    const statusLine = document.querySelector(".business-hq > span");
    if (statusLine) statusLine.textContent = `骰出 ${game.lastRoll}，逐格前進中…`;
    const dice = document.querySelector("[data-business-roll]");
    if (dice) {
      dice.disabled = true;
      const value = dice.querySelector("b");
      const text = dice.querySelector("span");
      if (value) value.textContent = String(game.lastRoll);
      if (text) text.textContent = "看棋子跳動";
    }
  }

  async function rollBusinessDice() {
    const game = state.business;
    if (!game || game.moving || game.challenge) return;
    const roll = 1 + Math.floor(Math.random() * 3);
    game.lastRoll = roll;
    game.moving = true;
    const dice = document.querySelector("[data-business-roll]");
    if (dice) {
      dice.disabled = true;
      const value = dice.querySelector("b");
      const text = dice.querySelector("span");
      if (value) value.textContent = String(roll);
      if (text) text.textContent = "準備跳動";
    }
    const statusLine = document.querySelector(".business-hq > span");
    if (statusLine) statusLine.textContent = `骰出 ${roll}，準備逐格前進`;
    const movingNote = document.querySelector(".business-instruction");
    if (movingNote) {
      const heading = movingNote.querySelector("strong");
      const copy = movingNote.querySelector("p");
      movingNote.classList.add("moving-note");
      if (heading) heading.textContent = "棋子正在逐格前進";
      if (copy) copy.textContent = "請先看公事包跳過每一格；抵達商品後，才會前往廣告文案選擇區。";
    }
    await new Promise(resolve => window.setTimeout(resolve, 300));
    for (let step = 0; step < roll; step += 1) {
      if (state.business !== game) return;
      game.position = (game.position + 1) % businessSpaces.length;
      game.stepsTaken += 1;
      updateBusinessMovementFrame(game);
      await new Promise(resolve => window.setTimeout(resolve, 620));
    }
    if (state.business !== game) return;
    game.moving = false;
    game.pendingFinish = game.stepsTaken >= businessSpaces.length;
    const order = [0, 1, 2];
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    game.challenge = { spotIndex: game.position, order, selected: null };
    renderBusinessBoard();
    window.setTimeout(() => document.querySelector(".ad-studio")?.scrollIntoView({ behavior: "smooth", block: "center" }), 1200);
  }

  function chooseBusinessCopy(choiceIndex) {
    const game = state.business;
    const challenge = game?.challenge;
    const index = Number(choiceIndex);
    if (!challenge || challenge.selected !== null || !Number.isInteger(index)) return;
    const product = businessSpaces[challenge.spotIndex];
    const choice = product.choices[index];
    if (!choice) return;
    challenge.selected = index;
    game.earnings += choice.revenue;
    game.campaigns.push({ spotIndex: challenge.spotIndex, product: product.name, icon: product.icon, copy: choice.copy, revenue: choice.revenue, tier: choice.tier });
    renderBusinessBoard();
    window.setTimeout(() => document.querySelector(".ad-income-result")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }

  function continueBusinessGame() {
    const game = state.business;
    if (!game?.challenge || game.challenge.selected === null) return;
    if (game.pendingFinish) return renderBusinessResult();
    game.challenge = null;
    renderBusinessBoard();
    window.setTimeout(() => document.querySelector(".business-board")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }

  function renderBusinessResult() {
    const game = state.business;
    if (!game) return startBusinessGame();
    if (!game.completedAt) game.completedAt = performance.now();
    const elapsed = Math.max(1, Math.round((game.completedAt - game.startedAt) / 1000));
    const best = [...game.campaigns].sort((a, b) => b.revenue - a.revenue)[0];
    const title = game.earnings >= 6000 ? "故事行銷高手" : game.earnings >= 4500 ? "創意品牌企劃" : "產品文案新秀";
    complete("business");
    const totalSpaces = businessSpaces.length;
    app.innerHTML = `<section class="experience business-theme screen">${topBar("business", totalSpaces, totalSpaces, "完成一圈・企業結算")}<div class="experience-body business-result"><div class="result-badge">💼</div><p class="kicker">BUSINESS LAP COMPLETE</p><h1 class="result-title">安康飲食企業賺了<br>NT$ ${formatBusinessMoney(game.earnings)}</h1><p class="prompt result-copy">你完成食品大富翁一圈，獲得「${title}」稱號。每一次收入都來自你替商品選擇的廣告文案。</p><div class="score-grid"><div class="score-item"><span>本圈總獲利</span><strong>${formatBusinessMoney(game.earnings)}<small> 元</small></strong><div class="score-bar"><i style="width:${Math.min(100, Math.max(20, game.earnings / 75))}%"></i></div></div><div class="score-item"><span>完成廣告案</span><strong>${game.campaigns.length}<small> 件</small></strong><div class="score-bar"><i style="width:${Math.min(100, game.campaigns.length * 20)}%"></i></div></div><div class="score-item"><span>完成時間</span><strong>${elapsed}<small> 秒</small></strong><div class="score-bar"><i style="width:${Math.max(20, 150 - elapsed)}%"></i></div></div></div>${best ? `<div class="best-campaign"><span>${best.icon}</span><div><small>本圈最高收入文案｜+ NT$ ${formatBusinessMoney(best.revenue)}</small><strong>${best.product}</strong><p>「${best.copy}」</p></div></div>` : ""}<div class="campaign-ledger"><h2>安康飲食企業廣告帳本</h2>${game.campaigns.map(item => `<article><span>${item.icon}</span><div><strong>${item.product}</strong><p>${item.copy}</p></div><b>+${formatBusinessMoney(item.revenue)}</b></article>`).join("")}</div><div class="feedback"><strong>你完成了易拉展的創作歷程</strong><p>觀察商品 → 轉譯感受 → 創作文案 → 分享故事。文字不只是介紹食品，也能讓平凡的日常被看見、被記住。</p></div><div class="action-row"><button class="primary-btn" type="button" data-restart="business">再經營一圈</button><button class="secondary-btn" type="button" data-home>挑戰另一門課</button></div></div></section>`;
    focusMain();
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
    if (target.dataset.memoryCard) return flipLanguageCard(target.dataset.memoryCard);
    if (target.hasAttribute("data-memory-collect")) return collectLanguagePair();
    if (target.hasAttribute("data-business-roll")) return rollBusinessDice();
    if (target.dataset.businessChoice != null) return chooseBusinessCopy(target.dataset.businessChoice);
    if (target.hasAttribute("data-business-next")) return continueBusinessGame();
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
