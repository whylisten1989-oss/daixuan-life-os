# 数据模型

## Web V1 增量（2026-08）

- `tasks` 新增工作/生活领域、标签、下次跟进、实际开始与结束时间；状态加入 `PLANNED`。
- `AccountType` 新增微信、支付宝与自定义账户类型。
- `salary_settings` 保存每月工资、发薪日、到账账户与本月到账状态。
- `debt_payments` 统一记录信用卡和贷款还款，保留还款来源账户。
- `workout_logs` 新增步数与运动后感受；`daily_checkins` 新增步数与可选体重。
- 所有新增业务记录继续以 `space_id` 隔离；新表均启用 RLS，只有 `authenticated` 获得 CRUD，`anon` 无表权限。

对应迁移：`supabase/migrations/20260802162108_web_v1_core.sql`。

`Space` 是数据隔离根节点，`SpaceMember` 记录用户角色。除用户档案外，所有业务记录均显式携带 `spaceId`，为个人空间和未来家庭空间使用同一套隔离机制。

## 身份与空间

- `Profile`：一对一对应 Supabase `auth.users`，只保存展示名称、头像和时区。
- `Space`：个人或家庭空间；注册时自动创建个人空间。
- `SpaceMember`：空间成员与 `OWNER / ADMIN / MEMBER / VIEWER` 角色。

## 任务

- `Project`：任务项目与目标日期。
- `Task`：Inbox、今日、等待中、逾期、完成、优先级、截止日期、循环规则、预计/实际用时。
- `Task.parentId`：自关联子任务，不额外复制一套子任务表。

## 财务

- `Account`、`FinanceCategory`、`Transaction`、`Budget`。
- `RecurringExpense`、`Subscription`、`CreditCard`、`Loan`。
- `SavingsGoal`、`PurchasePlan`。

金额使用 PostgreSQL `Decimal`，交易通过时间和类型索引支持趋势统计与 CSV 导出。

## 健康

- `SleepLog`、`WaterLog`、`WorkoutLog`。
- `DailyCheckin`：精力、心情、压力的每日唯一记录。
- `HealthGoal`：睡眠、饮水、运动和自定义目标。

## 知识与 AI

- `KnowledgeNote`、`KnowledgeTag`、`NoteTag`；标签关系使用同空间复合外键，禁止跨空间关联。
- `AiActionDraft`：保存待确认操作；只有创建者可读写自己的草稿。

通用关系不替代业务表：任务、交易、睡眠、饮水和运动均使用结构化字段，便于约束、索引、统计和未来 AI 操作确认。

## 隔离与安全

数据库同时通过外键、索引和 Supabase RLS 保护。RLS 策略以 `auth.uid()` 与 `space_members` 的成员关系为准，不读取用户可编辑的 `user_metadata`。匿名角色没有业务表权限；认证用户也必须同时通过空间成员检查。更新策略同时包含 `USING` 和 `WITH CHECK`。

迁移文件：

- `202608020001_initial.sql`：由本项目 Prisma Schema 生成的基础结构。
- `202608020002_security.sql`：Supabase 身份外键、注册初始化、数据库默认值、更新时间触发器、显式 Data API 权限与 RLS。
- `202608020003_security_indexes.sql`：安全函数最小执行权限与外键覆盖索引。
- `202608020004_authenticated_least_privilege.sql`：认证客户端只保留受 RLS 约束的 CRUD 表权限。
