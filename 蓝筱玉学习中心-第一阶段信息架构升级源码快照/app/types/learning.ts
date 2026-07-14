export type LearningView =
  | "dashboard"
  | "courses"
  | "assignments"
  | "tools"
  | "growth"
  | "resources"
  | "profile"
  // Compatibility aliases used by the current single-page implementation.
  | "home"
  | "path"
  | "templates";

export type CourseStatus = "学习中" | "已完成" | "待开始" | "暂未开放";
export type AssignmentStatus = "未开始" | "进行中" | "已提交" | "待批改" | "需修改" | "已通过";

export type CourseSummary = {
  id: string;
  title: string;
  progress: number;
  status: CourseStatus;
  recentLesson: string;
  pendingAssignments: number;
  expiresAt?: string;
};

export type AssignmentSummary = {
  id: string;
  title: string;
  courseTitle: string;
  status: AssignmentStatus;
  dueLabel: string;
  feedback?: string;
};

export type FeedbackSummary = {
  teacherName: string;
  content: string;
  createdAt: string;
};
