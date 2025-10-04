import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { type TPaginatedMeta } from "~/common/types/base-response";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/libs/clsx";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { useSidebar } from "../ui/sidebar";
import { DataTableFilters, type FilterableColumn } from "./filter";
import { DataTablePagination } from "./pagination";
import { SearchInput } from "./search";
import { DataTableViewOptions } from "./view-options";

export type TableColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  width?: number;
};

type DataTableProps<TData, TValue> = {
  columns: TableColumnDef<TData, TValue>[];
  data?: TData[];
  isLoading: boolean;
  isError: boolean;
  meta?: TPaginatedMeta;
  searchColumn?: string;
  filterableColumns?: FilterableColumn[];
  initialColumnVisibility?: VisibilityState;
  showSearch?: boolean;
  showViewOptions?: boolean;
};

function getColumnWidth<TData, TValue = unknown>(columnDef: TableColumnDef<TData, TValue>): string {
  return columnDef.width ? `${columnDef.width}px` : "auto";
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  isError,
  meta,
  searchColumn = "name",
  filterableColumns = [],
  initialColumnVisibility,
  showSearch = true,
  showViewOptions = true,
}: DataTableProps<TData, TValue>) {
  const safeData = data ?? [];
  const { state } = useSidebar();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {},
  );

  // Memoize pagination state parsing - prevents re-parsing URL params on every render
  const paginationState = useMemo(
    () => ({
      pageIndex: Number(searchParams.get("page") ?? "1") - 1,
      pageSize: Number(searchParams.get("limit") ?? "10"),
    }),
    [searchParams],
  );

  const updateUrl = useCallback(
    (newParams: Record<string, string | number | null>) => {
      setSearchParams(
        (prevParams) => {
          const params = new URLSearchParams(prevParams.toString());
          for (const [key, value] of Object.entries(newParams)) {
            if (value === null) {
              params.delete(key);
            } else {
              params.set(key, value.toString());
            }
          }
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  function handleSortingChange(newSorting: SortingState | ((old: SortingState) => SortingState)) {
    setSorting(newSorting);
    const sortingState = typeof newSorting === "function" ? newSorting(sorting) : newSorting;

    if (sortingState.length > 0) {
      updateUrl({
        sort: sortingState[0].id,
        order: sortingState[0].desc ? "desc" : "asc",
      });
    } else {
      updateUrl({
        sort: null,
        order: null,
      });
    }
  }

  function handleColumnFiltersChange(
    newFilters: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState),
  ) {
    setColumnFilters(newFilters);

    const filtersArray = typeof newFilters === "function" ? newFilters(columnFilters) : newFilters;

    const updatedParams: Record<string, string | number | null> = {};

    filtersArray.forEach((filter) => {
      if (filter.value === null || filter.value === undefined) {
        updatedParams[filter.id] = null;
      } else if (filter.value instanceof Date) {
        const column = filterableColumns.find((col) => col.id === filter.id);
        if (column?.type === "datepicker") {
          const granularity = column.datePickerProps?.granularity ?? "day";
          switch (granularity) {
            case "year":
              updatedParams[filter.id] = format(filter.value, "yyyy");
              break;
            case "month":
              updatedParams[filter.id] = format(filter.value, "yyyy-MM");
              break;
            case "day":
            default:
              updatedParams[filter.id] = format(filter.value, "yyyy-MM-dd");
              break;
          }
        } else {
          updatedParams[filter.id] = format(filter.value, "yyyy-MM-dd");
        }
      } else if (
        typeof filter.value === "string" ||
        typeof filter.value === "number" ||
        typeof filter.value === "boolean"
      ) {
        updatedParams[filter.id] = String(filter.value);
      } else {
        updatedParams[filter.id] = JSON.stringify(filter.value);
      }
    });

    columnFilters.forEach((filter) => {
      if (!filtersArray.find((f) => f.id === filter.id)) {
        updatedParams[filter.id] = null;
      }
    });

    updateUrl(updatedParams);
  }

  function handlePaginationChange(
    updater:
      | ((old: { pageIndex: number; pageSize: number }) => {
          pageIndex: number;
          pageSize: number;
        })
      | { pageIndex: number; pageSize: number },
  ) {
    if (typeof updater === "function") {
      const newPagination = updater(paginationState);
      updateUrl({
        page: newPagination.pageIndex + 1 > 1 ? newPagination.pageIndex + 1 : null,
        limit: newPagination.pageSize,
      });
    }
  }

  const table = useReactTable({
    data: safeData,
    columns,
    pageCount: meta?.total_page || 0,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: paginationState,
    },
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  const handleSearch = useCallback(
    (value: string) => {
      updateUrl({ search: value || null });
    },
    [updateUrl],
  );

  if (isError) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex gap-2">
          {showViewOptions && (
            <div className="w-full">
              <DataTableViewOptions table={table} />
            </div>
          )}
          {filterableColumns.length > 0 && (
            <div className="w-full">
              <DataTableFilters filterableColumns={filterableColumns} table={table} />
            </div>
          )}
        </div>
        {showSearch && (
          <SearchInput
            initialValue={searchParams.get("search") ?? ""}
            onSearch={handleSearch}
            placeholder={`Search by ${searchColumn}...`}
          />
        )}
      </div>

      <ScrollArea
        className={cn(
          "w-screen max-w-[95vw] overflow-hidden rounded-md border p-1 whitespace-nowrap",
          state === "collapsed"
            ? "md:max-w-[calc(100vw-64px-3.5rem)]"
            : "md:max-w-[calc(100vw-256px-4rem)]",
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="hover:bg-transparent" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: getColumnWidth(header.column.columnDef) }}
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        {header.column.columnDef.enableSorting ? (
                          <button
                            className="hover:text-foreground group flex cursor-pointer items-center gap-1.5"
                            onClick={() => {
                              // Cycle through sorting states: asc -> desc -> none
                              const currentSortDir = header.column.getIsSorted();
                              if (currentSortDir === false) {
                                table.setSorting([{ id: header.column.id, desc: false }]);
                              } else if (currentSortDir === "asc") {
                                table.setSorting([{ id: header.column.id, desc: true }]);
                              } else {
                                table.setSorting([]);
                              }
                            }}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === "asc" ? (
                              <ArrowUp className="ml-1 size-4" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDown className="ml-1 size-4" />
                            ) : (
                              <ArrowUpDown className="ml-1 size-4 opacity-50 group-hover:opacity-100" />
                            )}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column, colIndex) => (
                    <TableCell
                      className="h-14"
                      key={colIndex}
                      style={{ width: getColumnWidth(column) }}
                    >
                      <div className="bg-muted h-4 animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow data-state={row.getIsSelected() && "selected"} key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: getColumnWidth(cell.column.columnDef) }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={columns.length}>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <DataTablePagination meta={meta} table={table} />
    </div>
  );
}
