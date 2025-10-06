import { CategoryTabs, StreamGrid } from "@/components/features/streaming";

export default function MainPage() {
  // Use theme context for dynamic styling
  return (
    <div className="min-h-screen">
      <div className="flex-1 space-y-6">
        {/* Category Tabs */}
        <CategoryTabs />
        {/* Stream Grid */}
        <StreamGrid />
      </div>
    </div>
  );
}
