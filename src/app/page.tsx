import {
  CategoryTabs,
  MockContentsGrid,
  ContentsInfiniteScroll,
} from "@/components/features/contents";

export default function MainPage() {
  // Use theme context for dynamic styling
  return (
    <div className="min-h-screen">
      <div className="flex-1 space-y-6">
        {/* Category Tabs */}
        <CategoryTabs />
        {/* Content */}
        {/* <MockContentsGrid /> */}
        <ContentsInfiniteScroll />
      </div>
    </div>
  );
}
