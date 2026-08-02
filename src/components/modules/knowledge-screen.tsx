"use client";

import { BookOpen, FileInput, Link2Off, Plus, Search, Star, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ModuleHeader } from "./module-header";

const notes = [
  { title: "本周产品决策记录", excerpt: "明确第一阶段只解决收集、行动和反馈闭环。", tags: ["产品", "决策"], time: "今天 10:42", favorite: true },
  { title: "健康数据应该怎样被使用", excerpt: "趋势是为了发现模式，而不是制造每日焦虑。", tags: ["健康", "原则"], time: "昨天", favorite: false },
  { title: "八月阅读清单", excerpt: "系统设计、行为科学与一本小说。", tags: ["阅读"], time: "7月30日", favorite: false },
];

export function KnowledgeScreen() {
  return (
    <div className="mx-auto max-w-[1380px] px-4 py-7 sm:px-6 lg:px-8">
      <ModuleHeader icon={BookOpen} title="知识空间" description="让记录可被找到，也能与行动产生联系。" action={<Button><Plus data-icon="inline-start" />快速笔记</Button>} />
      <label className="relative mt-7 block"><Search aria-hidden="true" className="absolute left-4 top-4 size-5 text-subtle" /><Input className="h-14 border-line-strong bg-transparent pl-12 text-base" placeholder="搜索笔记、标签和收藏" /></label>
      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_280px]">
        <section><div className="flex items-center justify-between border-b border-border pb-3"><h2 className="font-semibold">最近编辑</h2><button className="text-sm text-primary" type="button">查看全部</button></div><ul className="divide-y divide-border">{notes.map((note) => <li key={note.title} className="py-5"><div className="flex items-start gap-3"><button aria-label={note.favorite ? "取消收藏" : "收藏"} type="button" className={note.favorite ? "text-accent" : "text-subtle"}><Star className="size-4" fill={note.favorite ? "currentColor" : "none"} /></button><div className="min-w-0 flex-1"><h3 className="font-medium">{note.title}</h3><p className="mt-2 text-sm text-muted">{note.excerpt}</p><div className="mt-3 flex items-center gap-2">{note.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}<span className="ml-auto text-xs text-subtle">{note.time}</span></div></div></div></li>)}</ul></section>
        <aside className="flex flex-col gap-6"><section className="border-l-2 border-primary pl-4"><div className="flex items-center gap-2"><Tag className="size-4 text-primary" /><h2 className="text-sm font-semibold">常用标签</h2></div><div className="mt-4 flex flex-wrap gap-2">{["产品", "健康", "决策", "阅读", "灵感", "家庭"].map((tag) => <Badge key={tag}>{tag}</Badge>)}</div></section><section className="border-t border-border pt-5"><div className="flex items-center gap-2"><Link2Off className="size-4 text-muted" /><h2 className="text-sm font-semibold">Obsidian 接口</h2></div><p className="mt-2 text-xs leading-5 text-muted">暂未启用同步。后续通过独立适配器导入 Markdown，不直接耦合本地仓库。</p><Button className="mt-4" variant="outline" size="sm" disabled><FileInput data-icon="inline-start" />尚未启用</Button></section></aside>
      </div>
    </div>
  );
}
