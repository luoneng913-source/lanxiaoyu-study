-- 课程权限拆分迁移：请在 Supabase SQL Editor 执行。
-- 先创建新课程记录，再迁移权限；本脚本不删除旧 day-* 记录。

begin;

-- 7天业绩倍增突击营：复制原有 day-* 课程为 growth-day-*。
insert into public.courses (id, title, storage_path)
select 'growth-' || id, title, storage_path
from public.courses
where id like 'day-%'
on conflict (id) do nothing;

-- 用原始课件提炼后的正式主题覆盖旧标题；不改动已有资料存储路径。
update public.courses as c
set title = v.title
from (values
  ('growth-day-1', '7天业绩倍增突击营｜DAY 1 认知重建：从卖产品到卖整体解决方案'),
  ('growth-day-2', '7天业绩倍增突击营｜DAY 2 模式突围：找到业绩倍增快车道'),
  ('growth-day-3', '7天业绩倍增突击营｜DAY 3 客户读心术：别急着卖，先看懂人'),
  ('growth-day-4', '7天业绩倍增突击营｜DAY 4 美 × 走心：把感觉变成专业判断'),
  ('growth-day-5', '7天业绩倍增突击营｜DAY 5 流程成交：用6大要素打造接待路径'),
  ('growth-day-6', '7天业绩倍增突击营｜DAY 6 高手进阶：从配色翻车到高级出彩'),
  ('growth-day-7', '7天业绩倍增突击营｜DAY 7 硬核系统：精准销售7步法')
) as v(id, title)
where c.id = v.id;

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
