import { FlaskConical, ShieldCheck } from "lucide-react";
import { ModuleHeader } from "./module-header";

export function LabScreen() {
  return <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6"><ModuleHeader icon={FlaskConical} title="动效实验室" description="第三方动效进入正式页面前的隔离验证区。" /><section className="mt-8 border-l-2 border-primary pl-5"><div className="flex items-center gap-2"><ShieldCheck className="size-4 text-success" /><h2 className="font-semibold">当前没有第三方实验</h2></div><p className="mt-3 text-sm leading-6 text-muted">后续每个实验必须记录组件来源、许可证、bundle 影响、减少动画模式、键盘操作与手机性能，再决定是否进入正式页面。</p></section></div>;
}
