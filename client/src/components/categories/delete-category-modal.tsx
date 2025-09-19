import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: any;
}

export default function DeleteCategoryModal({ isOpen, onClose, category }: DeleteCategoryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (category?.id) {
      deleteMutation.mutate(category.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mr-4">
              <i className="fas fa-exclamation-triangle text-destructive text-xl"></i>
            </div>
            <div>
              <DialogTitle>Delete Category</DialogTitle>
              <p className="text-sm text-muted-foreground">This action cannot be undone</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-card-foreground">
            Are you sure you want to delete "{category?.name}"? This action will permanently remove the category from your system.
          </p>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete-category"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Category"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}