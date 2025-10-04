import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table';
import { Skeleton } from './Skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './DropdownMenu';
import { Button } from './Button';
import { MoreVertical } from '../Icons';
import { cn } from '../../lib/utils';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T, value: any) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface TableAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (item: T) => void;
  className?: string;
  variant?: 'default' | 'destructive';
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowClassName?: string | ((item: T) => string);
  getItemKey: (item: T) => string | number;
}

/**
 * Generic data table component with actions, loading states, and customizable columns
 */
export function DataTable<T>({
  data,
  columns,
  actions,
  isLoading = false,
  emptyMessage = "Không có dữ liệu",
  className,
  rowClassName,
  getItemKey
}: DataTableProps<T>): React.ReactElement {
  const renderCellContent = (item: T, column: TableColumn<T>): React.ReactNode => {
    const value = typeof column.key === 'string' 
      ? (item as any)[column.key] 
      : item[column.key as keyof T];

    if (column.render) {
      return column.render(item, value);
    }

    return value;
  };

  const getRowClassName = (item: T): string => {
    if (typeof rowClassName === 'function') {
      return rowClassName(item);
    }
    return cn("hover:bg-gray-50", rowClassName);
  };

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {columns.map((column, index) => (
              <TableHead 
                key={index}
                className={cn("font-semibold text-gray-900", column.className)}
              >
                {column.header}
              </TableHead>
            ))}
            {actions && actions.length > 0 && (
              <TableHead className="font-semibold text-gray-900 w-12">
                Hành động
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                ))}
                {actions && actions.length > 0 && (
                  <TableCell>
                    <Skeleton className="h-5 w-8" />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length + (actions ? 1 : 0)} 
                className="text-center py-8 text-gray-500"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={getItemKey(item)} className={getRowClassName(item)}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} className={column.className}>
                    {renderCellContent(item, column)}
                  </TableCell>
                ))}
                {actions && actions.length > 0 && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action, actionIndex) => (
                          <DropdownMenuItem
                            key={actionIndex}
                            onClick={() => action.onClick(item)}
                            className={cn(
                              action.variant === 'destructive' && "text-red-600",
                              action.className
                            )}
                          >
                            {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
