# GitHub Pages 全體遊玩人次設定

## 顯示方式

首頁四張課程卡會分別顯示：

- AI 無人機：全體體驗 N 人次
- 身心調整：全體體驗 N 人次
- 第二外語：全體體驗 N 人次
- 創意文學與實作：全體體驗 N 人次

同一個瀏覽器第一次進入某一門課時才會加 1；重新整理或重玩不重複累加。不同手機會共同累計。

## 為什麼要多一個計數服務

GitHub Pages 只能提供靜態檔案，不能直接修改伺服器上的人次資料。因此遊戲仍放在 GitHub Pages，人次則由 `counter-worker` 裡的小型 Cloudflare Worker 與 D1 資料庫保存。

## 一次性設定

1. 建立或登入 Cloudflare 帳號，安裝 Wrangler。
2. 在 `counter-worker` 資料夾執行：

   ```powershell
   npx wrangler login
   npx wrangler d1 create ankang-ai-experience-counts
   ```

3. 把指令回傳的 `database_id` 貼到 `counter-worker/wrangler.jsonc`。
4. `ALLOWED_ORIGINS` 已設定為 `https://jiasinmath-star.github.io`。這裡只填網域，不包含 `/schoolanniversary/` 專案路徑。
5. 建立資料表並部署：

   ```powershell
   npx wrangler d1 migrations apply ankang-ai-experience-counts --remote
   npx wrangler deploy
   ```

6. Wrangler 會回傳一個 `https://...workers.dev` 網址。把它貼到 `dist/counter-config.js`：

   ```javascript
   window.ANKANG_COUNTER_API_URL = "https://你的計數服務.workers.dev";
   ```

7. 將 `dist` 裡的所有檔案重新上傳到 GitHub Pages 發布根目錄。

## 檢查方式

用手機無痕視窗進入任一課程後回到首頁，該課程人次應增加 1；同一個無痕視窗重新整理不應再次增加。
