import type { LearningView } from "@/app/types/learning";

type Props = {
  currentView: LearningView;
  onNavigate: (view: LearningView) => void;
};

export function MobileBottomNav({ currentView, onNavigate }: Props) {
  const items: { id: LearningView; label: string; icon: string }[] = [
    { id: "dashboard", label: "首页", icon: "⌂" },
    { id: "courses", label: "课程", icon: "▤" },
    { id: "assignments", label: "作业", icon: "✓" },
    { id: "tools", label: "工具", icon: "▦" },
    { id: "profile", label: "我的", icon: "○" },
  ];
  return (
    <nav className="mobile-bottom-nav" aria-label="手机端导航">
      {items.map((item) => (
        <button key={item.id} className={currentView === item.id ? "active" : ""} onClick={() => onNavigate(item.id)}>
          <span aria-hidden="true">{item.icon}</span><small>{item.label}</small>
        </button>
      ))}
    </nav>
  );
}
