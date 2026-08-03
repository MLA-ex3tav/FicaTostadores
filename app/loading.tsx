export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-panel" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded-md bg-panel" />
      <div className="mt-2 h-4 w-2/3 max-w-md animate-pulse rounded-md bg-panel" />
    </div>
  );
}
