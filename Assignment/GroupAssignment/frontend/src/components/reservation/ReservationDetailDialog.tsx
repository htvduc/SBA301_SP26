import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Phone,
  Mail,
  Users,
  Calendar,
  Clock,
  MapPin,
  Table as TableIcon,
  FileText,
  CheckCircle,
  XCircle,
  UserCheck,
  CheckSquare,
  UserX,
  Loader2,
  X,
} from 'lucide-react';
import { ReservationStatus, type ReservationDTO } from '@/types/dto/reservation.dto';
import {
  useApproveReservation,
  useRejectReservation,
  useMarkArrived,
  useCompleteReservation,
  useMarkNoShow,
} from '@/hooks/queries/useReservationQueries';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ReservationDetailDialogProps {
  reservation: ReservationDTO | null;
  open: boolean;
  onClose: () => void;
}

const statusConfig: Record<
  ReservationStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  [ReservationStatus.PENDING]: {
    label: 'Pending',
    className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    icon: <Clock className="h-3 w-3" />,
  },
  [ReservationStatus.APPROVED]: {
    label: 'Approved',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  [ReservationStatus.CONFIRMED]: {
    label: 'Confirmed',
    className: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    icon: <UserCheck className="h-3 w-3" />,
  },
  [ReservationStatus.COMPLETED]: {
    label: 'Completed',
    className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    icon: <CheckSquare className="h-3 w-3" />,
  },
  [ReservationStatus.CANCELLED]: {
    label: 'Cancelled',
    className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    icon: <XCircle className="h-3 w-3" />,
  },
  [ReservationStatus.NO_SHOW]: {
    label: 'No Show',
    className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
    icon: <UserX className="h-3 w-3" />,
  },
};

