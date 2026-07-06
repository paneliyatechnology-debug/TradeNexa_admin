import type { SortOrder } from "@/types/api";

export function getColumnDefaultOrder<T extends string>(
  column: T,
  columns: { column: T; defaultOrder: SortOrder }[]
): SortOrder {
  return columns.find((item) => item.column === column)?.defaultOrder ?? "desc";
}

/** Cycle: default order → opposite → cleared (null). */
export function nextColumnSortState<T extends string>({
  column,
  sortBy,
  sortOrder,
  defaultOrder,
}: {
  column: T;
  sortBy: T | null;
  sortOrder: SortOrder;
  defaultOrder: SortOrder;
}): { sortBy: T | null; sortOrder: SortOrder } {
  if (sortBy !== column) {
    return { sortBy: column, sortOrder: defaultOrder };
  }

  if (sortOrder === defaultOrder) {
    return {
      sortBy: column,
      sortOrder: defaultOrder === "asc" ? "desc" : "asc",
    };
  }

  return { sortBy: null, sortOrder: defaultOrder };
}
