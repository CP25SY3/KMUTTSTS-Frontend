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
  { id: "learning", name: "Learning Activities", isActive: true },
  { id: "events", name: "University Events" },
  { id: "research", name: "Research & Projects" },
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
  "Data Science"
];

const eventCategories = [
  "Workshops",
  "Seminars",
  "Career Fair",
  "Sports Day",
  "Cultural Events",
  "Graduation",
  "Orientation",
  "Guest Lectures"
];

const researchCategories = [
  "Final Year Project",
  "Research Presentation",
  "Thesis Defense",
  "Lab Sessions",
  "Group Projects",
  "Innovation Fair",
  "Academic Conference"
];

export default function CategoryTabs() {
  const [activeCategory, setActiveCategory] = useState("learning");
  const [activeSubcategory, setActiveSubcategory] = useState("Computer Science");

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
    <div className="space-y-4">
      {/* Main Categories */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">Categories</span>
        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "secondary"}
              size="sm"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
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
        
        {/* More Options */}
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full p-2 text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Subcategories */}
      <div className="flex flex-wrap gap-2">
        {subcategories.map((subcategory) => (
          <Button
            key={subcategory}
            variant={activeSubcategory === subcategory ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-full px-4 py-2 text-sm transition-colors",
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
