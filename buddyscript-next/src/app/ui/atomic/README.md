# Atomic Design System - BuddyScript

## 🎯 Overview

This directory contains the **Atomic Design System** for BuddyScript, following the methodology outlined in the [ATOMIC_DESIGN_GUIDE.md](../../../../../ATOMIC_DESIGN_GUIDE.md). The system breaks down UI components into reusable, composable pieces organized by complexity.

## 📁 Structure

```
app/ui/atomic/
├── atoms/              # Basic building blocks
│   ├── Button.tsx      # Primary UI buttons with variants
│   ├── IconButton.tsx  # Icon-only buttons
│   ├── Label.tsx       # Form labels with required indicators
│   ├── Input.tsx       # Text inputs with error states
│   └── ErrorMessage.tsx # Error display component
│
├── molecules/          # Composed components
│   └── FormField.tsx   # Complete form field (Label + Input + Error)
│
├── organisms/          # Complex components
│   └── AuthLayout.tsx  # Authentication page layout wrapper
│
├── examples/           # Usage examples (future)
│
└── index.ts           # Central export point
```

## 🚀 Quick Start

### Always Import from the Index

```tsx
// ✅ DO THIS - Import from atomic system
import { Button, FormField, AuthLayout } from '@/app/ui/atomic';

// ❌ DON'T DO THIS - Direct imports
import Button from '@/app/ui/atomic/atoms/Button';
```

## 📦 Components

### Atoms (Basic Building Blocks)

#### Button
Multi-variant button with loading states.

```tsx
import { Button } from '@/app/ui/atomic';

// Variants: primary, secondary, danger, outline, ghost
<Button variant="primary" onClick={handleClick}>
  Save Changes
</Button>

// With loading state
<Button variant="primary" loading={isPending}>
  Submitting...
</Button>

// With icon
<Button variant="primary" icon={<PlusIcon />}>
  Add Item
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
- `loading`: boolean (shows spinner)
- `icon`: ReactNode (optional icon)
- `fullWidth`: boolean (full width button)
- All standard button HTML attributes

#### Input
Text input with error state styling.

```tsx
import { Input } from '@/app/ui/atomic';

<Input
  type="email"
  value={email}
  onChange={handleChange}
  error={Boolean(errorMessage)}
  placeholder="Enter email"
  autoComplete="email"
/>
```

**Props:**
- `error`: boolean (applies error styling)
- `inputClassName`: string (custom CSS class)
- All standard input HTML attributes

#### Label
Form label with optional required indicator.

```tsx
import { Label } from '@/app/ui/atomic';

<Label htmlFor="email" required>
  Email Address
</Label>
```

**Props:**
- `required`: boolean (shows red asterisk)
- `labelClassName`: string (custom CSS class)
- All standard label HTML attributes

#### ErrorMessage
Displays form field error messages.

```tsx
import { ErrorMessage } from '@/app/ui/atomic';

<ErrorMessage
  id="email-error"
  message="Email is required"
/>
```

**Props:**
- `id`: string (for aria-describedby)
- `message`: string (error text, null hides component)
- `className`: string (custom CSS class)

### Molecules (Composed Components)

#### FormField
Complete form field combining Label + Input + ErrorMessage.

```tsx
import { FormField } from '@/app/ui/atomic';

<FormField
  label="Email"
  name="email"
  type="email"
  value={values.email}
  onChange={handleInputChange("email")}
  error={errors.email}
  required
  autoComplete="email"
/>
```

**Props:**
- `label`: string (field label)
- `name`: string (input name)
- `type`: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'url'
- `value`: string (controlled value)
- `onChange`: ChangeEventHandler (change handler)
- `error`: string (optional error message)
- `required`: boolean (shows required indicator)
- `placeholder`: string (input placeholder)
- `autoComplete`: string (browser autocomplete)
- `disabled`: boolean
- `containerClassName`: string (wrapper class)
- `labelClassName`: string (label class)
- `inputClassName`: string (input class)
- `errorClassName`: string (error message class)

### Organisms (Complex Components)

#### AuthLayout
Consistent layout wrapper for authentication pages (login, register, etc.).

```tsx
import { AuthLayout } from '@/app/ui/atomic';

<AuthLayout
  title="Login to your account"
  subtitle="Welcome back"
  imageUrl="/icons/login.png"
  imageAlt="Welcome back"
  imagePosition="left"
  showGoogleSignIn={true}
  isGoogleLoading={isPending}
  wrapperClassName="_social_login_wrapper"
>
  {/* Your form content here */}
  <form>
    {/* ... */}
  </form>
</AuthLayout>
```

**Props:**
- `children`: ReactNode (form and content)
- `title`: string (page title)
- `subtitle`: string (page subtitle)
- `imageUrl`: string (main image path)
- `imageDarkUrl`: string (optional dark mode image)
- `imageAlt`: string (image alt text)
- `logoUrl`: string (defaults to '/icons/logo.svg')
- `showGoogleSignIn`: boolean (show/hide Google button)
- `onGoogleSignIn`: function (Google sign-in handler)
- `isGoogleLoading`: boolean (Google button loading state)
- `wrapperClassName`: string (wrapper CSS class)
- `imagePosition`: 'left' | 'right' (image placement)

## 🎨 Usage Examples

### Login Page Pattern

```tsx
"use client";

