import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { ReservationStatus, type ReservationFilterParams } from '@/types/dto/reservation.dto';

interface ReservationFiltersProps {
  filters: ReservationFilterParams;
  onFiltersChange: (filters: ReservationFilterParams) => void;
}

const statusLabels: Record<ReservationStatus, string> = {
  [ReservationStatus.PENDING]: 'Pending',
  [ReservationStatus.APPROVED]: 'Approved',
  [ReservationStatus.CONFIRMED]: 'Confirmed',
  [ReservationStatus.COMPLETED]: 'Completed',
  [ReservationStatus.CANCELLED]: 'Cancelled',
  [ReservationStatus.NO_SHOW]: 'No Show'
};

const defaultStatuses = [
  ReservationStatus.PENDING,
  ReservationStatus.APPROVED,
  ReservationStatus.CONFIRMED
];

export function ReservationFilters({ filters, onFiltersChange }: ReservationFiltersProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search || '');
  const [selectedStatuses, setSelectedStatuses] = useState<ReservationStatus[]>(
    filters.statuses || defaultStatuses
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [search]);

  // Only trigger filter change when debounced search changes
  useEffect(() => {
    const newFilters: ReservationFilterParams = {
      search: debouncedSearch || undefined,
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
      endDate: endDate ? endDate.toISOString().split('T')[0] : undefined
    };
    onFiltersChange(newFilters);
  }, [debouncedSearch, selectedStatuses, startDate, endDate, onFiltersChange]);

  const handleStatusToggle = (status: ReservationStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedStatuses(defaultStatuses);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Customer
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(ReservationStatus).map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={() => handleStatusToggle(status)}
                />
                <label
                  htmlFor={`status-${status}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {statusLabels[status]}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <DatePicker
              date={startDate}
              onDateChange={setStartDate}
              placeholder="Select start date"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <DatePicker
              date={endDate}
              onDateChange={setEndDate}
              placeholder="Select end date"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
