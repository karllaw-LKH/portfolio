# Artist Portfolio / 艺术家个人网站

简约艺术家作品集，为艺术实践、研究和 PhD 申请准备。原生 HTML/CSS/JavaScript，无需安装依赖或构建；GitHub Pages 托管。

网站：https://karllaw-lkh.github.io/portfolio/  
后台：https://karllaw-lkh.github.io/portfolio/admin/  
仓库：https://github.com/karllaw-LKH/portfolio

## 页面

- `/`：个人照片与介绍、作品筛选和详情、艺术陈述、履历与联系方式。
- `/admin/`：中文内容管理，可编辑文字、上传图片/视频/PDF/ZIP/模型文件，调整顺序，备份与发布。
- `data/content.json`：所有展示内容。也可以直接在 GitHub 编辑此文件。

## 本地预览

在此目录运行 `python -m http.server 4173`，访问 `http://localhost:4173`。不要双击 HTML 文件，浏览器需要通过 HTTP 读取 JSON。

## GitHub Pages 部署

仓库 Settings → Pages → Deploy from a branch → main → /(root) → Save。此后 main 分支每次提交将自动触发部署。建议启用 Enforce HTTPS。

## 后台使用

1. 打开网站 `/admin/`。个人资料、作品、履历均可通过表单修改；修改自动保存为当前浏览器的草稿。
2. 首次发布前，在 GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens，创建仅授权此仓库的 Token。Repository permissions 仅需 **Contents: Read and write**（Metadata 只读自动附带），设置适当到期时间。不要把 Token 发在聊天中或写进仓库。
3. 在后台「发布设置」输入 Token，点击「连接并读取仓库最新内容」。首次编辑前建议先连接；此操作会以仓库最新内容替换本地草稿。
4. 编辑或上传后「预览草稿」，然后「发布到网站」。内容和本次上传文件以一个 Git 提交保存。GitHub Pages 部署完成后前台更新。
5. Token 仅留在当前页面内存，刷新或关闭后需重新输入。点击断开连接可立即清除。

图片支持 PNG/JPG/WebP/AVIF/GIF；附件支持 PDF/ZIP/GLB/GLTF/OBJ；视频支持 MP4/WebM。单个文件上限 20 MB，大文件建议外部托管。上传文件在发布前仅在当前页面内存，刷新会丢失上传字节；文字草稿会保留。备份 JSON 不包含上传文件本身。已发布附件随 GitHub 仓库保留。删除作品不会自动删除旧附件，历史提交也保留旧资料；请勿上传私人申请文件。

GitHub Pages 是静态托管，后台由表单编辑器 + GitHub API 组成，不需要独立服务器、数据库或额外付费 CMS。访问后台不等于获得发布权限，只有持有仓库写权限的有效 Token 才能更新仓库。不要在共享电脑保留未发布草稿。新增图片的本地草稿预览在发布前暂不展示，发布后正常显示。

## 雙語作品集內容

內容取自 Desktop/Art portfolio 的四份作品介紹 PPT：竹繭、浮漁、是什麼？撫平時間的皺褶，以及辨認・重塑。重複出現的履歷、獎項與照片已合併；原始 PPT 不作修改，也不會整份公開上傳。網站使用 41 張經尺寸優化的原作照片與資料圖片，儲存於 `assets/portfolio/`。

首頁預設繁體中文，右上角可切換 English / 中文；選擇會保留於瀏覽器，也可分享 `?lang=zh` 或 `?lang=en` 連結。內容資料以原欄位保存英文，對應的 `_zh` 欄位保存繁體中文。後台提供兩種語言的文字輸入欄；圖片與附件共用，避免重複維護。中文空白時會顯示英文。舊版草稿不會自動覆蓋此批匯入的作品內容；如有舊草稿需要保留，可先在舊版頁面匯出備份。

聯絡電郵未在來源作品集提供，因此保留待更新。歷來生成的 `assets/studies.png` 僅作為舊版本資產保留，目前首頁與作品均使用 PPT 中的原作圖片。

2026年11月19日增補「2026.11.19簡短 羅嘉豪作品集（繁＋英）」及「2026.11.17 羅嘉豪簡歴（繁）」的未重複內容：新增11件作品，現有15件獨立作品、90張作品及肖像圖片，履歷合併為60條記錄。華強北互動充氣裝置標示為獲獎設計方案；來源未標年份的作品保留空白，不推測創作年份。

首頁五個分類由 `categories` 定義中英文名稱；每件作品以 `categoryIds` 記錄所屬分類，支援同一作品出現在多個分類。後台「作品管理」可新增、改名、刪除分類，並為作品勾選多個分類；刪除分類不會刪除作品。原有單一 `category` 格式的備份仍可讀取。已存於瀏覽器的草稿會繼續保留；要編輯此次增補內容，可先匯出需要的舊草稿，再按「重新讀取線上內容」。

## 可维护性

前台：`index.html`、`style.css`、`app.js`。后台：`admin/`。共用转义、URL 白名单和内容验证：`shared.js`。不加载远程脚本、追踪或远程字体。保持相对地址，支持 GitHub 项目子目录。后台上传和内容通过 Git API 创建 tree + commit，再非强制更新分支，避免并发时覆盖线上更改。

## 視覺設計與維護

視覺更新依照 [taste-skill](https://github.com/Leonxlnx/taste-skill) 的排版、邊界、色彩及微互動原則：首頁個人肖像、開放式作品圖網格、可展開履歷，以及單次的照片顯影效果。`assets/taste/` 只保留所需的原版元件，MIT授權保存在同一目錄。Host Grotesk字體本地託管於 `assets/fonts/`，OFL授權亦包含在內。網站沒有遠端字體或JavaScript依賴。

作品及履歷資料仍以 `data/content.json` 為唯一編輯來源，後台操作方式不變。研究區圖片沿用現有作品詳情圖；首頁、履歷上方與頁尾的 Banner 則分別由後台設定，毋須另外維護第二份作品內容。首頁圖片採用 `assets/previews/` 的響應式WebP，詳情保留原圖；未有預覽的新上傳圖片會直接顯示原檔，不需要編譯或額外步驟。維護者如需為新圖片產生壓縮版本，可在安裝Pillow的Python環境執行 `python scripts/build-previews.py`，再提交產出的圖片及manifest。

三個頁面圖片位置可在後台「個人介紹 → 頁面圖片與 Banner」獨立更新：`profile.heroBanner` 為首頁個人介紹背景；`profile.portrait` 為履歷上方的個人肖像，`portraitCaption` / `portraitCaption_zh` 直接顯示為肖像說明；`profile.footerBanner` 為「展覽、策展與研究交流」下方圖片。首頁和頁尾另有 `heroBannerAlt` / `footerBannerAlt` 及對應 `_zh` 圖片說明。舊版備份仍可讀取。新後台保留瀏覽器既有草稿，僅從線上補齊尚未存在的 Banner 設定，不覆蓋原有文字與肖像編輯。

完整作品列表及展開後的履歷依內容自然增長，避免為了固定螢幕高度而裁切作品或限制日後更新。設計檢查記錄、瀏覽器暫存與截圖保存在已忽略的 `.taste-skill/`，不發布到公開網站。
