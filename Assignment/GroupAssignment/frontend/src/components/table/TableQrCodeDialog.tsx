import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Download, ExternalLink, Copy } from "lucide-react";
import { useState } from "react";
import type { AreaTableDTO } from "@/types/dto";

interface TableQrCodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    table: AreaTableDTO | null;
    showTableInfo?: boolean;
    tableUrl?: string;
}

const TableQrCodeDialog = ({ 
    open, 
    onOpenChange, 
    table, 
    showTableInfo = false,
    tableUrl 
}: TableQrCodeDialogProps) => {
    const [copied, setCopied] = useState(false);

    const handleDownloadQR = () => {
        if (!table?.qr) return;

        // Convert base64 to blob and download
        const link = document.createElement('a');
        link.href = table.qr;
        link.download = `QR-${table.tag}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyUrl = async () => {
        if (!tableUrl) return;
        
        try {
            await navigator.clipboard.writeText(tableUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
        }
    };

    const handleOpenUrl = () => {
        if (!tableUrl) return;
        window.open(tableUrl, '_blank');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>QR Code - {table?.tag}</DialogTitle>
                    <DialogDescription>
                        Scan this QR code to access the menu for this table
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4 max-h-[70vh] overflow-y-auto">
                    {table?.qr ? (
                        <>
                            <div className="p-4 bg-white rounded-lg border shadow-sm">
                                <img
                                    src={table.qr}
                                    alt={`QR Code for ${table.tag}`}
                                    className="w-64 h-64"
                                />
                            </div>
                            
                            {showTableInfo && (
                                <div className="text-center">
                                    <p className="text-sm font-medium">{table.tag}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Capacity: {table.capacity} people
                                    </p>
                                </div>
                            )}

                            {/* URL Display */}
                            {tableUrl && (
                                <div className="w-full space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground">Table URL:</p>
                                    <div className="flex items-center gap-2 p-2.5 bg-muted rounded-md border">
                                        <code className="flex-1 text-xs break-all">
                                            {tableUrl}
                                        </code>
                                        <div className="flex gap-1 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={handleCopyUrl}
                                                title="Copy URL"
                                            >
                                                <Copy className={`w-4 h-4 ${copied ? 'text-teal' : ''}`} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={handleOpenUrl}
                                                title="Open URL"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {copied && (
                                        <p className="text-xs text-teal text-center animate-in fade-in">
                                            ✓ URL copied to clipboard!
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Download Button */}
                            <Button
                                onClick={handleDownloadQR}
                                className="w-full gap-2"
                                variant="outline"
                            >
                                <Download className="w-4 h-4" />
                                Download QR Code
                            </Button>
                        </>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            No QR code available
                        </div>
                    )}
                </div>
                {showTableInfo && (
                    <DialogFooter>
                        <Button onClick={() => onOpenChange(false)}>Close</Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default TableQrCodeDialog;