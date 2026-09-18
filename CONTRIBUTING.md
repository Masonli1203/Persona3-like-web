# Contributing / 参与开发

Small, focused pull requests are welcome. Start from an issue or describe the problem clearly in your pull request.

## Working together

1. Fork this repository and clone your fork. Collaborators with write access can clone the shared repository directly.
2. Create a branch, for example `git switch -c fix/cursor-feedback`.
3. Install with `npm ci`, then use `npm run dev`.
4. Make one focused change. Add or update a browser test when behavior changes.
5. Run `npm run format`, `npm run check`, `npm run build`, and `npm run test:e2e`.
6. Push your branch and open a pull request against `main`.

Install the test browser once with `npx playwright install chromium`. GitHub Actions repeats the checks on pull requests.

If you want to contribute improvements back to this project, use a **fork**, not a template-generated copy. Use **Use this template** for a separate portfolio project.

## Design and code conventions

- Keep reusable identity and copy in `src/data/`.
- Keep the shared cursor in the app-level transition provider; route changes must not unmount it.
- Preserve keyboard operation, focus visibility, readable small-screen text, and reduced-motion behavior.
- Preserve the distinction between the Index clock transition and the shorter chapter-to-chapter circle transition.
- Avoid adding a 3D engine or a large animation dependency for a small effect.
- Use the committed npm lockfile. Format with the included Prettier settings.
- Keep real photos, local paths, credentials, personal archives, and large media out of template contributions.
- Describe what changes, why, and how you verified it. Include desktop and mobile screenshots for visual changes.

Contributions are provided under this project's MIT license. Third-party assets need clear redistribution permission and attribution where required.

## 中文协作流程

Fork 仓库后创建分支，修改并完成本地验证，再向 `main` 提交 PR。有直接写入权限的协作者也应使用功能分支。每个 PR 尽量围绕一个明确问题，说明变化、原因和验证方法；视觉调整附上桌面和手机截图。

个人资料集中放在 `src/data/`，不要把私人照片、本机绝对路径、密钥或大视频提交到模板。交互修改需要保留键盘操作、触屏与减少动态效果模式。请使用 Fork 参与这个项目；“Use this template”用于创建独立网站。
