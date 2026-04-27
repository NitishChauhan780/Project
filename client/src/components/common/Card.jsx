export default function Card({ children, className = '', title, subtitle, icon: Icon, ...props }) {
  return (
    <div className={`bg-card-light dark:bg-card-dark rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 transition-all duration-300 ${className}`} {...props}>
      {(title || subtitle || Icon) && (
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="w-5 h-5 text-primary" />}
            {title && <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>}
          </div>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

