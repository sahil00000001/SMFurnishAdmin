import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ordersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [, setLocation] = useLocation();
  const limit = 10;

  const { data: ordersData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["/api/orders", { page: currentPage, limit, status: statusFilter, payment_status: paymentStatusFilter }],
    queryFn: () => ordersApi.getAll({ 
      page: currentPage, 
      limit, 
      status: statusFilter || undefined,
      payment_status: paymentStatusFilter || undefined
    }),
  });

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination || {};
  const total = ordersData?.total || 0;

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleOrderClick = (order: any) => {
    setLocation(`/orders/${order.orderId}`);
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Orders</h2>
            <p className="text-muted-foreground">Manage customer orders</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Orders</h2>
            <p className="text-muted-foreground">Manage customer orders</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="mb-4">
              <i className="fas fa-exclamation-triangle text-4xl text-destructive mb-4"></i>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Orders</h3>
            <p className="text-muted-foreground mb-4">
              {error?.message || "There was an error loading the orders. Please try again."}
            </p>
            <Button onClick={() => refetch()} data-testid="button-retry-orders">
              <i className="fas fa-refresh mr-2"></i>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Orders</h2>
          <p className="text-muted-foreground">Manage customer orders ({total} total)</p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-sm mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search orders by ID, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-orders"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-payment-status-filter">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Payment</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead data-testid="header-order-id">Order ID</TableHead>
                <TableHead data-testid="header-customer">Customer</TableHead>
                <TableHead data-testid="header-amount">Amount</TableHead>
                <TableHead data-testid="header-status">Status</TableHead>
                <TableHead data-testid="header-payment">Payment</TableHead>
                <TableHead data-testid="header-date">Date</TableHead>
                <TableHead data-testid="header-actions">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order: any) => (
                  <TableRow 
                    key={order.id} 
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleOrderClick(order)}
                    data-testid={`row-order-${order.orderId}`}
                  >
                    <TableCell className="font-medium" data-testid={`text-order-id-${order.orderId}`}>
                      {order.orderId}
                    </TableCell>
                    <TableCell data-testid={`text-customer-${order.orderId}`}>
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        {order.customerEmail && (
                          <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-amount-${order.orderId}`}>
                      ₹{order.totalAmount?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell data-testid={`badge-status-${order.orderId}`}>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`badge-payment-${order.orderId}`}>
                      <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-date-${order.orderId}`}>
                      {order.orderDate ? format(order.orderDate, 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(order);
                        }}
                        data-testid={`button-view-${order.orderId}`}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} orders
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                  data-testid="button-prev-page"
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage >= pagination.totalPages}
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}