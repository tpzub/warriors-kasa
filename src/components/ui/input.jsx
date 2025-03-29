import * as React from "react"

import { cn } from "../../lib/utils.js"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground border-input flex h-10 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-none transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-gray-300 hover:bg-transparent",
        "focus:border-gray-400 focus:outline-none focus:ring-0 focus:shadow-none focus:bg-transparent",
        "aria-invalid:border-destructive",
        "placeholder:text-base placeholder:text-[16px]",
        className
      )}
      {...props} />
  );
}

export { Input }
