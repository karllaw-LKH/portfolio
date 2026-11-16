# Artist Portfolio / 艺术家个人网站

简约艺术家作品集，为艺术实践、研究和 PhD 申请准备。原生 HTML/CSS/JavaScript，无需安装依赖或构建；GitHub Pages 托管。

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

## 替换示例

姓名、地点、教育、展览、奖项和出版物都是明确的占位内容，不代表真实个人经历。所有示例作品均有示例标记。在作品编辑器中替换为真实作品后，取消「这是示例作品」。上传个人照片会替换首屏雕塑示意图。

`assets/studies.png` 使用内置 image_gen 生成；页面用 CSS 分区展示同一张图的四个区域。提示词摘要：暖白与灰绿配色，四格独立编辑摄影；匿名石膏头像、半透明折纸、金属触觉交互原型、白色织物空间装置；自然光、无文字、无标志。完整提示词见 `IMAGE-PROMPT.md`。

## 可维护性

前台：`index.html`、`style.css`、`app.js`。后台：`admin/`。共用转义、URL 白名单和内容验证：`shared.js`。无第三方脚本、追踪或远程字体。保持相对地址，支持 GitHub 项目子目录。后台上传和内容通过 Git API 创建 tree + commit，再非强制更新分支，避免并发时覆盖线上更改。
