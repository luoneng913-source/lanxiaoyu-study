import type { LearningView } from "@/app/types/learning";

type Props = {
  currentView: LearningView;
  onNavigate: (view: LearningView) => void;
};

export function DesktopNav({ currentView, onNavigate }: Props) {
  return (
    <nav className="primary-nav" aria-label="主要栏目">
      <button className={currentView === "dashboard" || currentView === "home" ? "nav-link active" : "nav-link"} onClick={() => onNavigate("dashboard")}>今日学习</button>
      <button className={currentView === "courses" ? "nav-link active" : "nav-link"} onClick={() => onNavigate("courses")}>我的课程</button>
      <button className={currentView === "assignments" ? "nav-link active" : "nav-link"} onClick={() => onNavigate("assignments")}>作业与通关</button>
      <button className={currentView === "tools" ? "nav-link active" : "nav-link"} onClick={() => onNavigate("tools")}>实战工具</button>
      <button className={currentView === "growth" || currentView === "path" ? "nav-link active" : "nav-link"} onClick={() => onNavigate("growth")}>成长档案</button>
      <button className={currentView === "resources" || currentView === "templates" ? "nav-link active" : "nav-link"} onClick={() => onNavigate("resources")}>资料库</button>
    </nav>
  );
}
