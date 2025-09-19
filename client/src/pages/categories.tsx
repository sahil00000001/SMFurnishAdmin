import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AddCategoryModal from "@/components/categories/add-category-modal";
import DeleteCategoryModal from "@/components/categories/delete-category-modal";

export default function Categories() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: categoriesApi.getAll,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

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


  const handleDeleteCategory = (category: any) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedCategory(null);
  };

  const getIconForCategory = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('living')) return { icon: 'fas fa-couch', color: 'text-primary', bgColor: 'bg-primary/10' };
    if (nameLower.includes('bedroom')) return { icon: 'fas fa-bed', color: 'text-accent', bgColor: 'bg-accent/10' };
    if (nameLower.includes('dining')) return { icon: 'fas fa-utensils', color: 'text-secondary', bgColor: 'bg-secondary/10' };
    if (nameLower.includes('office')) return { icon: 'fas fa-laptop', color: 'text-muted-foreground', bgColor: 'bg-muted/20' };
    if (nameLower.includes('kitchen')) return { icon: 'fas fa-blender', color: 'text-green-600', bgColor: 'bg-green-50' };
    return { icon: 'fas fa-cube', color: 'text-muted-foreground', bgColor: 'bg-muted/20' };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Categories</h2>
          <p className="text-muted-foreground">Product categories management</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} data-testid="button-add-category">
          <i className="fas fa-plus mr-2"></i>Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category: any) => {
          const iconData = getIconForCategory(category.name);
          return (
            <Card key={category.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${iconData.bgColor} rounded-full flex items-center justify-center`}>
                    <i className={`${iconData.icon} ${iconData.color}`}></i>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <i className="fas fa-ellipsis-v"></i>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleDeleteCategory(category)}
                        className="text-destructive focus:text-destructive"
                        data-testid={`button-delete-category-${category.id}`}
                      >
                        <i className="fas fa-trash mr-2"></i>
                        Delete Category
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2" data-testid={`category-name-${category.id}`}>
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description || "No description"}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground" data-testid={`category-count-${category.id}`}>
                    {category.productCount || 0} products
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modals */}
      <AddCategoryModal 
        isOpen={isAddModalOpen} 
        onClose={handleCloseModals} 
      />
      <DeleteCategoryModal 
        isOpen={isDeleteModalOpen} 
        onClose={handleCloseModals} 
        category={selectedCategory} 
      />
    </div>
  );
}
