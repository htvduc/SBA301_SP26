import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { useBranchContext } from "@/hooks/useBranchContext";
import { managerApi } from "@/api/managerApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Eye, ListFilter, Search, UtensilsCrossed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { OrderDTO, OrderStatus } from "@/types/dto";

const ManagerOrders = () => {
  const { branchId } = useBranchContext();
  
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 7))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); // Reset to first page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: searchResponse, isLoading } = useQuery({
    queryKey: ["manager-orders-search", branchId, statusFilter, debouncedSearchTerm, startDate, endDate, page, pageSize],
    queryFn: () => {
      const sDate = startDate ? new Date(new Date(startDate).setHours(0, 0, 0, 0)).toISOString() : undefined;
      const eDate = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString() : undefined;
      
      return managerApi.searchOrders({
        branchId,
        status: statusFilter,
        searchTerm: debouncedSearchTerm,
        startDate: sDate,
        endDate: eDate,
        page,
        size: pageSize
      });
    },
    enabled: !!branchId,
  });

  const orders = searchResponse?.result?.content || [];
  const totalPages = searchResponse?.result?.totalPages || 0;
  const totalElements = searchResponse?.result?.totalElements || 0;

  const { data: selectedOrder, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["manager-order-details", selectedOrderId],
    queryFn: () => managerApi.getOrderDetails(selectedOrderId!),
    enabled: !!selectedOrderId,
  });

  // Filtering is now handled on the server
  // const filteredOrders = orders.filter(...)

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50 hover:bg-green-500/10">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive" className="bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-500/10">Cancelled</Badge>;
      case "EATING":
        return <Badge variant="secondary" className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50">Eating</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const selectedOrderItems = useMemo(
    () => selectedOrder?.orderLines?.flatMap((line) => line.orderItems ?? []) ?? [],
    [selectedOrder]
  );

  const selectedOrderItemDiscount = useMemo(() => {
    return selectedOrderItems.reduce((sum, item) => {
      const discounted = item.discountedPrice ?? item.menuItemPrice;
      const unitSavings = Math.max(item.menuItemPrice - discounted, 0);
      return sum + unitSavings * item.quantity;
    }, 0);
  }, [selectedOrderItems]);

  const selectedOrderGross = useMemo(() => {
    return selectedOrderItems.reduce((sum, item) => {
      const discounted = item.discountedPrice ?? item.menuItemPrice;
      const unitSavings = Math.max(item.menuItemPrice - discounted, 0);
      return sum + item.totalPrice + unitSavings * item.quantity;
    }, 0);
  }, [selectedOrderItems]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Order Management</h1>
          <p className="text-muted-foreground">View and manage order history for your branch.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListFilter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Table name or Order ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="EATING">Eating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
                  setEndDate(new Date());
                  setPage(0);
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order: any) => (
                  <TableRow key={order.orderId} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedOrderId(order.orderId)}>
                    <TableCell className="font-medium">#{order.orderId.substring(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{order.tableName}</span>
                        <span className="text-[10px] text-muted-foreground">{order.areaName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(order.createdAt), "HH:mm dd/MM/yyyy")}</TableCell>
                    <TableCell className="font-semibold text-primary">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalPrice)}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalElements)} of {totalElements} orders
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <div className="flex items-center px-2 text-sm font-medium">
                  Page {page + 1} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="border-b pb-4 mb-4">
            <SheetTitle className="text-2xl font-bold flex items-center justify-between">
              Order Details
              {selectedOrder && getStatusBadge(selectedOrder.status)}
            </SheetTitle>
            <SheetDescription>
              {selectedOrder ? (
                <span>Area: {selectedOrder.areaName} | Table: {selectedOrder.tableName} | ID: #{selectedOrder.orderId.substring(0, 8)}</span>
              ) : "Loading..."}
            </SheetDescription>
          </SheetHeader>

          {isLoadingDetails ? (
            <div className="flex justify-center py-10">Loading...</div>
          ) : selectedOrder ? (
            <div className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Time</span>
                  <span className="font-medium">{format(new Date(selectedOrder.createdAt), "HH:mm:ss dd/MM/yyyy")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Update</span>
                  <span className="font-medium">{format(new Date(selectedOrder.updatedAt), "HH:mm:ss dd/MM/yyyy")}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  Items ordered
                </h3>
                <div className="space-y-3">
                  {selectedOrder.orderLines?.map((line) => (
                    <div key={line.orderLineId} className="bg-card border rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-muted/50 px-3 py-1.5 flex justify-between text-[10px] uppercase tracking-wider font-bold border-b">
                        <span className="text-muted-foreground">Line #{line.orderLineId.substring(0, 5)}</span>
                        <span className={line.orderLineStatus === 'COMPLETED' ? 'text-green-600' : 'text-amber-600'}>
                          {line.orderLineStatus}
                        </span>
                      </div>
                      <div className="p-3 space-y-3">
                        {line.orderItems?.map((item) => (
                          <div key={item.orderItemId} className="flex gap-4">
                            <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                              {item.menuItemImageUrl ? (
                                <img src={item.menuItemImageUrl} alt={item.menuItemName} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground/40">
                                  <UtensilsCrossed className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-semibold text-sm truncate">{item.menuItemName}</span>
                                <span className="text-xs font-bold text-primary shrink-0">
                                  {new Intl.NumberFormat("vi-VN").format(item.totalPrice)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold">
                                  x{item.quantity}
                                </Badge>
                                {item.discountedPrice != null && item.discountedPrice < item.menuItemPrice ? (
                                  <span className="text-[10px] italic">
                                    <span className="text-muted-foreground line-through mr-1">
                                      {new Intl.NumberFormat("vi-VN").format(item.menuItemPrice)}
                                    </span>
                                    <span className="font-semibold text-primary">
                                      {new Intl.NumberFormat("vi-VN").format(item.discountedPrice)}
                                    </span>
                                    <span className="text-muted-foreground ml-1">/ item</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground italic">
                                    {new Intl.NumberFormat("vi-VN").format(item.menuItemPrice)} / item
                                  </span>
                                )}
                              </div>
                              {item.note && (
                                <p className="text-[10px] italic text-destructive mt-1.5 bg-destructive/5 p-1 rounded border border-destructive/10">
                                  Note: {item.note}
                                </p>
                              )}
                              {item.customizations && item.customizations.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {item.customizations.map(c => (
                                    <Badge
                                      key={c.orderItemCustomizationId}
                                      variant="outline"
                                      className="text-[10px] font-medium py-0.5 leading-tight border-cyan-400/35 bg-cyan-500/10 text-cyan-100"
                                    >
                                      <span>{c.customizationName}{c.quantity > 1 ? ` x${c.quantity}` : ""}</span>
                                      <span className="ml-1 text-emerald-300">
                                        (+{new Intl.NumberFormat("vi-VN", {
                                          style: "currency",
                                          currency: "VND",
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0,
                                        }).format(c.totalPrice)})
                                      </span>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-primary/5 px-3 py-1.5 text-right text-[11px] font-black tracking-wide border-t border-primary/10">
                        <span className="text-muted-foreground mr-2 font-normal uppercase text-[9px]">Line Total:</span>
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(line.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gross total</span>
                  <span>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedOrderGross)}</span>
                </div>
                {selectedOrderItemDiscount > 0 && (
                  <div className="flex justify-between text-sm text-teal-600">
                    <span>Item discounts</span>
                    <span>-{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedOrderItemDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Grand Total</span>
                  <span className="text-primary">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedOrder.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">Unable to load details.</div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ManagerOrders;
