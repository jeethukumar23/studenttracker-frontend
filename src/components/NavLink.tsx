import { NavLink as RouterNavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavProps {
  to: string;
  icon?: React.ReactNode;
  label: string;
}

export function NavLink({ to, icon, label }: NavProps) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",

          // Active styles (highlight)
          isActive
            ? "bg-orange-200 text-orange-700"
            : "text-gray-700 hover:bg-orange-100"
        )
      }
      end
    >
      {icon}
      <span>{label}</span>
    </RouterNavLink>
  );
}
