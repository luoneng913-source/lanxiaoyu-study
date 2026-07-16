import Link from "next/link";

const items = [
  ["/dashboard", "今日学习"],
  ["/courses", "我的课程"],
  ["/assignments", "作业与通关"],
  ["/tools", "实战工具"],
  ["/growth", "成长档案"],
  ["/resources", "资料库"],
] as const;

export function LearningHeader({ active }: { active: string }) {
  return (
    <header className="learning-header">
      <Link className="learning-brand" href="/dashboard">
        <strong>蓝筱玉整装学堂</strong><span>学习成长中心</span>
      </Link>
      <nav aria-label="学习中心主导航">
        {items.map(([href, label]) => <Link className={active === href ? "active" : ""} href={href} key={href}>{label}</Link>)}
      </nav>
      <Link className="learning-profile-link" href="/profile">我的账户</Link>
    </header>
  );
}
