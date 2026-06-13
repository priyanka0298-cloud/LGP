import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        soft: "border-transparent bg-primary/10 text-primary",
        rose: "border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-400",
        lavender: "border-purple-100 bg-purple-50 text-purple-600 dark:border-purple-900/30 dark:bg-purple-950/30 dark:text-purple-400",
        sage: "border-green-100 bg-green-50 text-green-600 dark:border-green-900/30 dark:bg-green-950/30 dark:text-green-400",
        peach: "border-orange-100 bg-orange-50 text-orange-600 dark:border-orange-900/30 dark:bg-orange-950/30 dark:text-orange-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
