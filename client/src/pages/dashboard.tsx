import { useQuery } from "@tanstack/react-query";
import { productsApi, categoriesApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: productsApi.getAll,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: categoriesApi.getAll,
  });

  const inStockCount = products.filter((p: any) => p.stock > 0).length;
  const lowStockCount = products.filter((p: any) => p.stock > 0 && p.stock <= 5).length;

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      icon: "fas fa-box",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Categories",
      value: categories.length,
      icon: "fas fa-tags",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "In Stock",
      value: inStockCount,
      icon: "fas fa-check-circle",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Low Stock",
      value: lowStockCount,
      icon: "fas fa-exclamation-triangle",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const recentProducts = products.slice(0, 5);

  if (productsLoading || categoriesLoading) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your furniture inventory</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your furniture inventory</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                  <i className={`${stat.icon} ${stat.color}`}></i>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Products */}
      <Card className="shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">Recent Products</h3>
        </div>
        <CardContent className="p-6">
          {recentProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No products available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProducts.map((product: any) => (
                <div key={product.id} className="flex items-center space-x-4 p-3 hover:bg-muted/50 rounded-md transition-colors">
                  <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                    <i className="fas fa-box text-muted-foreground"></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-card-foreground">${product.price}</p>
                    <p className={`text-sm ${product.stock <= 5 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                      {product.stock <= 5 ? 'Low Stock' : 'In Stock'} ({product.stock})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
