# Modern Observability Platform UI Patterns

## Navigation Patterns

### 1. Sidebar Navigation (Sentry/PostHog Pattern)
```tsx
// Collapsible sidebar with icon + text
<nav className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
  <div className="p-4 border-b border-gray-800">
    <Logo />
  </div>
  <div className="flex-1 px-3 py-4 space-y-1">
    {navItems.map(item => (
      <NavItem key={item.id} icon={item.icon} label={item.label} />
    ))}
  </div>
</nav>

// NavItem component
const NavItem = ({ icon: Icon, label, active }) => (
  <a className={`
    flex items-center px-3 py-2 rounded-md text-sm font-medium
    ${active 
      ? 'bg-gray-800 text-white' 
      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }
  `}>
    <Icon className="w-5 h-5 mr-3" />
    {label}
  </a>
);
```

### 2. Breadcrumb Navigation (Vercel Pattern)
```tsx
const Breadcrumb = ({ items }) => (
  <nav className="flex items-center space-x-2 text-sm text-gray-500">
    {items.map((item, index) => (
      <div key={index} className="flex items-center">
        {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
        <span className={index === items.length - 1 ? 'text-gray-900' : 'hover:text-gray-700'}>
          {item.label}
        </span>
      </div>
    ))}
  </nav>
);
```

## Typography Scales

### Sentry-Style Typography System
```css
/* Typography scale */
.text-xs { font-size: 0.75rem; line-height: 1rem; }     /* 12px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; } /* 14px */
.text-base { font-size: 1rem; line-height: 1.5rem; }    /* 16px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; } /* 18px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }  /* 20px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }     /* 24px */

/* Font weights */
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

### Typography Component System
```tsx
const Typography = {
  H1: ({ children, className = "" }) => (
    <h1 className={`text-2xl font-bold text-gray-900 ${className}`}>{children}</h1>
  ),
  H2: ({ children, className = "" }) => (
    <h2 className={`text-xl font-semibold text-gray-900 ${className}`}>{children}</h2>
  ),
  Body: ({ children, className = "" }) => (
    <p className={`text-sm text-gray-700 ${className}`}>{children}</p>
  ),
  Caption: ({ children, className = "" }) => (
    <span className={`text-xs text-gray-500 ${className}`}>{children}</span>
  )
};
```

## Spacing Systems

### 8px Grid System (Industry Standard)
```css
/* Spacing scale based on 8px grid */
.space-1 { margin: 0.25rem; }  /* 4px */
.space-2 { margin: 0.5rem; }   /* 8px */
.space-3 { margin: 0.75rem; }  /* 12px */
.space-4 { margin: 1rem; }     /* 16px */
.space-6 { margin: 1.5rem; }   /* 24px */
.space-8 { margin: 2rem; }     /* 32px */
.space-12 { margin: 3rem; }    /* 48px */
.space-16 { margin: 4rem; }    /* 64px */
```

### Layout Spacing Pattern
```tsx
const DashboardLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 space-y-8">
        {children}
      </div>
    </div>
  </div>
);

const Card = ({ title, children }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);
```

## Dark Theme Implementation

### CSS Custom Properties Approach
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --accent-color: #3b82f6;
}

[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --border-color: #374151;
  --accent-color: #60a5fa;
}

.card {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

### Tailwind Dark Mode Classes
```tsx
const DarkModeCard = ({ children }) => (
  <div className="
    bg-white dark:bg-gray-800 
    border border-gray-200 dark:border-gray-700
    text-gray-900 dark:text-gray-100
    rounded-lg p-6
  ">
    {children}
  </div>
);

const MetricCard = ({ title, value, trend }) => (
  <div className="
    bg-white dark:bg-gray-900 
    border border-gray-200 dark:border-gray-800
    rounded-lg p-4
  ">
    <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
    <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
    <div className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
      {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
    </div>
  </div>
);
```

## Visual Hierarchy for Developer Tools

### Status Indicators
```tsx
const StatusBadge = ({ status, children }) => {
  const variants = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  };
  
  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${variants[status]}
    `}>
      {children}
    </span>
  );
};
```

### Code Block Styling
```tsx
const CodeBlock = ({ code, language }) => (
  <div className="
    bg-gray-900 dark:bg-gray-950 
    border border-gray-700 
    rounded-lg overflow-hidden
  ">
    <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
      <span className="text-xs text-gray-400">{language}</span>
    </div>
    <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
      <code>{code}</code>
    </pre>
  </div>
);
```

### Data Table Pattern
```tsx
const DataTable = ({ columns, data }) => (
  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          {columns.map(col => (
            <th key={col.key} className="
              px-6 py-3 text-left text-xs font-medium 
              text-gray-500 dark:text-gray-400 uppercase tracking-wider
            ">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="
        bg-white dark:bg-gray-900 
        divide-y divide-gray-200 dark:divide-gray-700
      ">
        {data.map((row, idx) => (
          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
            {columns.map(col => (
              <td key={col.key} className="
                px-6 py-4 whitespace-nowrap text-sm 
                text-gray-900 dark:text-gray-100
              ">
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
```

## Specific Platform Patterns

### Sentry Error Card
```tsx
const ErrorCard = ({ error }) => (
  <div className="
    bg-white dark:bg-gray-900 
    border-l-4 border-red-500 
    shadow-sm rounded-r-lg p-4
  ">
    <div className="flex items-start">
      <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" />
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
          {error.type}
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
          {error.message}
        </p>
        <div className="mt-2 text-xs text-gray-500">
          {error.timestamp} • {error.count} occurrences
        </div>
      </div>
    </div>
  </div>
);
```

### PostHog Metric Visualization
```tsx
const MetricChart = ({ title, value, change, data }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
        {title}
      </h3>
      <div className={`
        text-sm font-medium
        ${change >= 0 ? 'text-green-600' : 'text-red-600'}
      `}>
        {change >= 0 ? '+' : ''}{change}%
      </div>
    </div>
    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
      {value.toLocaleString()}
    </div>
    <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded">
      {/* Chart component would go here */}
    </div>
  </div>
);
```

### Vercel Deployment Status
```tsx
const DeploymentStatus = ({ deployment }) => (
  <div className="
    bg-white dark:bg-gray-900 
    border border-gray-200 dark:border-gray-700 
    rounded-lg p-4
  ">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`
          w-3 h-3 rounded-full
          ${deployment.status === 'success' ? 'bg-green-500' : 
            deployment.status === 'building' ? 'bg-yellow-500' : 'bg-red-500'}
        `} />
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {deployment.branch}
          </div>
          <div className="text-xs text-gray-500">
            {deployment.commit.slice(0, 7)} • {deployment.author}
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500">
        {deployment.duration}
      </div>
    </div>
  </div>
);
```

## Key Design Principles

1. **Consistent Spacing**: Use 8px grid system
2. **Clear Hierarchy**: Typography scales with semantic meaning
3. **Status Communication**: Color-coded states with icons
4. **Dark Mode First**: Design for both themes simultaneously
5. **Scannable Content**: Use whitespace and grouping effectively
6. **Performance Focus**: Minimal, functional components