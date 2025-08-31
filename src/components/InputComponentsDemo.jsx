import { useState } from 'react';
import { 
  InputField, 
  SearchInput, 
  PasswordInput, 
  TextareaField, 
  SelectField,
  CheckboxField,
  RadioField,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from './ui';

const InputComponentsDemo = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    search: '',
    description: '',
    priority: '',
    notifications: false,
    theme: 'dark',
    tags: []
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSelectChange = (field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      alert('Form submitted successfully! Check console for data.');
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const themeOptions = [
    { value: 'light', label: 'Light Theme' },
    { value: 'dark', label: 'Dark Theme' },
    { value: 'system', label: 'System Theme' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Shadcn Input Components Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Full Name"
                name="name"
                type="text"
                required
                error={errors.name}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange('name')}
                description="This will be displayed on your profile"
              />
              
              <InputField
                label="Email Address"
                name="email"
                type="email"
                variant="email"
                required
                error={errors.email}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange('email')}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Password <span className="text-destructive">*</span>
              </label>
              <PasswordInput
                name="password"
                required
                error={errors.password}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange('password')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <SearchInput
                placeholder="Search for anything..."
                value={formData.search}
                onChange={handleInputChange('search')}
                onClear={() => setFormData(prev => ({ ...prev, search: '' }))}
              />
            </div>

            {/* Textarea Field */}
            <TextareaField
              label="Description"
              name="description"
              required
              error={errors.description}
              placeholder="Describe your project or task..."
              value={formData.description}
              onChange={handleInputChange('description')}
              maxLength={500}
              showCharCount
              rows={4}
              description="Provide a detailed description of what you're working on"
            />

            {/* Select Field */}
            <SelectField
              label="Priority Level"
              placeholder="Select priority"
              value={formData.priority}
              onValueChange={handleSelectChange('priority')}
              options={priorityOptions}
              description="Choose the priority level for this task"
            />

            {/* Checkbox Field */}
            <CheckboxField
              label="Enable email notifications"
              description="Receive updates about your projects via email"
              checked={formData.notifications}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, notifications: checked }))
              }
            />

            {/* Radio Field */}
            <RadioField
              label="Theme Preference"
              description="Choose your preferred theme for the application"
              value={formData.theme}
              onValueChange={handleSelectChange('theme')}
              options={themeOptions}
            />

            {/* Input Variants Demo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Input Variants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Default Input</label>
                  <InputField
                    placeholder="Default variant"
                    variant="default"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Large Input (Mobile Friendly)</label>
                  <InputField
                    placeholder="Large variant for mobile"
                    variant="large"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Compact Input</label>
                  <InputField
                    placeholder="Compact variant"
                    variant="compact"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Error State</label>
                  <InputField
                    placeholder="Input with error"
                    error="This field has an error"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    search: '',
                    description: '',
                    priority: '',
                    notifications: false,
                    theme: 'dark',
                    tags: []
                  });
                  setErrors({});
                }}
              >
                Reset Form
              </Button>
              <Button type="submit">
                Submit Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Accessibility Features */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Keyboard Navigation</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Tab through all form elements in logical order</li>
                <li>Enter/Space to activate buttons and checkboxes</li>
                <li>Arrow keys to navigate radio groups and select options</li>
                <li>Escape to close dropdowns and modals</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Screen Reader Support</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Proper ARIA labels and descriptions</li>
                <li>Error messages announced when validation fails</li>
                <li>Required fields clearly marked</li>
                <li>Form field relationships properly associated</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Visual Indicators</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Clear focus indicators on all interactive elements</li>
                <li>Error states with color and icon indicators</li>
                <li>Consistent spacing and touch targets (44px minimum)</li>
                <li>High contrast colors for better visibility</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InputComponentsDemo;