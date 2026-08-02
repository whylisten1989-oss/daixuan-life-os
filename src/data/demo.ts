import type { DemoTask, SignalDatum } from "@/types/dashboard";

export const todayTasks: DemoTask[] = [
  { id: "t1", time: "06:30", endTime: "07:00", title: "起床与晨间例行", detail: "已完成 · 30 分钟", category: "健康", status: "done", estimate: 30 },
  { id: "t2", time: "07:00", endTime: "07:45", title: "晨跑 5 公里", detail: "已完成 · 45 分钟", category: "健康", status: "done", estimate: 45 },
  { id: "t3", time: "09:30", endTime: "11:00", title: "完成产品需求评审", detail: "正在进行 · 预计 90 分钟", category: "工作", status: "active", estimate: 90 },
  { id: "t4", time: "11:15", endTime: "11:45", title: "团队站会", detail: "准备三个阻塞问题", category: "工作", status: "todo", estimate: 30 },
  { id: "t5", time: "14:00", endTime: "15:30", title: "梳理项目优先级", detail: "等待反馈后更新", category: "工作", status: "todo", estimate: 90 },
  { id: "t6", time: "16:00", endTime: "17:30", title: "学习 Next.js 路由与缓存", detail: "完成两个练习", category: "成长", status: "todo", estimate: 90 },
  { id: "t7", time: "21:30", endTime: "22:00", title: "复盘今日与明日计划", detail: "记录一个有效决策", category: "复盘", status: "todo", estimate: 30 },
];

export const cashFlow: SignalDatum[] = [
  { label: "04-17", value: 1.2 },
  { label: "04-20", value: 2.8 },
  { label: "04-23", value: 1.9 },
  { label: "04-26", value: 3.4 },
  { label: "04-29", value: -0.4 },
  { label: "05-02", value: 2.1 },
  { label: "05-05", value: 0.6 },
  { label: "05-08", value: -1.1 },
  { label: "05-11", value: -2.2 },
  { label: "05-14", value: 0.8 },
  { label: "05-16", value: 1.4 },
];

export const taskTrend: SignalDatum[] = [
  { label: "周一", value: 5 },
  { label: "周二", value: 7 },
  { label: "周三", value: 6 },
  { label: "周四", value: 8 },
  { label: "周五", value: 7 },
  { label: "周六", value: 4 },
  { label: "周日", value: 6 },
];

export const featureSections = {
  tasks: ["Inbox", "今日任务", "全部任务", "项目", "子任务", "优先级", "等待中", "逾期", "循环任务", "已完成"],
  finance: ["账户", "收入与支出", "月度预算", "固定支出", "订阅", "信用卡", "贷款", "储蓄目标", "大额消费计划"],
  health: ["睡眠", "饮水", "运动", "精力", "心情", "压力", "每日状态", "健康目标", "趋势"],
};
