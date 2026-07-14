import type { LearningView } from "@/app/types/learning";

export const desktopNavigation: { id: LearningView; label: string }[] = [
  { id: "dashboard", label: "今日学习" },
  { id: "courses", label: "我的课程" },
  { id: "assignments", label: "作业与通关" },
  { id: "tools", label: "实战工具" },
  { id: "growth", label: "成长档案" },
  { id: "resources", label: "资料库" },
];

export const mobileNavigation: { id: LearningView; label: string; icon: string }[] = [
  { id: "dashboard", label: "首页", icon: "⌂" },
  { id: "courses", label: "课程", icon: "▤" },
  { id: "assignments", label: "作业", icon: "✓" },
  { id: "tools", label: "工具", icon: "▦" },
  { id: "profile", label: "我的", icon: "○" },
];
