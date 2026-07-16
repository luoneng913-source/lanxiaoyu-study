-- 第一阶段学习闭环数据规划
-- 只新增表，不删除或改写 courses、user_course_access、auth.users。
begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses(id) on delete cascade,
  day_number integer not null,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(course_id, day_number)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  summary text not null default '',
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  instructions text not null default '',
  pass_criteria text not null default '',
  status_options text[] not null default array['未开始','进行中','已提交','待批改','需修改','已通过'],
  created_at timestamptz not null default now()
);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default '未开始',
  text_content text not null default '',
  attachment_paths text[] not null default '{}',
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(assignment_id, user_id)
);

create table if not exists public.assignment_feedback (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.assignment_submissions(id) on delete cascade,
  teacher_id uuid references auth.users(id) on delete set null,
  content text not null default '',
  requires_revision boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  module_id uuid references public.course_modules(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  last_seen_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(user_id, course_id, module_id, lesson_id)
);

create index if not exists course_modules_course_id_idx on public.course_modules(course_id);
create index if not exists assignments_module_id_idx on public.assignments(module_id);
create index if not exists submissions_user_id_idx on public.assignment_submissions(user_id);
create index if not exists learning_progress_user_course_idx on public.learning_progress(user_id, course_id);

commit;

-- 执行后只验证新表是否存在：
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('profiles','course_modules','lessons','assignments','assignment_submissions','assignment_feedback','learning_progress')
order by table_name;
