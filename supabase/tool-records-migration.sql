-- 第二阶段：实战工具记录、助教查看与作业关联
-- 在 Supabase Dashboard → SQL Editor 中完整执行。
-- 本迁移只新增列、表、函数和策略；不会删除既有课程、作业、资料或用户数据。

begin;

alter table public.profiles
  add column if not exists role text not null default 'student',
  add column if not exists mentor_id uuid references auth.users(id) on delete set null,
  add column if not exists avatar_url text;

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('student', 'assistant', 'admin'));

-- Existing members become students unless an administrator explicitly changes the role.
update public.profiles
set role = 'student'
where role is null or role not in ('student', 'assistant', 'admin');

-- Learners must never be able to promote themselves or change their own mentor.
revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.role from public.profiles p where p.id = auth.uid()), 'student');
$$;

create or replace function public.is_assistant_for_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_profile_role() = 'assistant'
    and exists (
      select 1
      from public.profiles learner
      where learner.id = target_user_id
        and learner.mentor_id = auth.uid()
    );
$$;

create or replace function public.is_assistant_for_submission(target_submission_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.assignment_submissions submission
    where submission.id = target_submission_id
      and public.is_assistant_for_user(submission.user_id)
  );
$$;

create table if not exists public.tool_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id text not null,
  title text not null,
  input_data jsonb not null default '{}'::jsonb,
  result_data jsonb not null default '{}'::jsonb,
  action_plan text not null default '',
  status text not null default '待执行' check (status in ('待执行', '已执行', '待复盘', '已完成')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assignment_submissions
  add column if not exists tool_record_id uuid references public.tool_records(id) on delete set null;

create index if not exists tool_records_user_created_idx
  on public.tool_records(user_id, created_at desc);
create index if not exists tool_records_tool_status_idx
  on public.tool_records(tool_id, status);
create index if not exists tool_records_updated_at_idx
  on public.tool_records(updated_at desc);
create index if not exists assignment_submissions_tool_record_idx
  on public.assignment_submissions(tool_record_id);
create index if not exists profiles_mentor_id_idx
  on public.profiles(mentor_id);

create or replace function public.touch_tool_records_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_tool_records_updated_at on public.tool_records;
create trigger touch_tool_records_updated_at
  before update on public.tool_records
  for each row execute procedure public.touch_tool_records_updated_at();

alter table public.tool_records enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.assignment_feedback enable row level security;

drop policy if exists "tool records are visible to owner or assigned staff" on public.tool_records;
create policy "tool records are visible to owner or assigned staff"
  on public.tool_records for select to authenticated
  using (
    user_id = auth.uid()
    or public.current_profile_role() = 'admin'
    or public.is_assistant_for_user(user_id)
  );

drop policy if exists "learners create their own tool records" on public.tool_records;
create policy "learners create their own tool records"
  on public.tool_records for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "learners update their own tool records" on public.tool_records;
create policy "learners update their own tool records"
  on public.tool_records for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "users read related submissions" on public.assignment_submissions;
create policy "users read related submissions"
  on public.assignment_submissions for select to authenticated
  using (
    user_id = auth.uid()
    or public.current_profile_role() = 'admin'
    or public.is_assistant_for_user(user_id)
  );

drop policy if exists "learners create their own submissions" on public.assignment_submissions;
create policy "learners create their own submissions"
  on public.assignment_submissions for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "learners or assigned staff update submissions" on public.assignment_submissions;
drop policy if exists "learners update their own submissions" on public.assignment_submissions;
create policy "learners or assigned staff update submissions"
  on public.assignment_submissions for update to authenticated
  using (
    user_id = auth.uid()
    or public.current_profile_role() = 'admin'
    or public.is_assistant_for_user(user_id)
  )
  with check (
    user_id = auth.uid()
    or public.current_profile_role() = 'admin'
    or public.is_assistant_for_user(user_id)
  );

drop policy if exists "users read feedback for their submissions" on public.assignment_feedback;
create policy "users read feedback for their submissions"
  on public.assignment_feedback for select to authenticated
  using (
    exists (
      select 1
      from public.assignment_submissions submission
      where submission.id = assignment_feedback.submission_id
        and (
          submission.user_id = auth.uid()
          or public.current_profile_role() = 'admin'
          or public.is_assistant_for_user(submission.user_id)
        )
    )
  );

drop policy if exists "assigned staff create feedback" on public.assignment_feedback;
create policy "assigned staff create feedback"
  on public.assignment_feedback for insert to authenticated
  with check (
    public.current_profile_role() = 'admin'
    or public.is_assistant_for_submission(submission_id)
  );

commit;

-- 执行后验证新表、列和角色列是否已创建：
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'tool_records';

select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'assignment_submissions'
  and column_name = 'tool_record_id';
