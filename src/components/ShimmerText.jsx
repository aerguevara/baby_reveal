export default function ShimmerText({ children }) {
  return (
    <h1
      className="shimmer-text animate-shimmer"
    >
      {children}
    </h1>
  );
}
