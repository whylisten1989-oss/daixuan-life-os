# 岱旋 Life OS 工程约束

- 本项目为完全独立开发的 Daixuan Life OS，不得复制、引用或读取任何第三方完整 Life OS 项目的实现代码、数据结构、文案、图片或提交历史。
- 不得访问或修改同级 `life-os` 目录及任何外部 BI 项目。
- 所有业务记录必须通过 `spaceId` 隔离，并由 Supabase RLS 再次校验空间成员关系。
- 客户端不得包含 Supabase secret/service-role key；仅允许公开的 publishable key。
- AI 未配置时必须明确显示未配置状态；任何未来 AI 写操作必须先生成确认卡。
- 页面默认同时适配桌面和手机，手机端采用独立底部导航与触控布局。
- 正式页面不得批量使用同款 Card；优先使用时间轴、列表、数据带、表格和开放分区。
- 动效必须尊重 `prefers-reduced-motion`。第三方动效先在 `/lab` 验证许可证、性能与可访问性。
- 每次交付前必须执行 lint、TypeScript 类型检查和 production build，不得删除重要功能来规避检查。
- 根目录暂不添加开源许可证。
