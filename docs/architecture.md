# 技术架构

## Web V1 数据流

受保护页面通过 `useWorkspace` 解析当前用户的个人空间；任务、财务和健康分别由 React Query hooks 读取 Supabase Data API。写操作始终附带当前 `spaceId`，数据库再通过 `private.is_space_member` 的 RLS 策略校验成员关系。

页面不再读取集中演示数据。今日中枢仅对任务、财务和健康查询做客户端派生汇总，因此创建记录后，同一份 Query Cache 会同步刷新首页摘要。AI 助手保持未配置状态，不生成或执行任何模拟结果。

关键边界：

- 浏览器只使用 Supabase publishable key；没有 service role key。
- 认证路由和用户数据不启用 ISR 缓存。
- 账户转账使用一次批量插入生成成对记录，并共享 `transfer_ref`。
- 循环任务在完成当前实例后创建下一实例；不提供独立专注模式。
- Recharts 仅在需要图表的页面动态加载，避免阻塞主界面。

- Next.js 16 App Router：路由、服务端渲染与 Server Actions。
- Supabase Auth：邮箱密码注册、登录、退出、重置与更新；Proxy 使用 `getClaims()` 校验令牌。
- Supabase PostgreSQL：业务数据与 RLS。
- Prisma：类型化数据模型与服务端查询边界。
- TanStack Query：客户端服务端状态缓存。
- Zustand：快速创建、筛选、金额可见性等短期 UI 状态。
- Zod：表单和命令输入校验。

应用在缺少 Supabase 配置时不会伪造登录；受保护页面回到真实登录入口。

Preview 的注册不要求邮箱确认，这是当前产品决策；Supabase 服务端最小密码长度为 8 位，客户端同样使用 Zod 校验。重置密码仍通过邮箱恢复链接完成。Vercel 只配置公开的项目 URL 与 publishable key，service role key 不进入应用环境。
