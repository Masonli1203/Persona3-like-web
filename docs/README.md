# Documentation / 文档导航

| Task / 任务                                                | Read / 文档                                         |
| ---------------------------------------------------------- | --------------------------------------------------- |
| Install and run / 安装与运行                               | [English](../README.md), [中文](../README.zh-CN.md) |
| Customize content and media / 修改内容与媒体               | [Customization](CUSTOMIZATION.md)                   |
| Find code and understand dependencies / 查找代码与理解依赖 | [Architecture](ARCHITECTURE.md)                     |
| Understand browsing terminology / 理解浏览术语             | [Domain glossary](../CONTEXT.md)                    |
| Write generic template copy / 编写模板文案                 | [Writing style](WRITING_STYLE.md)                   |
| Contribute and verify changes / 开发与验证                 | [Contributing](../CONTRIBUTING.md)                  |
| Find future ideas / 查看后续方向                           | [Roadmap](ROADMAP.md)                               |

## Confirmed designs / 已确认设计

- [Creative viewing session](design/creative-viewing-session.md): history, photo navigation, focus, and scroll restoration.
- [Feature structure migration](design/feature-structure.md): approved organization, old-to-new path map, and verification.

## Root files and generated output / 根目录文件与生成物

Package management and build, TypeScript, lint, formatting, and test configuration stay at the repository root. The README files, license, contribution guide, agent entry files, and domain glossary remain there for discovery. Detailed guidance belongs in this directory.

Open the `Persona3-like-web` repository folder in VS Code to use `.vscode/settings.json`. It hides dependencies, build output, generated type declarations, and test reports from the Explorer. The files remain on disk, and the tools keep using their existing locations. To inspect an artifact in the Explorer, temporarily set its `files.exclude` entry to `false`. Other editor settings remain local and ignored by Git.

用 VS Code 打开实际仓库 `Persona3-like-web` 后，项目设置会隐藏依赖、构建产物、生成的类型声明和测试报告。文件仍保留在磁盘上；需要查看时，可将对应的 `files.exclude` 设置改为 `false`。

Keep local continuation notes such as `NEXT-CHAT.md` and workspace-specific agent configuration in the parent workspace, outside this repository. They are separate from application source and committed project documentation.
