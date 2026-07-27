export default function LoadingSpinner({ size = 20, className = '' }) {
  return (
    <div
      className={`inline-block rounded-full border-2 border-current border-t-transparent animate-spin ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
