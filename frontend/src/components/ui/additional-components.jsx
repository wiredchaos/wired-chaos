import React from 'react';

// Tab Components
export const Tabs = ({ children, defaultValue, ...props }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  
  return (
    <div {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList = ({ children, activeTab, setActiveTab, className = '' }) => {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

export const TabsTrigger = ({ value, children, activeTab, setActiveTab, className = '' }) => {
  const isActive = activeTab === value;
  
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-cyan-600 text-white' 
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, activeTab }) => {
  if (activeTab !== value) return null;
  
  return <div>{children}</div>;
};

// Progress Component
export const Progress = ({ value = 0, className = '' }) => {
  return (
    <div className={`w-full bg-gray-800 rounded-full h-2.5 ${className}`}>
      <div 
        className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

// Alert Components
export const Alert = ({ children, className = '' }) => {
  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children, className = '' }) => {
  return (
    <div className={`text-sm ${className}`}>
      {children}
    </div>
  );
};

// Avatar Components
export const Avatar = ({ children, className = '' }) => {
  return (
    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
      {children}
    </div>
  );
};

export const AvatarImage = ({ src, alt = '', className = '' }) => {
  return (
    <img 
      src={src} 
      alt={alt}
      className={`aspect-square h-full w-full object-cover ${className}`}
    />
  );
};

export const AvatarFallback = ({ children, className = '' }) => {
  return (
    <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-900 ${className}`}>
      {children}
    </div>
  );
};

// Dialog Components
export const Dialog = ({ children, open, onOpenChange }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export const DialogTrigger = ({ children, asChild }) => {
  return asChild ? children : <div>{children}</div>;
};

export const DialogContent = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 ${className}`}>
      {children}
    </div>
  );
};

export const DialogHeader = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

export const DialogTitle = ({ children, className = '' }) => {
  return (
    <h2 className={`text-lg font-semibold ${className}`}>
      {children}
    </h2>
  );
};

// Select Components
export const Select = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            value, 
            onValueChange, 
            isOpen, 
            setIsOpen 
          });
        }
        return child;
      })}
    </div>
  );
};

export const SelectTrigger = ({ children, value, isOpen, setIsOpen, className = '' }) => {
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${className}`}
    >
      {children}
      <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
        ▼
      </span>
    </button>
  );
};

export const SelectValue = ({ value, placeholder = 'Select...' }) => {
  return <span>{value || placeholder}</span>;
};

export const SelectContent = ({ children, isOpen, setIsOpen, onValueChange, className = '' }) => {
  if (!isOpen) return null;
  
  return (
    <div className={`absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg ${className}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            onValueChange, 
            setIsOpen 
          });
        }
        return child;
      })}
    </div>
  );
};

export const SelectItem = ({ value, children, onValueChange, setIsOpen }) => {
  return (
    <button
      onClick={() => {
        onValueChange(value);
        setIsOpen(false);
      }}
      className="flex w-full cursor-pointer items-center px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
    >
      {children}
    </button>
  );
};

// Label Component
export const Label = ({ children, htmlFor, className = '' }) => {
  return (
    <label 
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    >
      {children}
    </label>
  );
};