import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ordersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Package, CreditCard } from "lucide-react";
import { format } from "date-fns";

export default function OrderDetails() {
  const params = useParams();
  const orderId = params.orderId;
  const [, setLocation] = useLocation();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["/api/orders/by-id", orderId],
    queryFn: () => ordersApi.getById(orderId as string),
    enabled: !!orderId,
  });

  const handleBackClick = () => {
    setLocation('/orders');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'processing': return 'default';
      default: return 'outline';
    }
  };

  const getPaymentStatusBadgeVariant = (paymentStatus: string) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid': 
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackClick} 
            className="mr-4"
            data-testid="button-back-to-orders"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Order Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The order with ID "{orderId}" could not be found.
            </p>
            <Button onClick={handleBackClick}>
              Return to Orders List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackClick} 
            className="mr-4"
            data-testid="button-back-to-orders"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground" data-testid="heading-order-id">
              Order {order.orderId}
            </h2>
            <p className="text-muted-foreground">
              {order.orderDate ? format(order.orderDate, 'PPP') : 'Date not available'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={getStatusBadgeVariant(order.status)} data-testid="badge-order-status">
            {order.status}
          </Badge>
          <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)} data-testid="badge-payment-status">
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium" data-testid="text-customer-name">{order.customerName}</p>
                </div>
                
                {order.customerEmail && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <p data-testid="text-customer-email">{order.customerEmail}</p>
                  </div>
                )}
                
                {order.customerPhone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    <p data-testid="text-customer-phone">{order.customerPhone}</p>
                  </div>
                )}
                
                {order.customerAddress && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Address
                    </label>
                    <p className="text-sm" data-testid="text-customer-address">{order.customerAddress}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg" data-testid={`item-${index}`}>
                      <div className="flex-1">
                        <p className="font-medium" data-testid={`item-name-${index}`}>
                          {item.name || item.productName || 'Product'}
                        </p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground" data-testid={`item-description-${index}`}>
                            {item.description}
                          </p>
                        )}
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span data-testid={`item-quantity-${index}`}>Qty: {item.quantity || 1}</span>
                          <span data-testid={`item-price-${index}`}>₹{item.price || 0}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium" data-testid={`item-total-${index}`}>
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p data-testid="text-order-notes">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-medium" data-testid="text-summary-order-id">{order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={getStatusBadgeVariant(order.status)} data-testid="text-summary-status">
                    {order.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment:</span>
                  <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)} data-testid="text-summary-payment">
                    {order.paymentStatus}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span data-testid="text-summary-total">₹{order.totalAmount?.toLocaleString() || '0'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.orderDate && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                    <p data-testid="text-order-date">{format(order.orderDate, 'PPp')}</p>
                  </div>
                )}
                {order.deliveryDate && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Delivery Date</label>
                    <p data-testid="text-delivery-date">{format(order.deliveryDate, 'PPp')}</p>
                  </div>
                )}
                {order.updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p data-testid="text-last-updated">{format(order.updatedAt, 'PPp')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Raw Data (for debugging) */}
          {process.env.NODE_ENV === 'development' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Debug: Raw Order Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(order, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}