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
insert into public.courses (id, title, storage_path)
select 'aesthetic-' || id, '全案色彩美学精华班｜' || title, null
from public.courses
where id like 'day-%'
on conflict (id) do nothing;

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
