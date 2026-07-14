# Supabase 接入与部署步骤

## 1. 创建 Supabase 项目

在 Supabase 创建项目后，打开 `SQL Editor`，执行同目录下的 `schema.sql`。

这会创建：

- `auth.users`：Supabase 内置用户表，密码由 Supabase Auth 哈希保存，网站不保存明文密码。
- `public.profiles`：学员资料表，保存显示名和邮箱。
- `public.courses`：课程元数据和私有资料路径。
- `public.user_course_access`：用户与课程的权限关联表。
- `course-files`：私有 Storage bucket。

## 2. 配置邮箱验证与找回密码

在 Authentication → URL Configuration 中设置：

- Site URL：你的 Vercel 域名，例如 `https://你的项目.vercel.app`
- Redirect URLs：`https://你的项目.vercel.app/auth/reset`

如果使用 Sites 预览地址，也将该地址加入 Redirect URLs。

## 3. 添加 Vercel 环境变量

在 Vercel Project → Settings → Environment Variables 中添加：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

其中 `SUPABASE_SERVICE_ROLE_KEY` 只用于服务端生成短时下载链接，不能以 `NEXT_PUBLIC_` 开头，也不能写入前端代码。

三项变量都要勾选 Production、Preview、Development（按你的使用范围选择）。

## 4. 上传私有课程资料

在 Storage → `course-files` 上传 PDF。不要把 PDF 放在网站的 `public/` 目录，也不要把 bucket 设置为 Public。

上传后，回到 SQL Editor 回填路径，例如：

```sql
update public.courses
set storage_path = 'day-1/product-check.pdf'
where id = 'day-1';
```

## 5. 给学员开通课程

先在 Authentication → Users 复制学员 UUID，再执行：

```sql
insert into public.user_course_access (user_id, course_id)
values ('学员UUID', 'day-1'), ('学员UUID', 'day-7')
on conflict (user_id, course_id) do nothing;
```

## 6. 重新部署

保存 Vercel 环境变量后，进入 Deployments，点击 Redeploy。部署完成后：

1. 注册一个测试账号；
2. 完成邮箱验证；
3. 登录；
4. 给测试账号写入 `user_course_access`；
5. 验证只有已授权课程显示为可进入；
6. 验证下载链接只能由有权限账号生成，且链接约 60 秒后失效。

