import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCategoryModal({ isOpen, onClose }: AddCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });


  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        description: "",
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      description: formData.description,
    };

    createMutation.mutate(data);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Add New Category
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              placeholder="Enter category name"
              data-testid="input-category-name"
            />
          </div>
          
          <div>
            <Label htmlFor="categoryDescription">Description</Label>
            <Textarea
              id="categoryDescription"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              placeholder="Enter category description"
              data-testid="textarea-category-description"
            />
          </div>
          
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              data-testid="button-save-category"
            >
              {createMutation.isPending ? "Saving..." : "Add Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}