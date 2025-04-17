
export function PropertyListLoading() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-muted rounded mb-8"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
}
