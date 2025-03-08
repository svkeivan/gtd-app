"use client";
import { inboxTr } from "@/lib/translations/inbox";

import { useAppStore } from "@/lib/store";
import { getContexts } from "@/actions/contexts";
import { getProjects } from "@/actions/projects";
import { useEffect, useState, useCallback } from "react";
import { ItemCard } from "./item-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ArrowDownAZ, 
  ArrowUpAZ, 
  Calendar, 
  Clock, 
  Flag, 
  Search, 
  SlidersHorizontal 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Context, Item, ItemStatus, Project } from "@prisma/client";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SortField = "title" | "createdAt" | "priority" | "dueDate" | "estimated";
type SortOrder = "asc" | "desc";

export function InboxList({ initialItems }: { initialItems: Item[] }) {
  const { items, setItems } = useAppStore();
  const [status, setStatus] = useState<"all" | ItemStatus>("INBOX");
  const [search, setSearch] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems, setItems]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, contextsData] = await Promise.all([
          getProjects(),
          getContexts(),
        ]);

        setProjects(projectsData);
        setContexts(contextsData);
      } catch (error) {
        console.error("Failed to load projects and contexts:", error);
      }
    };

    loadData();
  }, []);

  const statusValues = ["all", ...new Set(items.map((item) => item.status))] as const;

  const handleStatusChange = (value: string) => {
    setStatus(value as "all" | ItemStatus);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending order
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      // If all are selected, clear selection
      setSelectedItems(new Set());
    } else {
      // Otherwise select all filtered items
      const newSelected = new Set<string>();
      filteredItems.forEach(item => newSelected.add(item.id));
      setSelectedItems(newSelected);
    }
  };

  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Filter items based on status and search
  const filteredItems = items.filter((item) => {
    if (status === "all") return item.title.toLowerCase().includes(search.toLowerCase());
    return item.status === status && item.title.toLowerCase().includes(search.toLowerCase());
  });

  // Sort filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "priority":
        comparison = (Number(a.priority) || 0) - (Number(b.priority) || 0);
        break;
      case "dueDate":
        // Handle null values
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case "estimated":
        // Handle null values
        if (!a.estimated && !b.estimated) comparison = 0;
        else if (!a.estimated) comparison = 1;
        else if (!b.estimated) comparison = -1;
        else comparison = (a.estimated || 0) - (b.estimated || 0);
        break;
    }
    
    // Reverse for descending order
    return sortOrder === "desc" ? -comparison : comparison;
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{inboxTr['InboxItems'] || "Inbox Items"}</h2>
          <Badge variant="secondary" className="px-2.5 py-0.5">
            {items.length} {inboxTr['Items'] || "items"}
          </Badge>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={inboxTr['SearchItems'] || "Search items..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 sm:w-[200px]"
            />
          </div>
          
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={inboxTr['FilterByStatus'] || "Filter by status"} />
            </SelectTrigger>
            <SelectContent>
              {statusValues.map((statusValue) => (
                <SelectItem key={statusValue} value={statusValue}>
                  {statusValue === "all"
                    ? inboxTr['AllItems'] || "All Items"
                    : inboxTr.Status?.[statusValue] || statusValue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-4" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Sort by</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={sortField === "title" ? "default" : "outline"} 
                      size="sm"
                      className="justify-start"
                      onClick={() => handleSort("title")}
                    >
                      Title {getSortIcon("title")}
                    </Button>
                    <Button 
                      variant={sortField === "createdAt" ? "default" : "outline"} 
                      size="sm"
                      className="justify-start"
                      onClick={() => handleSort("createdAt")}
                    >
                      Date {getSortIcon("createdAt")}
                    </Button>
                    <Button 
                      variant={sortField === "priority" ? "default" : "outline"} 
                      size="sm"
                      className="justify-start"
                      onClick={() => handleSort("priority")}
                    >
                      Priority {getSortIcon("priority")}
                    </Button>
                    <Button 
                      variant={sortField === "dueDate" ? "default" : "outline"} 
                      size="sm"
                      className="justify-start"
                      onClick={() => handleSort("dueDate")}
                    >
                      Due Date {getSortIcon("dueDate")}
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {selectedItems.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-2">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
              onCheckedChange={toggleSelectAll}
              id="select-all"
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              {selectedItems.size} {inboxTr['ItemsSelected'] || "items selected"}
            </label>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {inboxTr['BatchActions'] || "Batch Actions"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{inboxTr['ChangeStatus'] || "Change Status"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.keys(inboxTr.Status).map((statusKey) => (
                  <DropdownMenuItem key={statusKey}>
                    {inboxTr.Status[statusKey as ItemStatus]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedItems.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <InboxIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium">
              {inboxTr['NoItemsFound'] || "No items found"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {inboxTr['TryChangingFilters'] || "Try changing your search or filters to find what you're looking for."}
            </p>
          </div>
        ) : (
          sortedItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              projects={projects}
              contexts={contexts}
              isSelected={selectedItems.has(item.id)}
              onToggleSelect={() => toggleItemSelection(item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Import at the top
import { InboxIcon } from "lucide-react";