import { useState } from "react";
import { Button, FormField, AuthLayout } from "@/app/ui/atomic";

export default function LoginPage() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isPending, setIsPending] = useState(false);

  const handleInputChange = (field) => (event) => {
    setValues(prev => ({ ...prev, [field]: event.target.value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Your validation and submission logic
  };

  return (
    <AuthLayout
      title="Login to your account"
      subtitle="Welcome back"
      imageUrl="/icons/login.png"
      imageAlt="Welcome back"
      imagePosition="left"
      showGoogleSignIn={true}
      isGoogleLoading={isPending}
    >
      <form onSubmit={handleSubmit}>
        <FormField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleInputChange("email")}
          error={errors.email}
          required
          autoComplete="email"
        />
        
        <FormField
          label="Password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleInputChange("password")}
          error={errors.password}
          required
          autoComplete="current-password"
        />

        <Button type="submit" variant="primary" loading={isPending} fullWidth>
          {isPending ? "Signing in..." : "Login now"}
        </Button>
      </form>
    </AuthLayout>
  );
}
```

### Register Page Pattern

```tsx
"use client";

import { useState } from "react";
import { Button, FormField, AuthLayout } from "@/app/ui/atomic";

export default function RegisterPage() {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isPending, setIsPending] = useState(false);

  const handleInputChange = (field) => (event) => {
    setValues(prev => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Your validation and submission logic
  };

  return (
    <AuthLayout
      title="Registration"
      subtitle="Get Started Now"
      imageUrl="/icons/registration.png"
      imageDarkUrl="/icons/registration1.png"
      imageAlt="Registration"
      imagePosition="left"
      showGoogleSignIn={true}
      isGoogleLoading={isPending}
      wrapperClassName="_social_registration_wrapper"
    >
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-6">
            <FormField
              label="First Name"
              name="firstName"
              value={values.firstName}
              onChange={handleInputChange("firstName")}
              error={errors.firstName}
              required
            />
          </div>
          <div className="col-6">
            <FormField
              label="Last Name"
              name="lastName"
              value={values.lastName}
              onChange={handleInputChange("lastName")}
              error={errors.lastName}
              required
            />
          </div>
        </div>

        <FormField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleInputChange("email")}
          error={errors.email}
          required
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleInputChange("password")}
          error={errors.password}
          required
        />

        <FormField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleInputChange("confirmPassword")}
          error={errors.confirmPassword}
          required
        />

        <Button type="submit" variant="primary" loading={isPending} fullWidth>
          {isPending ? "Creating..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
```

## ✅ Migrated Pages

The following pages have been successfully migrated to atomic design:

- ✅ **Login Page** (`/app/login/page.tsx`)
  - Uses: AuthLayout, FormField, Button
  - Preserves: All validation, error handling, loading states, toast notifications
  - Features: Email/password fields, remember me, forgot password link

- ✅ **Register Page** (`/app/register/page.tsx`)
  - Uses: AuthLayout, FormField, Button
  - Preserves: All validation, password matching, error handling, loading states
  - Features: First/last name, email, password, confirm password, terms checkbox

## 🎯 Benefits

### Consistency
- Same components everywhere = same behavior
- Centralized styling and logic
- Predictable user experience

### Maintainability
- Fix once, fixes everywhere
- Easy to update styling globally
- Clear component hierarchy

### Efficiency
- Build features faster with reusable components
- Less code duplication
- Faster development cycles

### Quality
- Components are properly typed with TypeScript
- Accessibility built-in (ARIA labels, error announcements)
- Tested patterns

### No Compromises
- All original features preserved
- All validation logic intact
- All existing CSS classes maintained
- No visual changes to the UI

## 🔧 Customization

All atomic components accept custom CSS classes to override or extend default styles:

```tsx
// Custom styling via className props
<FormField
  label="Email"
  name="email"
  containerClassName="custom-container"
  labelClassName="custom-label"
  inputClassName="custom-input"
  errorClassName="custom-error"
/>

<Button
  variant="primary"
  className="custom-button-class"
>
  Custom Button
</Button>
```

## 📚 Next Steps

### Potential Enhancements
1. Add more button variants (success, warning, info)
2. Create Textarea atom for multi-line inputs
3. Create Select atom for dropdowns
4. Create Checkbox and Radio atoms
5. Create Modal organism for dialogs
6. Create Table organism for data display
7. Add animation/transition utilities

### Future Migrations
- Feeds page
- Profile pages
- Settings pages
- Admin pages

## 🤝 Contributing

When adding new components:

1. Follow the atomic design hierarchy (atoms → molecules → organisms)
2. Add TypeScript interfaces for all props
3. Include JSDoc comments
4. Export from `index.ts`
5. Preserve existing CSS classes
6. Maintain accessibility features
7. Create usage examples

## 📖 Resources

- [Atomic Design Guide](../../../../../ATOMIC_DESIGN_GUIDE.md) - Complete guide
- [Layered Architecture Guide](../../../../../LAYERED_ARCHITECTURE_GUIDE.md) - Backend architecture

---

**Remember:** Always import from `@/app/ui/atomic` - one source of truth! 🎯
