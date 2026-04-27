import { twMerge } from "tailwind-merge";

type BadgeColor = "green" | "yellow" | "blue" | "red" | "gray" | "purple";

const colors: Record<BadgeColor, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  yellow: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  red: "bg-red-50 text-red-700 border-red-200",
  gray: "bg-gray-50 text-gray-600 border-gray-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
};

export function Badge({
  color = "gray",
  children,
  className,
}: {
  color?: BadgeColor;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border",
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
}
