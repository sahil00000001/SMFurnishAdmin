import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Categories() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: categoriesApi.getAll,
  });

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Categories</h2>
            <p className="text-muted-foreground">Product categories management</p>
          </div>
          <Button disabled>
            <i className="fas fa-plus mr-2"></i>Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const defaultCategories = [
    {
      id: "1",
      name: "Living Room",
      description: "Sofas, chairs, tables, and entertainment units",
      productCount: 0,
      icon: "fas fa-couch",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: "2", 
      name: "Bedroom",
      description: "Beds, wardrobes, nightstands, and dressers",
      productCount: 0,
      icon: "fas fa-bed",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      id: "3",
      name: "Dining Room", 
      description: "Dining tables, chairs, and storage solutions",
      productCount: 0,
      icon: "fas fa-utensils",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      id: "4",
      name: "Office",
      description: "Desks, chairs, and storage for workspace",
      productCount: 0,
      icon: "fas fa-laptop",
      color: "text-muted-foreground",
      bgColor: "bg-muted/20",
    },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Categories</h2>
          <p className="text-muted-foreground">Product categories management</p>
        </div>
        <Button data-testid="button-add-category">
          <i className="fas fa-plus mr-2"></i>Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCategories.map((category: any) => (
          <Card key={category.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${category.bgColor} rounded-full flex items-center justify-center`}>
                  <i className={`${category.icon} ${category.color}`}></i>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                  <i className="fas fa-ellipsis-v"></i>
                </Button>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2" data-testid={`category-name-${category.id}`}>
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {category.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground" data-testid={`category-count-${category.id}`}>
                  {category.productCount} products
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