export function ReservationDetailDialog({
  reservation,
  open,
  onClose,
}: ReservationDetailDialogProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [arrivalDialogOpen, setArrivalDialogOpen] = useState(false);
  const [noShowDialogOpen, setNoShowDialogOpen] = useState(false);

  const approveMutation = useApproveReservation();
  const rejectMutation = useRejectReservation();
  const arriveMutation = useMarkArrived();
  const completeMutation = useCompleteReservation();
  const noShowMutation = useMarkNoShow();

  if (!reservation) return null;

  const statusInfo = statusConfig[reservation.status];

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleApprove = () => {
    approveMutation.mutate(reservation.reservationId, {
      onSuccess: () => onClose(),
    });
  };

  const handleRejectClick = () => {
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    rejectMutation.mutate(
      {
        id: reservation.reservationId,
        data: { reason: rejectionReason || undefined },
      },
      {
        onSuccess: () => {
          setRejectDialogOpen(false);
          setRejectionReason('');
          onClose();
        },
      }
    );
  };

  const handleMarkArrivedClick = () => {
    setArrivalDialogOpen(true);
  };

  const handleMarkArrivedConfirm = () => {
    arriveMutation.mutate(reservation.reservationId, {
      onSuccess: () => {
        setArrivalDialogOpen(false);
        onClose();
      },
    });
  };

  const handleComplete = () => {
    completeMutation.mutate(reservation.reservationId, {
      onSuccess: () => onClose(),
    });
  };

  const handleMarkNoShowClick = () => {
    setNoShowDialogOpen(true);
  };

  const handleMarkNoShowConfirm = () => {
    noShowMutation.mutate(reservation.reservationId, {
      onSuccess: () => {
        setNoShowDialogOpen(false);
        onClose();
      },
    });
  };

  const getActionButtons = () => {
    const isProcessing =
      approveMutation.isPending ||
      rejectMutation.isPending ||
      arriveMutation.isPending ||
      completeMutation.isPending ||
      noShowMutation.isPending;

    switch (reservation.status) {
      case ReservationStatus.PENDING:
        return (
          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {approveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectClick}
              disabled={isProcessing}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        );

      case ReservationStatus.APPROVED:
        return (
          <div className="flex gap-2">
            <Button
              onClick={handleMarkArrivedClick}
              disabled={isProcessing}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
            >
              {arriveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserCheck className="h-4 w-4 mr-2" />
              )}
              Mark Arrived
            </Button>
            <Button
              variant="outline"
              onClick={handleMarkNoShowClick}
              disabled={isProcessing}
              className="flex-1"
            >
              <UserX className="h-4 w-4 mr-2" />
              No Show
            </Button>
          </div>
        );

      case ReservationStatus.CONFIRMED:
        return (
          <Button
            onClick={handleComplete}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {completeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckSquare className="h-4 w-4 mr-2" />
            )}
            Mark Complete
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">Reservation Details</DialogTitle>
                <DialogDescription className="mt-2">
                  ID: {reservation.reservationId}
                </DialogDescription>
              </div>
              <Badge
                variant="outline"
                className={`flex items-center gap-1.5 ${statusInfo.className}`}
              >
                {statusInfo.icon}
                {statusInfo.label}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Customer Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{reservation.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{reservation.customerPhone}</p>
                  </div>
                </div>
                {reservation.customerEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{reservation.customerEmail}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Reservation Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Reservation Time</p>
                    <p className="font-medium">{formatDateTime(reservation.startTime)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Number of Guests</p>
                    <p className="font-medium">{reservation.guestNumber}</p>
                  </div>
                </div>
                {reservation.tableTag ? (
                  <div className="flex items-center gap-3">
                    <TableIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Table</p>
                      <p className="font-medium">
                        {reservation.tableTag}
                        {reservation.tableCapacity && (
                          <span className="text-sm text-muted-foreground ml-2">
                            (Capacity: {reservation.tableCapacity})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <TableIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Table</p>
                      <p className="font-medium text-muted-foreground">Not assigned</p>
                    </div>
                  </div>
                )}
                {reservation.note && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="font-medium">{reservation.note}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Branch Information
              </h3>
              <div className="space-y-3">
                {reservation.branchName && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Branch</p>
                      <p className="font-medium">{reservation.branchName}</p>
                    </div>
                  </div>
                )}
                {reservation.branchAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{reservation.branchAddress}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDateTime(reservation.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{formatDateTime(reservation.updatedAt)}</p>
                  </div>
                </div>
                {reservation.arrivalTime && (
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Arrival Time</p>
                      <p className="font-medium">{formatDateTime(reservation.arrivalTime)}</p>
                    </div>
                  </div>
                )}
                {reservation.completionTime && (
                  <div className="flex items-center gap-3">
                    <CheckSquare className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Completion Time</p>
                      <p className="font-medium">{formatDateTime(reservation.completionTime)}</p>
                    </div>
                  </div>
                )}
                {reservation.status === ReservationStatus.COMPLETED &&
                  reservation.serviceDurationMinutes !== undefined && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Service Duration</p>
                        <p className="font-medium">
                          {formatDuration(reservation.serviceDurationMinutes)}
                        </p>
                      </div>
                    </div>
                  )}
                {reservation.rejectionReason && (
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rejection Reason</p>
                      <p className="font-medium">{reservation.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            {getActionButtons()}
            {getActionButtons() && <Separator orientation="vertical" className="h-10" />}
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this reservation? You can optionally provide a reason
              that will be sent to the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason" className="text-sm font-medium">
              Rejection Reason (Optional)
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rejectMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              disabled={rejectMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Rejecting...
                </>
              ) : (
                'Reject Reservation'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={arrivalDialogOpen} onOpenChange={setArrivalDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Customer Arrival</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this customer as arrived? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={arriveMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkArrivedConfirm}
              disabled={arriveMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {arriveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Confirm Arrival'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={noShowDialogOpen} onOpenChange={setNoShowDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm No-Show</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this customer as a no-show? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={noShowMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkNoShowConfirm}
              disabled={noShowMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {noShowMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Confirm No-Show'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
