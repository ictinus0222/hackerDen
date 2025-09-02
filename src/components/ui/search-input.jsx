import * as React from "react"
import { Input } from "./input"
import { cn } from "../../lib/utils"
import { SearchIcon, XIcon } from "lucide-react"

const SearchInput = React.forwardRef(({
  className,
  onClear,
  value,
  placeholder = "Search...",
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = React.useState(value || "")
  const isControlled = value !== undefined
  const inputValue = isControlled ? value : internalValue

  const handleChange = (e) => {
    if (!isControlled) {
      setInternalValue(e.target.value)
    }
    props.onChange?.(e)
  }

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue("")
    }
    onClear?.()
  }

  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        ref={ref}
        type="search"
        variant="search"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10 pr-10"
        {...props}
      />
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  )
})

SearchInput.displayName = "SearchInput"

export { SearchInput }