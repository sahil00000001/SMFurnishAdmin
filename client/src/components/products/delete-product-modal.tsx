import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
}

export default function DeleteProductModal({ isOpen, onClose, product }: DeleteProductModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (product?.id) {
      deleteMutation.mutate(product.id);
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
              <DialogTitle>Delete Product</DialogTitle>
              <p className="text-sm text-muted-foreground">This action cannot be undone</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-card-foreground">
            Are you sure you want to delete "{product?.name}"? This action will permanently remove the product from your inventory.
          </p>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Product"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
