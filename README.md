# 岱旋 Life OS

Daixuan Life OS 是一个独立开发的个人生活管理与行动中枢，统一组织任务、财务、健康、知识与经确认的 AI 操作。

## 本地运行

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

未配置 Supabase 时，登录页和 `/demo` 视觉演示仍可访问；真实数据路由会显示配置提示。

## 质量检查

```bash
pnpm lint
pnpm typecheck
pnpm build
```

详细说明见 `docs/`。本仓库为 Private，当前不附带开源许可证。
