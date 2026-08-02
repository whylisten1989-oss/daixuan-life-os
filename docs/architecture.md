# 技术架构

- Next.js 16 App Router：路由、服务端渲染与 Server Actions。
- Supabase Auth：邮箱密码登录与会话；Proxy 使用 `getClaims()` 校验令牌。
- Supabase PostgreSQL：业务数据与 RLS。
- Prisma：类型化数据模型与服务端查询边界。
- TanStack Query：客户端服务端状态缓存。
- Zustand：快速创建、筛选、金额可见性等短期 UI 状态。
- Zod：表单和命令输入校验。

应用在缺少 Supabase 配置时不会伪造登录，只开放明确标记的 `/demo` 演示页。
