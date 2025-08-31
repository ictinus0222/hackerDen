import * as React from "react"
import { cn } from "../../lib/utils"
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField as ShadcnFormField,
} from "./form"
import { Input } from "./input"
import { Textarea } from "./textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

// Reusable form field component that wraps Shadcn form components
function FormField({ 
  control, 
  name, 
  label, 
  description, 
  type = "text", 
  placeholder, 
  options = [], 
  required = false,
  disabled = false,
  className,
  ...props 
}) {
  const renderInput = (field) => {
    const baseProps = {
      ...field,
      placeholder,
      disabled,
      className: cn(
        "w-full px-4 py-3 text-base rounded-xl border text-white placeholder-dark-tertiary focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 transition-all duration-200 bg-background-sidebar border-dark-primary/30 hover:border-green-500/50",
        className
      ),
      style: { fontSize: '16px' },
      ...props
    }

    switch (type) {
      case "textarea":
        return <Textarea {...baseProps} rows={3} className={cn(baseProps.className, "resize-none")} />
      
      case "select":
        return (
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
            <SelectTrigger className={cn(
              "w-full px-4 py-3 text-base rounded-xl justify-between bg-background-sidebar border-dark-primary/30 hover:border-green-500/50 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 transition-all duration-200",
              className
            )} style={{ fontSize: '16px' }}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border rounded-xl shadow-lg max-h-60">
              {options.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="px-4 py-3 text-base text-popover-foreground hover:text-primary cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      default:
        return <Input {...baseProps} type={type} />
    }
  }

  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="block text-sm font-semibold text-white mb-3 flex items-center">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {renderInput(field)}
          </FormControl>
          {description && (
            <FormDescription className="text-sm text-dark-tertiary mt-1">
              {description}
            </FormDescription>
          )}
          <FormMessage className="mt-2 text-sm text-red-400 flex items-center">
            {fieldState.error?.message && (
              <>
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {fieldState.error.message}
              </>
            )}
          </FormMessage>
        </FormItem>
      )}
    />
  )
}

export { FormField }