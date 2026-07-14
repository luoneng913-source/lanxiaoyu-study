-- 示例：把某位学员加入 DAY 1 和 DAY 7。
-- 先在 Supabase Authentication → Users 复制用户 UUID，再替换下面的 UUID。

insert into public.user_course_access (user_id, course_id, granted_by)
values
  ('00000000-0000-0000-0000-000000000000', 'day-1', null),
  ('00000000-0000-0000-0000-000000000000', 'day-7', null)
on conflict (user_id, course_id) do nothing;

-- 上传 PDF 后，为每个课程回填私有 Storage 路径：
-- update public.courses
-- set storage_path = 'day-1/product-check.pdf'
-- where id = 'day-1';

