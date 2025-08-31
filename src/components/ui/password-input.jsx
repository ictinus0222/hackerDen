import * as React from "react"
import { Input } from "./input"
import { Button } from "./button"
import { cn } from "../../lib/utils"
import { EyeIcon, EyeOffIcon } from "lucide-react"

const PasswordInput = React.forwardRef(({
  className,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        variant="password"
        className="pr-10"
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={togglePasswordVisibility}
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <EyeIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  )
})

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }