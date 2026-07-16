# 第二阶段：门店客户身份分层转化工具部署

本阶段保留既有登录、课程权限、私有资料下载与第一阶段学习闭环，只新增实战工具记录、作业关联和助教反馈能力。

## 1. Supabase SQL（顺序不能颠倒）

在 Supabase Dashboard → **SQL Editor** 中依次完整执行：

1. `supabase/learning-loop-migration.sql`（若第一阶段已执行，可以跳过）
2. `supabase/tool-records-migration.sql`
3. `supabase/customer-segment-course-seed.sql`

第三个 SQL 会创建或更新以下两个课程的 DAY 3 作业入口：

- `growth-day-3`：7天业绩倍增突击营
- `aesthetic-day-3`：全案色彩美学精华班

请在 `user_course_access` 中为学员授予对应的课程 ID；否则该学员不会在工具中看到可提交的课程作业。

## 2. 助教和管理员角色

`tool-records-migration.sql` 默认把已有账号标记为 `student`，防止自行提升权限。由管理员在 SQL Editor 中显式设置：

```sql
-- 将某账号设为助教，并指定其负责的学员
update public.profiles
set role = 'assistant'
where id = '助教的 auth.users.id';

update public.profiles
set mentor_id = '助教的 auth.users.id'
where id = '学员的 auth.users.id';

-- 管理员账号
update public.profiles
set role = 'admin'
where id = '管理员的 auth.users.id';
```

助教只能读取其 `mentor_id` 指向自己的学员记录；管理员可以读取全部记录。服务端 `SUPABASE_SERVICE_ROLE_KEY` 仍只在 API 路由使用，未发送到浏览器。

## 3. Vercel

保留已有的三项环境变量即可：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

推送到 GitHub `main` 后，Vercel 会自动构建。也可以在 Vercel → Deployments 点击最新提交的 Redeploy。

## 4. 验收路径

- `/tools`：工具入口
- `/tools/customer-segment`：填写、自动计算、保存、复制、打印导出 PDF、提交作业
- `/records`：我的实战记录与执行复盘
- `/assignments`：查看工具记录和作业状态/助教反馈

## 5. 关键验收

1. 五项评分仅有 1、3、5；总分是 5—25。
2. 22—25 S、18—21 A、13—17 B、8—12 C、5—7 D。
3. 未登录无法保存；学员只能读取/更新自己的记录。
4. 选定课程作业后，保存的记录可提交为 `assignment_submissions`。
5. 助教反馈后，学员能在实战记录中看到反馈。
