import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productsApi, categoriesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductTable from "@/components/products/product-table";
import AddProductModal from "@/components/products/add-product-modal";
import DeleteProductModal from "@/components/products/delete-product-modal";
import { Card, CardContent } from "@/components/ui/card";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/products"],
    queryFn: productsApi.getAll,
  });

  // Fetch categories for filtering
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: categoriesApi.getAll,
  });

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === "all" || product.categoryName === categoryFilter;
    const matchesStatus = !statusFilter || statusFilter === "all" || 
                         (statusFilter === "in-stock" && product.stock > 5) ||
                         (statusFilter === "low-stock" && product.stock <= 5 && product.stock > 0) ||
                         (statusFilter === "out-of-stock" && product.stock === 0);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setShowAddModal(true);
  };

  const handleDelete = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowDeleteModal(false);
    setSelectedProduct(null);
    refetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Products</h2>
          <p className="text-muted-foreground">Manage your furniture inventory</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          data-testid="button-add-product"
        >
          <i className="fas fa-plus mr-2"></i>Add Product
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48" data-testid="select-category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48" data-testid="select-status">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <ProductTable 
        products={filteredProducts}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddProductModal
        isOpen={showAddModal}
        onClose={handleCloseModals}
        product={selectedProduct}
      />

      <DeleteProductModal
        isOpen={showDeleteModal}
        onClose={handleCloseModals}
        product={selectedProduct}
      />
    </div>
  );
}
