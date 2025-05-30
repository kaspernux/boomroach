import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gradient-to-r from-zinc-800/50 to-zinc-700/50 backdrop-blur-sm", className)}
      {...props}
    />
  )
}

export { Skeleton }