import { LucideIcon } from "lucide-react";

type StatCardProps = {
    title: string;
    value: number;
    color: string;
    icon: LucideIcon;
}

export default function StatCard({title, value, color, icon: Icon}: StatCardProps) {
  return (
    <div className={`${color} flex min-h-35 items-center p-5 text-white shadow-sm `}>
        <div className="mr-5 flex h-25 w-20 items-center justify-center border-r border-white/20 text-white/75">
            <Icon size={54} strokeWidth={1.4}/>
        </div>

        <div>
            <div className="text-[34px] font-bold">
                {value}
            </div>

            <div className="text-xs font-semibold uppercase">
                {title}
            </div>
        </div>
    </div>
  )
}

