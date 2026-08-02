# 第三方依赖与许可证

本项目仅使用常规开源依赖。2026-08-02 已根据实际安装包的 `package.json` 完成直接依赖许可证核对：

- MIT：Next.js、React、Tailwind CSS、Radix UI、Motion、Supabase JS/SSR、TanStack Query、Zustand、Recharts、Zod、next-themes、clsx、tailwind-merge 与 ESLint。
- Apache-2.0：Prisma、TypeScript 与 class-variance-authority。
- ISC：Lucide React。

项目保留 shadcn 兼容配置，但当前基础组件是基于 Radix primitives 独立组合的薄封装，不包含其他 Life OS 项目的组件代码。

当前未安装 Magic UI 或其他第三方装饰组件。`/lab` 仅提供隔离验证入口；任何组件进入正式页面前需记录来源、许可证、性能和可访问性检查。
