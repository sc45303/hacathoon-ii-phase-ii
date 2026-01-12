# UI Components Documentation

This directory contains reusable UI components for the Todo application, built with Shadcn UI and custom implementations.

## Shadcn UI Components

The following Shadcn UI components have been installed and are available for use:

### Button
A versatile button component with multiple variants.

```tsx
import { Button } from "@/components/ui/button"

// Usage
<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

### Input
Standard input field component.

```tsx
import { Input } from "@/components/ui/input"

// Usage
<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="Email" />
<Input disabled placeholder="Disabled" />
```

### Label
Accessible label component for form fields.

```tsx
import { Label } from "@/components/ui/label"

// Usage
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

### Checkbox
Standard checkbox component.

```tsx
import { Checkbox } from "@/components/ui/checkbox"

// Usage
<Checkbox id="terms" />
<Label htmlFor="terms">Accept terms</Label>
```

### Dialog
Modal dialog component with overlay.

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Usage
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description goes here.</DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

### Dropdown Menu
Dropdown menu component with items and sub-menus.

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Usage
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Separator
Visual separator line.

```tsx
import { Separator } from "@/components/ui/separator"

// Usage
<Separator />
<Separator orientation="vertical" />
```

### Tooltip
Tooltip component for hover information.

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Usage
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Tooltip content</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Badge
Small badge component for labels and status indicators.

```tsx
import { Badge } from "@/components/ui/badge"

// Usage
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### Card
Card container component.

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Usage
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## Custom Components

### FloatingLabelInput
Input field with animated floating label (Material Design style).

**Props:**
- `label` (string, required): The label text
- `error` (string, optional): Error message to display
- All standard HTML input props

**Features:**
- Animated label that floats up when focused or has value
- Error state with red border and error message
- Accessible with proper ARIA attributes
- Dark mode support

```tsx
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput"

// Usage
<FloatingLabelInput
  label="Email"
  type="email"
  placeholder=""
/>

// With error
<FloatingLabelInput
  label="Password"
  type="password"
  error="Password is required"
/>
```

### InlineTaskInput
Expandable inline input for creating tasks (Todoist-style).

**Props:**
- `onSubmit` (function, required): Callback when task is submitted
- `onCancel` (function, optional): Callback when input is cancelled
- `submitLabel` (string, optional): Submit button label (default: "Add Task")
- `cancelLabel` (string, optional): Cancel button label (default: "Cancel")
- `isLoading` (boolean, optional): Loading state
- All standard HTML input props

**Features:**
- Collapses to simple input, expands on focus
- Shows action buttons when expanded
- Keyboard shortcuts (Escape to cancel)
- Loading state support
- Accessible with proper ARIA attributes

```tsx
import { InlineTaskInput } from "@/components/ui/InlineTaskInput"

// Usage
<InlineTaskInput
  placeholder="Add a task..."
  onSubmit={async (value) => {
    await createTask(value)
  }}
  onCancel={() => console.log("Cancelled")}
/>

// With loading state
<InlineTaskInput
  placeholder="Add a task..."
  onSubmit={handleSubmit}
  isLoading={isCreating}
/>
```

### TaskCheckbox
Custom styled checkbox for task completion.

**Props:**
- `variant` ("default" | "success", optional): Visual variant
- All Radix UI Checkbox props

**Features:**
- Circular design (Todoist-style)
- Smooth animations and hover effects
- Two variants: default (primary color) and success (green)
- Scale animation on hover
- Accessible with Radix UI primitives

```tsx
import { TaskCheckbox } from "@/components/ui/TaskCheckbox"

// Usage
<TaskCheckbox
  checked={task.completed}
  onCheckedChange={(checked) => updateTask(checked)}
/>

// Success variant
<TaskCheckbox
  variant="success"
  checked={true}
/>
```

### EmptyState
Reusable empty state component with icon and message.

**Props:**
- `icon` (LucideIcon, optional): Icon component from lucide-react
- `title` (string, required): Main heading text
- `description` (string, optional): Description text
- `action` (ReactNode, optional): Action button or element
- All standard HTML div props

**Features:**
- Centered layout with icon, title, and description
- Optional action button
- Accessible with proper ARIA attributes
- Dark mode support

```tsx
import { EmptyState } from "@/components/ui/EmptyState"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Usage
<EmptyState
  icon={CheckCircle2}
  title="No tasks yet"
  description="Create your first task to get started"
  action={
    <Button onClick={handleCreate}>
      Create Task
    </Button>
  }
/>
```

### LoadingSkeleton
Skeleton loader for different content types.

**Props:**
- `count` (number, optional): Number of skeleton items (default: 1)
- `variant` ("task" | "card" | "text" | "circle", optional): Skeleton type (default: "task")
- All standard HTML div props

**Features:**
- Multiple variants for different content types
- Animated pulse effect
- Accessible with proper ARIA attributes
- Dark mode support

```tsx
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton"

// Usage - Task list loading
<LoadingSkeleton variant="task" count={5} />

// Card loading
<LoadingSkeleton variant="card" count={3} />

// Text loading
<LoadingSkeleton variant="text" count={2} />

// Circle (avatar) loading
<LoadingSkeleton variant="circle" />
```

## Utility Functions

### cn (Class Name Utility)
Utility function for merging Tailwind CSS classes with proper precedence.

```tsx
import { cn } from "@/lib/utils"

// Usage
<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className
)} />
```

## Dark Mode Support

All components support dark mode through Tailwind's `dark:` prefix and CSS variables. The theme automatically switches based on the `.dark` class on the root element.

## Accessibility

All components follow WCAG 2.1 AA standards:
- Proper ARIA attributes
- Keyboard navigation support
- Focus indicators
- Screen reader support
- Semantic HTML

## TypeScript Support

All components are fully typed with TypeScript, providing:
- IntelliSense support
- Type checking
- Prop validation
- Generic type support where applicable

## Styling

Components use:
- Tailwind CSS for styling
- CSS variables for theming
- `class-variance-authority` for variant management
- `tailwind-merge` for class merging

## Next.js App Router Compatibility

All custom components use the `"use client"` directive and are compatible with Next.js 16+ App Router:
- Can be used in both Server and Client Components
- Support React Server Components patterns
- Optimized for performance
