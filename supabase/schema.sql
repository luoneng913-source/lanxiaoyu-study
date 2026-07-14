-- 蓝筱玉整装学堂：Supabase Auth + 课程权限 + 私有资料下载
-- 在 Supabase Dashboard → SQL Editor 中一次性执行。

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id text primary key,
  title text not null,
  description text,
  storage_bucket text not null default 'course-files',
  storage_path text,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_course_access (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  granted_by uuid references auth.users(id),
  primary key (user_id, course_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', '学员'))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.user_course_access enable row level security;

drop policy if exists "users can read their own profile" on public.profiles;
create policy "users can read their own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "authenticated users can read published courses" on public.courses;
create policy "authenticated users can read published courses"
  on public.courses for select to authenticated
  using (is_published = true);

drop policy if exists "users can read their own course access" on public.user_course_access;
create policy "users can read their own course access"
  on public.user_course_access for select to authenticated
  using (user_id = auth.uid());

-- 私有 bucket：不要把课程 PDF 放到 public/ 目录，也不要把 bucket 设为公开。
insert into storage.buckets (id, name, public)
values ('course-files', 'course-files', false)
on conflict (id) do update set public = false;

drop policy if exists "users can read granted course files" on storage.objects;
create policy "users can read granted course files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'course-files'
    and exists (
      select 1
      from public.courses c
      join public.user_course_access a on a.course_id = c.id
      where c.storage_bucket = storage.objects.bucket_id
        and c.storage_path = storage.objects.name
        and c.is_published = true
        and a.user_id = auth.uid()
        and (a.expires_at is null or a.expires_at > now())
    )
  );

-- 7天课程元数据。storage_path 在上传 PDF 后回填，例如：day-1/product-check.pdf
insert into public.courses (id, title, description, sort_order)
values
  ('day-1', 'DAY 1｜认知重建', '从卖产品升级为卖整体方案', 1),
  ('day-2', 'DAY 2｜定位选择', '判断门店适合的整装路径', 2),
  ('day-3', 'DAY 3｜客户读心', '识别客户需求、顾虑与决策阻力', 3),
  ('day-4', 'DAY 4｜美学能力', '用色、形、质进行专业判断', 4),
  ('day-5', 'DAY 5｜全案流程', '把需求、方案、预算和落地串起来', 5),
  ('day-6', 'DAY 6｜配色升级', '用比例和色彩关系替代单品式配色', 6),
  ('day-7', 'DAY 7｜成交系统', '把诊断、影响、优化、结果和推进变成固定动作', 7)
on conflict (id) do update set title = excluded.title, description = excluded.description;

