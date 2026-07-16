# 蓝筱玉学习中心第一阶段信息架构升级 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保留现有视觉、登录、课程权限和下载链路的前提下，建立以今日学习和作业通关为中心的可扩展信息架构。

**Architecture:** 采用兼容式拆分。先用共享类型、数据模块和页面区块边界承接现有 `app/page.tsx`，再逐步迁移渲染逻辑；Supabase 访问层保持原接口，避免第一阶段引入破坏性数据库变更。

**Tech Stack:** Next.js App Router、React、TypeScript、Supabase、现有 CSS 变量与铜金视觉样式。

## Global Constraints

- 不改变现有深色铜金视觉风格。
- 不删除现有课程、工具、模板和资料内容。
- 不把私有资料放入 `public`。
- 不删除 `courses`、`user_course_access` 或 `auth.users`。
- 每个任务完成后必须运行可用的构建或静态检查；若依赖文件不在当前快照，必须记录阻塞原因。

---

### Task 1: 备份与现状记录

**Files:**
- Create: `蓝筱玉学习中心-第一阶段改造前备份.zip`
- Create: `docs/superpowers/specs/2026-07-14-learning-center-ia-design.md`

- [x] 备份当前可见的 `app/` 与 `supabase/`。
- [x] 记录当前快照缺少的构建文件，避免误报构建成功。

### Task 2: 建立共享类型与导航模型

**Files:**
- Create: `app/types/learning.ts`
- Create: `app/data/navigation.ts`

- [ ] 定义 `LearningView`、`CourseStatus`、`AssignmentStatus`、`CourseSummary`、`AssignmentSummary` 和 `FeedbackSummary`。
- [ ] 定义桌面六项导航与手机五项导航，保持 `tools`、`templates` 等旧视图可映射。

### Task 3: 拆出学习区块

**Files:**
- Create: `app/components/learning/DashboardView.tsx`
- Create: `app/components/learning/CourseCard.tsx`
- Create: `app/components/learning/AssignmentCard.tsx`
- Create: `app/components/learning/ProgressSummary.tsx`

- [ ] 将今日学习需要的姓名、当前课程、今日练习、待提交作业、通关状态、老师反馈和下一步行动定义成显式 props。
- [ ] 组件只负责展示和回调，不直接创建 Supabase 客户端。

### Task 4: 拆出导航与页面壳

**Files:**
- Create: `app/components/layout/DesktopNav.tsx`
- Create: `app/components/layout/MobileBottomNav.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [ ] 将登录后的默认视图切换到 dashboard。
- [ ] 电脑端使用六项新导航，手机端使用五项底部导航。
- [ ] 保留原有搜索、账号和主题变量。

### Task 5: 增加阶段页面骨架

**Files:**
- Create: `app/(learning)/dashboard/page.tsx`
- Create: `app/(learning)/courses/page.tsx`
- Create: `app/(learning)/assignments/page.tsx`
- Create: `app/(learning)/tools/page.tsx`
- Create: `app/(learning)/growth/page.tsx`
- Create: `app/(learning)/resources/page.tsx`
- Create: `app/(learning)/profile/page.tsx`

- [ ] 页面复用现有数据和权限状态。
- [ ] 作业页先实现状态、要求、提交入口和反馈区域，不实现真实上传。

### Task 6: 数据库迁移草案

**Files:**
- Create: `supabase/learning-loop-migration.sql`

- [ ] 仅新增 `profiles`、`course_modules`、`lessons`、`assignments`、`assignment_submissions`、`assignment_feedback`、`learning_progress`。
- [ ] 使用 `create table if not exists` 和明确外键，不删除旧表。

### Task 7: 验证

- [ ] 若存在 `package.json`，运行 `npm run build`。
- [ ] 运行 TypeScript 检查或项目已有验证脚本。
- [ ] 检查旧课程工具、权限下载和手机端导航入口。
