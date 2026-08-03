export default function ProductoDetalleLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <div className="mb-8 h-4 w-32 animate-pulse rounded-md bg-panel" />
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div className="h-48 animate-pulse rounded-xl bg-panel" />
          <div className="h-10 w-2/3 animate-pulse rounded-md bg-panel" />
          <div className="h-4 w-full animate-pulse rounded-md bg-panel" />
          <div className="h-4 w-5/6 animate-pulse rounded-md bg-panel" />
        </div>
        <div className="h-72 animate-pulse rounded-xl bg-panel" />
      </div>
    </div>
  );
}
