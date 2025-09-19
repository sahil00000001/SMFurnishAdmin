import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { productsApi, categoriesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
}

export default function AddProductModal({ isOpen, onClose, product }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    categoryName: "",
    price: "",
    stock: "",
    status: "active",
    description: "",
    imageUrl: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: categoriesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.update(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        categoryId: product.categoryId || "",
        categoryName: product.categoryName || "",
        price: product.price || "",
        stock: product.stock?.toString() || "",
        status: product.status || "active",
        description: product.description || "",
        imageUrl: product.imageUrl || "",
      });
    } else {
      setFormData({
        name: "",
        categoryId: "",
        categoryName: "",
        price: "",
        stock: "",
        status: "active",
        description: "",
        imageUrl: "",
      });
    }
  }, [product, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      categoryId: formData.categoryId,
      imageUrl: formData.imageUrl,
      status: formData.status,
    };

    if (product) {
      updateMutation.mutate({ id: product.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find((cat: any) => cat.id === categoryId);
    setFormData(prev => ({
      ...prev,
      categoryId: categoryId,
      categoryName: selectedCategory?.name || ""
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                placeholder="Enter product name"
                data-testid="input-product-name"
              />
            </div>
            
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="productCategory">Category</Label>
              <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger data-testid="select-product-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="productPrice">Price ($)</Label>
              <Input
                id="productPrice"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                required
                step="0.01"
                min="0"
                placeholder="0.00"
                data-testid="input-product-price"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="productStock">Stock Quantity</Label>
              <Input
                id="productStock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                required
                min="0"
                placeholder="0"
                data-testid="input-product-stock"
              />
            </div>
            
            <div>
              <Label htmlFor="productStatus">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger data-testid="select-product-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="productDescription">Description</Label>
            <Textarea
              id="productDescription"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              placeholder="Enter product description"
              data-testid="textarea-product-description"
            />
          </div>
          
          <div>
            <Label htmlFor="productImageUrl">Image URL</Label>
            <Input
              id="productImageUrl"
              value={formData.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
              placeholder="Enter image URL"
              data-testid="input-product-image-url"
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-product"
            >
              {createMutation.isPending || updateMutation.isPending 
                ? "Saving..." 
                : product ? "Update Product" : "Add Product"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
