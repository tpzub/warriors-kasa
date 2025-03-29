import { cn } from "../lib/utils"

export function TopRankings({
  title,
  items,
  type,
  className
}) {
  const getPositionNumber = (position) => {
    return (
      <div className={cn(
        "flex items-center justify-center w-6 h-6 rounded-full font-semibold",
        type === "debtors" ? "bg-[#ED1B26]" : "bg-[#1fad02]",
        "text-white"
      )}>
        {position + 1}
      </div>
    );
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
          type === "debtors" ? "border-l-[#ED1B26]" : "border-l-[#1fad02]"
        )}>
        <div
          className={cn(
            "py-3 px-4 font-bold text-white text-center text-[15px]",
            type === "debtors" ? "bg-[#ED1B26]" : "bg-[#1fad02]"
          )}>
          {title}
        </div>

        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center p-2",
                getPositionClass(index)
              )}>
              <div className="flex items-center justify-center mr-3">
                {getPositionNumber(index)}
              </div>

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
                  type === "debtors" ? "bg-[#ED1B26]" : "bg-[#1fad02]"
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

