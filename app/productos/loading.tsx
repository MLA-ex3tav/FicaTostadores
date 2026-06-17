export default function ProductosLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <div className="mb-12 h-10 w-64 animate-pulse rounded-md bg-panel" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-28 animate-pulse rounded-xl bg-panel" />
        <div className="h-28 animate-pulse rounded-xl bg-panel" />
      </div>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-xl bg-panel"
          />
        ))}
      </div>
    </div>
  );
}
