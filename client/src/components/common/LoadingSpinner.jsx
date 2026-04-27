export default function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizes[size]} border-4 border-primary/20 dark:border-primary/20 border-t-primary dark:border-t-primary rounded-full animate-spin`} />
      <p className="mt-4 text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

