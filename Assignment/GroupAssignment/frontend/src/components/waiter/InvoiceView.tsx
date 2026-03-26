import { forwardRef } from "react";
import type { BillDTO, OrderDTO } from "@/types/dto";

interface InvoiceViewProps {
    bill: BillDTO;
    order: OrderDTO;
}

const InvoiceView = forwardRef<HTMLDivElement, InvoiceViewProps>(({ bill, order }, ref) => {
    const allItems = order.orderLines?.flatMap(line => line.orderItems) || [];
    const itemCount = allItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = allItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const branchName = bill.branchName?.trim();
    const branchAddress = bill.branchAddress?.trim();
    const shouldShowBranchName =
        !!branchName &&
        // Avoid duplicate address when backend sets branchName like "Branch at {address}"
        (!branchAddress || (!branchName.toLowerCase().includes(branchAddress.toLowerCase()) && branchName !== branchAddress));

    const formatPaymentMethod = (method: string) => {
        switch (method) {
            case 'CASH': return 'Cash';
            case 'CARD': return 'Credit / Debit Card';
            case 'ONLINE': return 'Online Payment';
            default: return method;
        }
    };

    return (
        <div ref={ref} className="font-mono text-sm bg-white text-black p-6 min-w-[320px]" id="invoice-content">
            {/* Header */}
            <div className="text-center space-y-0.5 pb-4">
                <h2 className="text-xl font-bold uppercase tracking-wide">
                    {bill.restaurantName || "RESTAURANT"}
                </h2>
                {shouldShowBranchName && (
                    <p className="text-xs font-semibold">{branchName}</p>
                )}
                {branchAddress && (
                    <p className="text-xs text-gray-600">{branchAddress}</p>
                )}
                {bill.branchPhone && (
                    <p className="text-xs text-gray-600">Tel: {bill.branchPhone}</p>
                )}
            </div>

            <div className="border-t-2 border-dashed border-gray-400" />

            {/* Bill Info */}
            <div className="py-3 space-y-1">
                <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-widest">Invoice</p>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Bill #</span>
                    <span className="font-medium">{bill.billId?.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">
                        {new Date(bill.paidTime).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                        })}
                    </span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium">
                        {new Date(bill.paidTime).toLocaleTimeString('en-US', {
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Table</span>
                    <span className="font-medium">{order.tableName}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Payment</span>
                    <span className="font-medium">{formatPaymentMethod(bill.paymentMethod)}</span>
                </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-400" />

            {/* Items Header */}
            <div className="py-2">
                <div className="grid grid-cols-12 text-[11px] font-bold uppercase text-gray-500 pb-1">
                    <span className="col-span-5">Item</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-2 text-right">Price</span>
                    <span className="col-span-3 text-right">Amount</span>
                </div>
                <div className="border-b border-gray-300" />
            </div>

            {/* Items */}
            <div className="space-y-0">
                {allItems.map((item) => {
                    const hasItemDiscount = item.discountedPrice && item.discountedPrice < item.menuItemPrice;
                    return (
                        <div key={item.orderItemId} className="py-1.5 border-b border-gray-200">
                            <div className="grid grid-cols-12 text-xs">
                                <div className="col-span-5 truncate font-medium">{item.menuItemName}</div>
                                <div className="col-span-2 text-center">{item.quantity}</div>
                                <div className="col-span-2 text-right">
                                    {hasItemDiscount && (
                                        <span className="text-[9px] text-gray-400 line-through block leading-none">
                                            {item.menuItemPrice.toLocaleString()}
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
                                            + {c.customizationName} {c.totalPrice > 0 ? `(${ (c.totalPrice / item.quantity).toLocaleString() })` : ''}
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

            {/* Totals Section */}
            <div className="py-4 space-y-3">
                {(() => {
                    const rawTotal = allItems.reduce((sum, i) => {
                        const custTotal = i.customizations?.reduce((s, c) => s + c.totalPrice, 0) || 0;
                        return sum + (i.menuItemPrice * i.quantity) + custTotal;
                    }, 0);
                    
                    const itemDiscounts = allItems.reduce((sum, i) => {
                        if (i.discountedPrice && i.discountedPrice < i.menuItemPrice) {
                            return sum + (i.menuItemPrice - i.discountedPrice) * i.quantity;
                        }
                        return sum;
                    }, 0);

                    const orderDiscount = bill.discountAmount || 0;
                    const totalDiscount = itemDiscounts + orderDiscount;
                    const finalPrice = bill.finalPrice || 0;
                    const hasDiscount = totalDiscount > 0;

                    return (
                        <>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-medium uppercase tracking-tight">Subtotal</span>
                                <span className={`font-mono ${hasDiscount ? 'text-gray-400 line-through' : 'font-bold'}`}>
                                    {new Intl.NumberFormat("vi-VN").format(rawTotal)}
                                </span>
                            </div>

                            {hasDiscount && (
                                <div className="flex justify-between items-center bg-green-50/50 p-2 rounded-lg border border-green-100/50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Total Savings</span>
                                        {orderDiscount > 0 && bill.promotionName && (
                                            <span className="text-[8px] text-green-600 font-bold opacity-80 uppercase">Promo: {bill.promotionName}</span>
                                        )}
                                    </div>
                                    <span className="text-sm font-black text-green-600 font-mono">
                                        -{new Intl.NumberFormat("vi-VN").format(totalDiscount)}
                                    </span>
                                </div>
                            )}

                            <div className="pt-2 border-t border-dashed border-gray-200" />
                            
                            <div className="flex justify-between items-end pb-1">
                                <span className="text-lg font-black text-gray-900 italic tracking-tighter">TOTAL</span>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-primary font-mono leading-none">
                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(finalPrice)}
                                    </span>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                                        Billed in VND • Incl. VAT
                                    </p>
                                </div>
                            </div>
                        </>
                    );
                })()}
            </div>

            {/* Note */}
            {bill.note && (
                <>
                    <div className="border-t border-dashed border-gray-400" />
                    <div className="py-2">
                        <p className="text-[11px] text-gray-500">Note: {bill.note}</p>
                    </div>
                </>
            )}

            {/* Footer */}
            <div className="border-t-2 border-dashed border-gray-400 pt-3 text-center space-y-1">
                <p className="text-xs font-medium">Thank you for dining with us!</p>
                <p className="text-[10px] text-gray-400">Please come again</p>
            </div>
        </div>
    );
});

InvoiceView.displayName = "InvoiceView";

export default InvoiceView;
