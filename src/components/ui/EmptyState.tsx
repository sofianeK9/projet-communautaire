import { type LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="p-4 bg-slate-800/60 rounded-2xl mb-4">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-slate-500 text-sm text-center max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}
