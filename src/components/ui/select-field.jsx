import * as React from "react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./select"
import { Label } from "./label"
import { cn } from "../../lib/utils"

const SelectField = React.forwardRef(({
  label,
  error,
  description,
  required = false,
  className,
  id,
  placeholder = "Select an option",
  options = [],
  children,
  ...props
}, ref) => {
  const selectId = id || React.useId()
  const errorId = `${selectId}-error`
  const descriptionId = `${selectId}-description`

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={selectId} className="text-sm font-medium">
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-label="required">
              *
            </span>
          )}
        </Label>
      )}
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      <Select
        {...props}
      >
        <SelectTrigger
          ref={ref}
          id={selectId}
          className={cn(
            error && "border-destructive focus:ring-destructive aria-invalid:border-destructive"
          )}
          aria-describedby={cn(
            error && errorId,
            description && descriptionId
          )}
          aria-invalid={error ? "true" : "false"}
          required={required}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children || options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {error && (
        <p id={errorId} className="text-sm text-destructive flex items-center gap-1" role="alert">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
})

SelectField.displayName = "SelectField"

export { SelectField }