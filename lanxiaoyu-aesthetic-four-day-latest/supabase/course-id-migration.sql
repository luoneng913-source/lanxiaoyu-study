-- 课程权限拆分迁移：请在 Supabase SQL Editor 执行。
-- 先创建新课程记录，再迁移权限；本脚本不删除旧 day-* 记录。

begin;

-- 7天业绩倍增突击营：复制原有 day-* 课程为 growth-day-*。
insert into public.courses (id, title, storage_path)
select 'growth-' || id, title, storage_path
from public.courses
where id like 'day-%'
on conflict (id) do nothing;

-- 全案色彩美学精华班：创建独立的 aesthetic-day-* 课程记录。
-- 前三天使用课件提炼后的正式主题，不能继续沿用突击营的旧标题。
insert into public.courses (id, title, storage_path)
values
  ('aesthetic-day-1', '全案色彩美学精华班｜DAY 1 经营认知：从卖产品到卖确定性', null),
  ('aesthetic-day-2', '全案色彩美学精华班｜DAY 2 审美判断：把感觉翻译成色形质与比例', null),
  ('aesthetic-day-3', '全案色彩美学精华班｜DAY 3 诊断成交：从客户原话到成交路径', null),
  ('aesthetic-day-4', '全案色彩美学精华班｜DAY 4 色彩沟通与成交', null)
on conflict (id) do update
set title = excluded.title,
    storage_path = excluded.storage_path;

-- 原有 day-* 权限先迁移为 growth-*，保留原权限以便回滚。
insert into public.user_course_access (user_id, course_id, expires_at)
select user_id, 'growth-' || course_id, expires_at
from public.user_course_access
where course_id like 'day-%'
on conflict (user_id, course_id) do nothing;

commit;

-- 验证新课程记录
select id, title
from public.courses
where id like 'growth-%' or id like 'aesthetic-%'
order by id;
