import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  CalendarIcon,
  Search,
  ReceiptText,
  DollarSign,
  CreditCard,
  Wallet,
  Printer,
  UtensilsCrossed
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { BillDTO, PaymentMethod } from "@/types/dto";

const ManagerBills = () => {
  const { branchId } = useBranchContext();

  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("ALL");
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
      setPage(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: searchResponse, isLoading } = useQuery({
    queryKey: ["manager-billing-search", branchId, startDate, endDate, paymentMethodFilter, debouncedSearchTerm, page, pageSize],
    queryFn: () =>
      managerApi.searchBills({
        branchId,
        startDate: startDate?.toISOString() || "",
        endDate: endDate?.toISOString() || "",
        paymentMethod: paymentMethodFilter,
        searchTerm: debouncedSearchTerm,
        page,
        size: pageSize
      }),
    enabled: !!branchId && !!startDate && !!endDate,
  });

  const bills = searchResponse?.result?.content || [];
  const totalPages = searchResponse?.result?.totalPages || 0;
  const totalElements = searchResponse?.result?.totalElements || 0;

  const { data: selectedBill, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["manager-bill-details", selectedBillId],
    queryFn: () => managerApi.getBillDetails(selectedBillId!),
    enabled: !!selectedBillId,
  });

  // Note: These calculations now only apply to the current page.
  // Ideally, valid revenue stats should come from a dedicated summary endpoint or the search response metadata.
  const totalRevenue = bills.reduce((sum: number, bill: any) => sum + bill.finalPrice, 0);
  const todayRevenue = bills
    .filter((b: any) => new Date(b.paidTime).toDateString() === new Date().toDateString())
    .reduce((sum: number, b: any) => sum + b.finalPrice, 0);

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case "CASH":
        return <Wallet className="h-4 w-4 mr-2" />;
      case "ONLINE":
        return <CreditCard className="h-4 w-4 mr-2" />;
      case "CARD":
        return <CreditCard className="h-4 w-4 mr-2" />;
      default:
        return <Wallet className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Billing History</h1>
          <p className="text-muted-foreground">Manage and track revenue for your branch.</p>
        </div>
        <div className="flex gap-2">
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtered Period Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {bills.length} bills on this page
            </p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <ReceiptText className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(todayRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Paid bills today</p>
          </CardContent>
        </Card>

        <Card className="bg-indigo-500/5 border-indigo-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Bill Value</CardTitle>
            <UtensilsCrossed className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-500">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                bills.length > 0 ? totalRevenue / bills.length : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This page average</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ID or table..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Methods</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="ONLINE">Online Payment</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill ID</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No bills found.</TableCell>
                </TableRow>
              ) : (
                bills.map((bill: any) => (
                  <TableRow
                    key={bill.billId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedBillId(bill.billId)}
                  >
                    <TableCell className="font-medium font-mono text-xs">#{bill.billId.substring(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{bill.tableName || "N/A"}</span>
                        <span className="text-[10px] text-muted-foreground">{bill.areaName || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(bill.paidTime), "HH:mm dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-xs">
                        {getPaymentIcon(bill.paymentMethod)}
                        {bill.paymentMethod.replace('_', ' ')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      <div className="flex flex-col items-end">
                        <span>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(bill.finalPrice)}</span>
                        {bill.discountAmount > 0 && (
                          <span className="text-[10px] text-blue-600">
                            -{new Intl.NumberFormat("vi-VN").format(bill.discountAmount)} promo
                          </span>
                        )}
                      </div>
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
                Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalElements)} of {totalElements} bills
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

      <Dialog open={!!selectedBillId} onOpenChange={(open) => !open && setSelectedBillId(null)}>
        <DialogContent className="max-w-[400px] p-0 overflow-hidden border-none shadow-2xl [&>button]:no-print">
          {isLoadingDetails ? (
            <div className="p-10 text-center bg-background text-foreground">Loading Receipt...</div>
          ) : selectedBill ? (
            <div className="bg-white text-black p-6 space-y-4 font-mono text-sm relative" id="invoice-content">
              {/* Header */}
              <div className="text-center space-y-0.5">
                <h2 className="text-xl font-bold uppercase tracking-wide">
                  {selectedBill.restaurantName || "RESTAURANT"}
                </h2>
                <p className="text-xs text-gray-600">{selectedBill.branchAddress}</p>
                <p className="text-xs text-gray-600">Tel: {selectedBill.branchPhone}</p>
              </div>

              <div className="border-t-2 border-dashed border-gray-400" />

              {/* Bill Info */}
              <div className="py-2 space-y-1">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest">Invoice</p>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Bill #</span>
                  <span className="font-medium">{selectedBill.billId.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{format(new Date(selectedBill.paidTime), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium">{format(new Date(selectedBill.paidTime), "hh:mm a")}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Table</span>
                  <span className="font-medium">{selectedBill.tableName || selectedBill.order?.tableName || "N/A"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Area</span>
                  <span className="font-medium">{selectedBill.areaName || selectedBill.order?.areaName || "N/A"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium">{selectedBill.paymentMethod}</span>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-gray-400" />

              {/* Items Header */}
              <div className="py-1">
                <div className="grid grid-cols-12 text-[11px] font-bold uppercase text-gray-500 pb-1">
                  <span className="col-span-5">Item</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">Price</span>
                  <span className="col-span-3 text-right">Amount</span>
                </div>
                <div className="border-b border-gray-300" />
              </div>

              {/* Items */}
              <div className="space-y-0 text-xs">
                {selectedBill.order?.orderLines?.flatMap(line => line.orderItems || []).map((item) => {
                  const hasItemDiscount = item.discountedPrice && item.discountedPrice < item.menuItemPrice;
                  return (
                    <div key={item.orderItemId} className="py-1.5 border-b border-gray-100 last:border-0">
                      <div className="grid grid-cols-12">
                        <div className="col-span-5 truncate font-medium">{item.menuItemName}</div>
                        <div className="col-span-2 text-center">{item.quantity}</div>
                        <div className="col-span-2 text-right">
                          {hasItemDiscount && (
                            <span className="text-[9px] text-gray-400 line-through block leading-none">
                              {new Intl.NumberFormat("vi-VN").format(item.menuItemPrice)}
                            </span>
                          )}
                          <span className={hasItemDiscount ? "text-primary font-bold" : ""}>
                            {new Intl.NumberFormat("vi-VN").format(item.discountedPrice || item.menuItemPrice)}
                          </span>
                        </div>
                        <div className="col-span-3 text-right font-medium">
                          {new Intl.NumberFormat("vi-VN").format(item.totalPrice)}
                        </div>
                      </div>
                      {item.customizations?.length > 0 && (
                        <div className="pl-2 pt-0.5">
                          {item.customizations.map(c => (
                            <p key={c.orderItemCustomizationId} className="text-[10px] text-gray-500">
                              + {c.customizationName} ({new Intl.NumberFormat("vi-VN").format(c.totalPrice / item.quantity)})
                            </p>
                          ))}
                        </div>
                      )}
                      {item.note && (
                        <p className="text-[10px] text-gray-400 pl-2 italic">"{item.note}"</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t-2 border-dashed border-gray-400 mt-2" />

              {/* Totals */}
              <div className="py-2 space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Gross Total</span>
                  <span>{new Intl.NumberFormat("vi-VN").format(
                    selectedBill.order?.orderLines?.flatMap(l => l.orderItems || []).reduce((sum, i) => {
                      const custTotal = i.customizations?.reduce((s, c) => s + c.totalPrice, 0) || 0;
                      return sum + (i.menuItemPrice * i.quantity) + custTotal;
                    }, 0) || 0
                  )}</span>
                </div>
                
                {/* Item Discounts Breakdown */}
                {selectedBill.order?.orderLines?.flatMap(l => l.orderItems || []).some(i => i.discountedPrice && i.discountedPrice < i.menuItemPrice) && (
                  <div className="flex justify-between text-xs text-teal-600">
                    <span>Item Discounts</span>
                    <span>-{new Intl.NumberFormat("vi-VN").format(
                      selectedBill.order?.orderLines?.flatMap(l => l.orderItems || []).reduce((sum, i) => {
                        if (i.discountedPrice && i.discountedPrice < i.menuItemPrice) {
                          return sum + (i.menuItemPrice - i.discountedPrice) * i.quantity;
                        }
                        return sum;
                      }, 0)
                    )}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-medium">{new Intl.NumberFormat("vi-VN").format(
                    (selectedBill.finalPrice || 0) + (selectedBill.discountAmount || 0)
                  )}</span>
                </div>

                {/* Order Discount */}
                {selectedBill.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-blue-600">
                    <div className="flex flex-col">
                      <span>Order Discount</span>
                      <span className="text-[9px] opacity-70">({selectedBill.promotionName || selectedBill.promotionCode})</span>
                    </div>
                    <span>-{new Intl.NumberFormat("vi-VN").format(selectedBill.discountAmount)}</span>
                  </div>
                )}

                <div className="border-t border-gray-300 mt-1 pt-1" />
                <div className="flex justify-between text-base font-bold text-primary">
                  <span>TOTAL</span>
                  <span>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedBill.finalPrice)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-widest pt-1">
                  <span>Incl. VAT if applicable</span>
                </div>
              </div>

              {/* Note */}
              {selectedBill.note && (
                <>
                  <div className="border-t border-dashed border-gray-400" />
                  <div className="py-2">
                    <p className="text-[11px] text-gray-500">Note: {selectedBill.note}</p>
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="border-t-2 border-dashed border-gray-400 pt-3 text-center space-y-1">
                <p className="text-xs font-medium">Thank you for dining with us!</p>
                <p className="text-[10px] text-gray-400">Please come again</p>
              </div>

              <DialogFooter className="sm:justify-center border-t border-dashed mt-6 pt-4 gap-2 no-print">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 bg-white text-black border-black hover:bg-slate-100 dark:bg-white dark:text-black dark:border-black dark:hover:bg-slate-100"
                  onClick={() => window.print()}
                >
                  <Printer className="h-3 w-3 mr-2" /> Print
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerBills;
