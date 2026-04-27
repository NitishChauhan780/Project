export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon,
  fullWidth = false
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-700 shadow-sm hover:shadow-md',
    secondary: 'bg-surface-light dark:bg-surface-dark text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700',
    danger: 'bg-danger text-white hover:bg-red-600 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent hover:bg-surface-light dark:hover:bg-surface-dark text-gray-600 dark:text-gray-300',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
}

