# 技术架构

- Next.js 16 App Router：路由、服务端渲染与 Server Actions。
- Supabase Auth：邮箱密码注册、登录、退出、重置与更新；Proxy 使用 `getClaims()` 校验令牌。
- Supabase PostgreSQL：业务数据与 RLS。
- Prisma：类型化数据模型与服务端查询边界。
- TanStack Query：客户端服务端状态缓存。
- Zustand：快速创建、筛选、金额可见性等短期 UI 状态。
- Zod：表单和命令输入校验。

应用在缺少 Supabase 配置时不会伪造登录，只开放明确标记的 `/demo` 演示页。

Preview 的注册不要求邮箱确认，这是当前产品决策；Supabase 服务端最小密码长度为 8 位，客户端同样使用 Zod 校验。重置密码仍通过邮箱恢复链接完成。Vercel 只配置公开的项目 URL 与 publishable key，service role key 不进入应用环境。
