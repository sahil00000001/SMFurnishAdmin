import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ordersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Package, CreditCard, CheckCircle, Clock, Truck, Download, Copy, ExternalLink, AlertTriangle, Star, Shield } from "lucide-react";
import { format } from "date-fns";

export default function OrderDetails() {
  const params = useParams();
  const orderId = params.orderId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["/api/orders/by-id", orderId],
    queryFn: () => ordersApi.getById(orderId as string),
    enabled: !!orderId,
  });

  const handleBackClick = () => {
    setLocation('/orders');
  };

  const copyOrderId = async () => {
    if (order?.orderId) {
      await navigator.clipboard.writeText(order.orderId);
      toast({
        title: "Copied!",
        description: "Order ID copied to clipboard",
      });
    }
  };

  const getOrderProgress = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { progress: 25, step: 1 };
      case 'confirmed': return { progress: 50, step: 2 };
      case 'processing': return { progress: 75, step: 3 };
      case 'shipped': return { progress: 90, step: 4 };
      case 'completed': 
      case 'delivered': return { progress: 100, step: 5 };
      case 'cancelled': return { progress: 0, step: 0 };
      default: return { progress: 25, step: 1 };
    }
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

  const orderProgress = getOrderProgress(order.status);

  return (
    <div className="space-y-8">
      {/* Navigation */}
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
      </div>

      {/* Hero Section */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-foreground" data-testid="heading-order-id">
                      Order #{order.orderId?.split('_').pop() || order.orderId}
                    </h1>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyOrderId}
                      className="h-8 w-8 p-0"
                      data-testid="button-copy-order-id"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-lg">
                    {order.orderDate ? format(order.orderDate, 'EEEE, MMMM do, yyyy') : 'Date not available'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Badge 
                  variant={getStatusBadgeVariant(order.status)} 
                  className="px-3 py-1 text-sm font-medium"
                  data-testid="badge-order-status"
                >
                  {order.status?.toUpperCase()}
                </Badge>
                <Badge 
                  variant={getPaymentStatusBadgeVariant(order.paymentStatus)} 
                  className="px-3 py-1 text-sm font-medium"
                  data-testid="badge-payment-status"
                >
                  {order.paymentStatus?.toUpperCase()}
                </Badge>
                {order.payment?.method && (
                  <Badge variant="outline" className="px-3 py-1 text-sm">
                    {order.payment.method.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="text-3xl font-bold text-foreground">
                ₹{(order.totalAmount || order.pricing?.total)?.toLocaleString() || '0'}
              </div>
              <p className="text-muted-foreground">Total Amount</p>
              {order.invoice_number && (
                <div className="flex items-center gap-2 justify-end">
                  <Button variant="outline" size="sm" className="h-8">
                    <Download className="w-3 h-3 mr-1" />
                    Invoice
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Progress Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Order Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Order Placed</span>
              <span>Delivered</span>
            </div>
            <Progress value={orderProgress.progress} className="h-2" />
            <div className="grid grid-cols-5 gap-2 text-xs">
              <div className={`flex flex-col items-center space-y-1 ${orderProgress.step >= 1 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${orderProgress.step >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-muted'}`}>
                  <Clock className="w-4 h-4" />
                </div>
                <span>Placed</span>
              </div>
              <div className={`flex flex-col items-center space-y-1 ${orderProgress.step >= 2 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${orderProgress.step >= 2 ? 'bg-blue-100 text-blue-600' : 'bg-muted'}`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span>Confirmed</span>
              </div>
              <div className={`flex flex-col items-center space-y-1 ${orderProgress.step >= 3 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${orderProgress.step >= 3 ? 'bg-blue-100 text-blue-600' : 'bg-muted'}`}>
                  <Package className="w-4 h-4" />
                </div>
                <span>Processing</span>
              </div>
              <div className={`flex flex-col items-center space-y-1 ${orderProgress.step >= 4 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${orderProgress.step >= 4 ? 'bg-blue-100 text-blue-600' : 'bg-muted'}`}>
                  <Truck className="w-4 h-4" />
                </div>
                <span>Shipped</span>
              </div>
              <div className={`flex flex-col items-center space-y-1 ${orderProgress.step >= 5 ? 'text-green-600' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${orderProgress.step >= 5 ? 'bg-green-100 text-green-600' : 'bg-muted'}`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span>Delivered</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Customer Information
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Valued Customer
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-lg font-semibold" data-testid="text-customer-name">
                      {order.customerName || order.customer?.name}
                    </p>
                  </div>
                  
                  {(order.customerEmail || order.customer?.email) && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </label>
                      <div className="flex items-center gap-2">
                        <p className="text-lg" data-testid="text-customer-email">
                          {order.customerEmail || order.customer?.email}
                        </p>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {(order.customerPhone || order.customer?.phone) && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </label>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-mono" data-testid="text-customer-phone">
                          {order.customerPhone || order.customer?.phone}
                        </p>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Phone className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {(order.customerAddress || order.customer?.address) && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Delivery Address
                      </label>
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-sm leading-relaxed" data-testid="text-customer-address">
                          {order.customerAddress || 
                           `${order.customer?.address}${order.customer?.city ? `, ${order.customer.city}` : ''}${order.customer?.state ? `, ${order.customer.state}` : ''}${order.customer?.pin_code ? ` - ${order.customer.pin_code}` : ''}${order.customer?.country ? `, ${order.customer.country}` : ''}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    Order Items ({order.items.length})
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Quality Assured
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="border border-border rounded-xl p-6 bg-gradient-to-r from-background to-muted/20" data-testid={`item-${index}`}>
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold text-foreground" data-testid={`item-name-${index}`}>
                                {item.product_name || item.name || item.productName || 'Product'}
                              </h3>
                              {item.product_id && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs" data-testid={`item-product-id-${index}`}>
                                    ID: {item.product_id}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`item-description-${index}`}>
                              {item.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Quantity</p>
                                <p className="font-medium" data-testid={`item-quantity-${index}`}>{item.quantity || 1}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Unit Price</p>
                                <p className="font-medium" data-testid={`item-price-${index}`}>₹{(item.price || 0).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center lg:text-right space-y-2">
                          <div className="bg-primary/10 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">Item Total</p>
                            <p className="text-2xl font-bold text-primary" data-testid={`item-total-${index}`}>
                              ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2 justify-center lg:justify-end">
                            <Button variant="outline" size="sm" className="text-xs">
                              View Details
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              Reorder
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium">Items Subtotal:</span>
                      <span className="text-xl font-bold">
                        ₹{order.items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
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
          {/* Quick Actions */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Track Package
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Contact Customer
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Order ID</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm" data-testid="text-summary-order-id">{order.orderId}</span>
                      <Button variant="ghost" size="sm" onClick={copyOrderId} className="h-6 w-6 p-0">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={getStatusBadgeVariant(order.status)} className="mt-1" data-testid="text-summary-status">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">Payment</p>
                    <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)} className="mt-1" data-testid="text-summary-payment">
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {(order.payment?.method || order.paymentMethod) && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payment Method</span>
                    <Badge variant="outline" data-testid="text-payment-method">
                      {(order.payment?.method || order.paymentMethod)?.toUpperCase()}
                    </Badge>
                  </div>
                )}

                {order.invoice_number && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Invoice Number</span>
                      <span className="font-mono text-xs" data-testid="text-invoice-number">{order.invoice_number}</span>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                {/* Pricing Breakdown */}
                <div className="space-y-3">
                  {(order.pricing?.subtotal || order.subtotal) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium" data-testid="text-subtotal">₹{(order.pricing?.subtotal || order.subtotal)?.toLocaleString()}</span>
                    </div>
                  )}
                  {(order.pricing?.tax || order.tax) !== undefined && (order.pricing?.tax || order.tax) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium" data-testid="text-tax">₹{(order.pricing?.tax || order.tax)?.toLocaleString()}</span>
                    </div>
                  )}
                  {(order.pricing?.shipping || order.shipping) !== undefined && (order.pricing?.shipping || order.shipping) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium" data-testid="text-shipping">₹{(order.pricing?.shipping || order.shipping)?.toLocaleString()}</span>
                    </div>
                  )}
                  {(order.pricing?.discount || order.discount) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-600 font-medium" data-testid="text-discount">-₹{(order.pricing?.discount || order.discount)?.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600" data-testid="text-summary-total">
                      ₹{(order.totalAmount || order.pricing?.total)?.toLocaleString() || '0'}
                    </span>
                  </div>
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