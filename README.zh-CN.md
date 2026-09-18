# Persona3-like-web

参考 Persona 3 视觉节奏的开源个人网站模板：斜切构图、超大斜体文字、漫画笔触光标，以及轻量页面转场。

[English](README.md) · [内容与样式修改](docs/CUSTOMIZATION.md) · [参与开发](CONTRIBUTING.md) · [MIT 许可证](LICENSE)

![首页预览](docs/screenshots/home.png)

[板块预览](docs/screenshots/creative.png) · [手机预览](docs/screenshots/mobile.png)

## 已有功能

- **首页**：鼠标视差、标题倾斜、磁吸按钮、漫画式悬停放大，以及随悬停切换的文字预览。
- **Creative**：可筛选的作品卡片和展开说明。
- **Projects**：项目选择列表与预览面板。
- **About**：个人简介、经历和兴趣占位内容。
- **全站光标**：即时跟随、笔触拖尾、按钮悬停反馈，跨页面和转场持续显示。
- **两种转场**：首页进入板块时，时钟从十一点转到十二点后破碎消散；板块之间使用圆形扩散与揭示。
- **适应性**：流式字号、稳定的滚动条占位、键盘焦点、触屏布局和减少动态效果支持。

技术栈为 **Next.js App Router + TypeScript + Tailwind CSS + Framer Motion**。动画使用 CSS、SVG 和少量 Canvas 碎片，不依赖 Three.js 或 WebGL。

这是前端模板，作品、媒体、经历和 CV 均为占位内容。没有连接登录系统、CMS、统计、视频平台或后端服务。

## 本地启动

建议使用 **Node.js 24** 和 npm；项目也允许 Node.js 22。无需环境变量或 API Key。

```sh
git clone https://github.com/Masonli1203/Persona3-like-web.git
cd Persona3-like-web
npm ci
npm run dev
```

浏览器打开 [http://127.0.0.1:3000](http://127.0.0.1:3000)。

- **制作自己的独立网站**：点击 GitHub 的 **Use this template**。
- **一起改进这个项目**：Fork 仓库、创建分支、提交 Pull Request。模板复制会创建独立历史，协作建议使用 Fork；详见 [GitHub 模板说明](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository)。

## 从哪里修改

| 文件                                 | 内容                                       |
| ------------------------------------ | ------------------------------------------ |
| `src/data/site.ts`                   | 名字、简称、职业、介绍、兴趣、首页图片地址 |
| `src/data/sections.ts`               | 三大板块名称与首页悬停预览文案             |
| `src/data/works.ts`                  | 作品和项目示例                             |
| `public/images/hero-placeholder.svg` | 通用桌面端视觉占位图                       |
| `src/app/globals.css`                | 配色、字号、首页排版与光标                 |
| `src/app/(modules)/modules.css`      | 板块排版与选择按钮                         |
| `src/app/transitions.css`            | 转场外观与节奏                             |

模板已经替换为通用内容，不包含原个人网站的人像、参考照片、设计备份、凭据和仅适用于个人电脑的验证脚本。

桌面背景使用 **1672 × 941** 画布，视觉主体位于左侧名字和右侧导航之间。手机竖屏保持几何背景。更换长名字、背景图或媒体前，请阅读[修改说明](docs/CUSTOMIZATION.md)。

## 验证与测试

```sh
npm run check
npm run build
npx playwright install chromium
npm run test:e2e
```

浏览器测试会在 **3100** 端口启动本地生产服务器，因此先执行构建。Linux 可使用 `npx playwright install --with-deps chromium` 同时安装浏览器所需系统依赖。3000 端口的开发服务器可以继续运行。

| 命令               | 用途                               |
| ------------------ | ---------------------------------- |
| `npm run dev`      | 本地开发                           |
| `npm run build`    | 生成生产构建                       |
| `npm run start`    | 在本机运行已构建版本               |
| `npm run check`    | 代码规范、类型和格式检查           |
| `npm run format`   | 格式化代码和文档                   |
| `npm run test:e2e` | 浏览器导航、交互、光标和响应式检查 |
| `npm test`         | 一次执行检查、构建和浏览器测试     |

提交代码和 Pull Request 后，GitHub Actions 会执行检查、构建及浏览器测试。**仓库没有上线部署流程，也没有连接托管平台。**

更多实现说明见[架构文档](docs/ARCHITECTURE.md)，后续可参与的内容见[路线图](docs/ROADMAP.md)。

## 许可证与视觉参考

代码及仓库内通用 SVG 占位图采用 [MIT 许可证](LICENSE)，第三方依赖保留各自许可证。

这是独立、非官方项目。Persona / Persona 3 仅作为视觉参考；仓库不包含游戏官方美术、音乐、Logo 或字体，也不隶属于 ATLUS 或 SEGA。替换媒体时请使用你有权公开分发的素材。
