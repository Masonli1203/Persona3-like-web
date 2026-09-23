# Persona3-like-web

受 Persona 界面风格启发的通用作品集模板。使用 Next.js、React、TypeScript、Tailwind CSS、Framer Motion 和 Three.js。

[English](README.md) · [配置说明](docs/CUSTOMIZATION.md) · [MIT 许可](LICENSE)

![首页预览](docs/screenshots/home.png)

## 当前功能

- 首页视差、磁吸导航、动态文字和章节预览。
- 持续挂载的墨迹光标、时钟碎片转场、按钮按压反馈和浮动章节导航。
- Creative 四个分类、独立路由、可分享的作品弹层，以及支持翻页和返回位置恢复的照片查看器。
- 本地视频与可选的 Mux 播放，默认不包含视频和播放 ID。
- 项目预览、通用案例页、转场演示和可调尺寸、材质与配件的 3D 配置器。价格仅为演示估算。
- 个人介绍、教育、经历、技能、奖项等占位内容。邮箱和简历未配置时不显示。
- 本地字体、抽象占位图、通用图标、移动端布局和减少动态效果支持。

## 本地运行

推荐 Node.js 24（支持 22 及以上）。

```sh
npm ci
npm run dev
```

访问 [本地预览](http://127.0.0.1:3000)。默认无需环境变量。

## 替换内容

- `src/data/site.ts`：姓名、缩写、身份、地点、页面 metadata 和首页插图。
- `src/data/profile.ts`：简介、教育、经历、技能、邮箱和简历路径。
- `src/data/sections.ts`：章节名称和首页预览文案。
- `src/data/creativeProjects.ts`：分类、作品、照片与视频配置。
- `src/data/works.ts`：项目列表与详情链接。
- `src/app/(modules)/projects/`：通用项目详情页与交互示例。

详细步骤见 [CUSTOMIZATION](docs/CUSTOMIZATION.md)。个人副本可通过 GitHub 的 Use this template 创建。

## 验证

```sh
npm run check
npm run build
npx playwright install chromium
npm run test:e2e
```

包含 lint、类型、格式、隐私保护、单元测试与浏览器测试。浏览器测试使用 3100 端口的生产服务。

## 个人信息边界

模板不包含原作者的简历、肖像、真实照片、影片、项目截图、经历、邮箱、播放 ID、密钥或本地资料，也不导入个人网站的 Git 历史。保留模板仓库原有的公开历史和必要许可署名。

隐私检查用于保持上游模板通用；制作个人副本并加入自己的内容时，可相应调整规则。发布前仍应人工检查新素材和 Git 差异。

本项目为非官方独立作品，不含官方游戏素材，与 ATLUS 或 SEGA 无隶属关系。代码和通用 SVG 使用 MIT 许可；字体保留各自的 OFL 许可。
