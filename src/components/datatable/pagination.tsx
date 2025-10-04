import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { type TPaginatedMeta } from "~/common/types/base-response";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { Table } from "@tanstack/react-table";

type TDataTablePaginationProps<TData> = {
  table: Table<TData>;
  meta?: TPaginatedMeta;
};

const PAGE_SIZES = [10, 20, 30, 40, 50] as const;

export function DataTablePagination<TData>({ table, meta }: TDataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalCount = meta?.total || 0;
  const startEntry = pageIndex * pageSize + 1;
  const endEntry = Math.min((pageIndex + 1) * pageSize, totalCount);

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-2 lg:flex-row">
      <div className="text-muted-foreground order-2 text-sm sm:order-1">
        {totalCount > 0 ? (
          <>
            Showing {startEntry} to {endEntry} of {totalCount} entries
          </>
        ) : (
          "No results"
        )}
      </div>
      <div className="order-1 flex flex-wrap items-center justify-center gap-4 sm:order-2">
        <div className="order-2 flex items-center gap-2 sm:order-1">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            value={String(pageSize)}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="order-1 flex items-center gap-2 sm:order-2">
          <Button
            className="hidden h-8 w-8 p-0 lg:flex"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
            variant="outline"
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            className="h-8 w-8 p-0"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            variant="outline"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">Page {pageIndex + 1}</span>
            <span className="text-muted-foreground text-sm">of {table.getPageCount()}</span>
          </div>
          <Button
            className="h-8 w-8 p-0"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            variant="outline"
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            className="hidden h-8 w-8 p-0 lg:flex"
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            variant="outline"
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
