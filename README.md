# 岱旋 Life OS

Daixuan Life OS 是一个独立开发的个人生活管理与行动中枢，统一组织任务、财务、健康、知识与经确认的 AI 操作。Web V1 的任务、财务与健康已连接真实个人空间数据；AI 服务尚未配置。

## 本地运行

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

未配置 Supabase 时，受保护路由会回到登录页。云端只在 Vercel Preview 环境配置 Supabase publishable 参数，不需要也不得向客户端提供 service role key。

## 质量检查

```bash
pnpm lint
pnpm typecheck
pnpm prisma:validate
pnpm build
```

详细说明见 `docs/`。本仓库为 Private，当前不附带开源许可证。
