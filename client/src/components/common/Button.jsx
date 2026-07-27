import LoadingSpinner from './LoadingSpinner';

const VARIANTS = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 border-transparent',
  secondary: 'bg-white/5 hover:bg-white/10 text-white border-white/10',
  danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 border-transparent',
  outline: 'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white border-white/20',
  ghost: 'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border-transparent',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-base rounded-xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const variantStyles = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyles = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
}
