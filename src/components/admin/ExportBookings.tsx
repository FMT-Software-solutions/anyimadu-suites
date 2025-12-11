import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import {
  exportBookingsToXLSX,
  fetchAllBookingsForExport,
} from '@/services/exportBookings';
import type { BookingsFilters } from '@/lib/queries/bookings';
import { toast } from 'sonner';
import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { PrintableBookings } from '@/components/admin/PrintableBookings';

interface Props {
  filters: BookingsFilters;
}

import { supabase } from '@/lib/supabase';

export const ExportBookings: React.FC<Props> = ({ filters }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [suitesMap, setSuitesMap] = useState<Map<string, string>>(new Map());
  const printRef = useRef<HTMLDivElement>(null);

  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const am: any = user.app_metadata;
        const um: any = user.user_metadata;
        const role = am?.role ?? am?.roles?.[0] ?? um?.role ?? 'user';
        setCurrentUserRole(role);
      }
    });
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `bookings_${new Date().toISOString().slice(0, 10)}`,
    onAfterPrint: () => toast.success('Printed bookings'),
  });
  const startPrint = async () => {
    try {
      const [rowsData, suites] = await Promise.all([
        fetchAllBookingsForExport(filters),
        (async () => {
          const { supabase } = await import('@/lib/supabase');
          const { data, error } = await supabase
            .from('suites')
            .select('id,name');
          if (error) throw error;
          const map = new Map<string, string>();
          (data || []).forEach((s: any) => {
            if (s?.id) map.set(String(s.id), String(s.name));
          });
          return map;
        })(),
      ]);
      setRows(rowsData);
      setSuitesMap(suites);
      setTimeout(() => handlePrint(), 0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to prepare print';
      toast.error(msg);
    }
  };
  const handleXLSX = async () => {
    try {
      await exportBookingsToXLSX(filters);
      toast.success('Exported bookings as Excel');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to export Excel';
      toast.error(msg);
    }
  };
  if (currentUserRole === 'read_only') return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={startPrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleXLSX}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
      <div
        style={{ position: 'absolute', left: '-10000px', top: 0 }}
        aria-hidden
      >
        <PrintableBookings ref={printRef} rows={rows} suitesMap={suitesMap} />
      </div>
    </DropdownMenu>
  );
};
