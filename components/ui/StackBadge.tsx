type StackBadgeProps = {
  stack: string;
}

export default function StackBadge({ stack }: StackBadgeProps) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 text-cyan-500 font-semibold">
      {stack}
    </span>
  )
}