export default function Skeleton({ className = '', height, width, circle = false }) {
  const styles = {
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
  };

  return (
    <div
      className={`bg-white/5 animate-pulse border border-white/5 ${
        circle ? 'rounded-full' : 'rounded-xl'
      } ${className}`}
      style={styles}
    />
  );
}
