-- 第二阶段：把“门店客户身份分层转化工具”接入两套课程的 DAY 3。
-- 可在 tool-records-migration.sql 执行成功后运行；只新增或更新这两个课程的章节与作业，不删除任何现有数据。

begin;

insert into public.courses (id, title, description, sort_order)
values
  ('growth-day-3', '7天业绩倍增突击营｜DAY 3 客户读心术', '从客户原话识别需求、决策人与下一步沟通入口。', 3),
  ('aesthetic-day-3', '全案色彩美学精华班｜DAY 3 诊断成交', '从客户原话识别决策人、客户类型与成交路径。', 3)
on conflict (id) do update set title = excluded.title, description = excluded.description;

insert into public.course_modules (course_id, day_number, title, sort_order)
values
  ('growth-day-3', 3, 'DAY 3｜客户读心术', 3),
  ('aesthetic-day-3', 3, 'DAY 3｜诊断成交', 3)
on conflict (course_id, day_number) do update set title = excluded.title, sort_order = excluded.sort_order;

insert into public.assignments (module_id, title, instructions, pass_criteria)
select module.id,
       case module.course_id
         when 'growth-day-3' then 'DAY 3｜客户身份分层与下一步沟通'
         else 'DAY 3｜客户身份分层诊断成交作业'
       end,
       '使用“门店客户身份分层转化工具”完成一位真实客户诊断；确认五项评分、补齐缺失信息，保存记录后提交为作业。',
       '评分有事实依据；明确客户层级、主要风险、下一步动作与建议跟进时间；不得只凭主观印象下结论。'
from public.course_modules module
where module.course_id in ('growth-day-3', 'aesthetic-day-3')
  and module.day_number = 3
  and not exists (
    select 1 from public.assignments assignment
    where assignment.module_id = module.id
      and assignment.title like 'DAY 3｜客户身份分层%'
  );

commit;

-- 执行后验证：应返回两条工具关联作业。
select course_modules.course_id, assignments.id, assignments.title
from public.assignments
join public.course_modules on course_modules.id = assignments.module_id
where assignments.title like 'DAY 3｜客户身份分层%'
order by course_modules.course_id;
