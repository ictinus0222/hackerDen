import * as React from "react"
import { RadioGroup, RadioGroupItem } from "./radio-group"
import { Label } from "./label"
import { cn } from "../../lib/utils"

const RadioField = React.forwardRef(({
  label,
  description,
  error,
  className,
  id,
  options = [],
  children,
  ...props
}, ref) => {
  const radioId = id || React.useId()
  const errorId = `${radioId}-error`
  const descriptionId = `${radioId}-description`

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
        </Label>
      )}
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      <RadioGroup
        ref={ref}
        className={cn(
          error && "border-destructive"
        )}
        aria-describedby={cn(
          error && errorId,
          description && descriptionId
        )}
        aria-invalid={error ? "true" : "false"}
        {...props}
      >
        {children || options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`${radioId}-${option.value}`} />
            <Label 
              htmlFor={`${radioId}-${option.value}`}
              className="text-sm font-normal"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      
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

RadioField.displayName = "RadioField"

export { RadioField }