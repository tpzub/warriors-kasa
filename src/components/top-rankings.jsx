import { Medal, Trophy, User, Crown } from "lucide-react"
import { cn } from "../lib/utils"

export function TopRankings({
  title,
  items,
  type,
  className
}) {
  const getIcon = (position) => {
    switch (position) {
      case 0:
        return (
          <div
            className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full">
            <Crown className="h-4 w-4 text-white" />
          </div>
        );
      case 1:
        return (
          <div
            className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full">
            <Trophy className="h-4 w-4 text-white" />
          </div>
        );
      case 2:
        return (
          <div
            className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-700 rounded-full">
            <Medal className="h-4 w-4 text-white" />
          </div>
        );
      default:
        return <User className="h-4 w-4" />;
    }
  }

  const getPositionClass = (position) => {
    switch (position) {
      case 0:
        return "bg-white border-yellow-300"
      case 1:
        return "bg-white border-gray-300"
      case 2:
        return "bg-white border-amber-300"
      default:
        return "bg-white border-gray-200"
    }
  }

  return (
    <div className={cn("w-full mx-auto", className)}>
      <div
        className={cn(
          "rounded-lg shadow-md overflow-hidden border-l-4 mb-4",
          type === "debtors" ? "border-l-red-500" : "border-l-green-500"
        )}>
        <div
          className={cn(
            "py-3 px-4 font-bold text-white text-center text-base",
            type === "debtors" ? "bg-red-500" : "bg-green-500"
          )}>
          {title}
          {type === "debtors" ? <span className="ml-2">💸</span> : <span className="ml-2">🏆</span>}
        </div>

        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center p-3 transition-all hover:brightness-95",
                getPositionClass(index)
              )}>
              <div className="flex items-center justify-center mr-3">{getIcon(index)}</div>

              <div
                className="relative w-9 h-9 rounded-full overflow-hidden border border-white shadow-sm mr-3">
                <img
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 text-sm font-medium">{item.name}</div>

              <div
                className={cn(
                  "px-3 py-1 rounded-full text-white font-medium text-sm",
                  type === "debtors" ? "bg-red-500" : "bg-green-500"
                )}>
                {item.amount.toLocaleString()} Kč
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

