export function Card({ children, className = '', hover = true, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`glass-card rounded-2xl border border-white/10 p-5 sm:p-6 transition-all duration-300 ${
        hover ? 'hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between gap-3 pb-4 mb-4 border-b border-white/5 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`font-heading text-lg sm:text-xl font-bold text-white tracking-tight ${className}`}>
      {children}
    </h3>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`space-y-3 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`pt-4 mt-4 border-t border-white/5 flex items-center justify-end gap-2 ${className}`}>
      {children}
    </div>
  );
}
