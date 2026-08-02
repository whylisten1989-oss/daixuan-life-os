export type DemoTask = {
  id: string;
  time: string;
  endTime: string;
  title: string;
  detail: string;
  category: "工作" | "健康" | "成长" | "生活" | "复盘";
  status: "done" | "active" | "todo";
  estimate: number;
};

export type SignalDatum = { label: string; value: number };
