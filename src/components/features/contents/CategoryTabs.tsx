"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface Category {
  id: string;
  name: string;
  isActive?: boolean;
}

const categories: Category[] = [
  { id: "learning", name: "Trending", isActive: true },
  { id: "events", name: "Latest" },
  { id: "research", name: "Most Viewed" },
];

const learningCategories = [
  "Computer Science",
  "Engineering",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Language Studies",
  "Business",
  "Data Science",
];

const eventCategories = [
  "Workshops",
  "Seminars",
  "Career Fair",
  "Sports Day",
  "Cultural Events",
  "Graduation",
  "Orientation",
  "Guest Lectures",
];

const researchCategories = [
  "Final Year Project",
  "Research Presentation",
  "Thesis Defense",
  "Lab Sessions",
  "Group Projects",
  "Innovation Fair",
  "Academic Conference",
];

export default function CategoryTabs() {
  const [activeCategory, setActiveCategory] = useState("learning");
  const [activeSubcategory, setActiveSubcategory] =
    useState("Computer Science");

  // Get the appropriate subcategories based on active category
  const getSubcategories = useCallback(() => {
    switch (activeCategory) {
      case "learning":
        return learningCategories;
      case "events":
        return eventCategories;
      case "research":
        return researchCategories;
      default:
        return learningCategories;
    }
  }, [activeCategory]);

  const subcategories = getSubcategories();

  // Update subcategory when main category changes
  useEffect(() => {
    const newSubcategories = getSubcategories();
    if (newSubcategories.length > 0) {
      setActiveSubcategory(newSubcategories[0]);
    }
  }, [activeCategory, getSubcategories]);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Categories */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="text-xs sm:text-sm font-medium text-foreground">
          Categories
        </span>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "secondary"}
              size="sm"
              className={cn(
                "rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                activeCategory === category.id
                  ? "bg-primary text-background hover:bg-primary/85"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Subcategories */}
      <div className="flex scrollbar-hide gap-2 overflow-x-auto pb-2 sm:pb-0">
        {subcategories.map((subcategory) => (
          <Button
            key={subcategory}
            variant={activeSubcategory === subcategory ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors whitespace-nowrap",
              activeSubcategory === subcategory
                ? "bg-black text-white hover:bg-black/90"
                : "border-border bg-background text-foreground hover:bg-muted"
            )}
            onClick={() => setActiveSubcategory(subcategory)}
          >
            {subcategory}
          </Button>
        ))}
      </div>
    </div>
  );
}
