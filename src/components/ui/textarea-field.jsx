import * as React from "react"
import { Textarea } from "./textarea"
import { Label } from "./label"
import { cn } from "../../lib/utils"

const TextareaField = React.forwardRef(({
  label,
  error,
  description,
  required = false,
  className,
  id,
  maxLength,
  showCharCount = false,
  value,
  ...props
}, ref) => {
  const inputId = id || React.useId()
  const errorId = `${inputId}-error`
  const descriptionId = `${inputId}-description`
  const charCountId = `${inputId}-char-count`

  const [internalValue, setInternalValue] = React.useState(value || "")
  const isControlled = value !== undefined
  const textValue = isControlled ? value : internalValue

  const handleChange = (e) => {
    if (!isControlled) {
      setInternalValue(e.target.value)
    }
    props.onChange?.(e)
  }

  const charCount = textValue.length
  const isNearLimit = maxLength && charCount > maxLength * 0.8
  const isOverLimit = maxLength && charCount > maxLength

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={inputId} className="text-sm font-medium">
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
      
      <Textarea
        ref={ref}
        id={inputId}
        value={textValue}
        onChange={handleChange}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive",
          isOverLimit && "border-destructive focus-visible:ring-destructive"
        )}
        aria-describedby={cn(
          error && errorId,
          description && descriptionId,
          (showCharCount || maxLength) && charCountId
        )}
        aria-invalid={error || isOverLimit ? "true" : "false"}
        required={required}
        maxLength={maxLength}
        {...props}
      />
      
      {(showCharCount || maxLength) && (
        <div id={charCountId} className="flex justify-end">
          <span className={cn(
            "text-xs",
            isOverLimit ? "text-destructive" : 
            isNearLimit ? "text-yellow-600" : 
            "text-muted-foreground"
          )}>
            {charCount}{maxLength && `/${maxLength}`}
          </span>
        </div>
      )}
      
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

TextareaField.displayName = "TextareaField"

export { TextareaField }