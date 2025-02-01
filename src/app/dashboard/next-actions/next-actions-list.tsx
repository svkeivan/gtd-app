"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NextAction, useAppStore } from "@/lib/store";
import { ContextSummary, ProjectSummary } from "@/types/project-types";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { Filter, Search, SortAsc } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NextActionCard } from "./next-action-card";
import { updateItemsPriority } from "@/actions/items";

interface NextActionListProps {
  initialNextActions: NextAction[];
  projects: ProjectSummary[];
  contexts: ContextSummary[];
  userId: string;
}

export function NextActionsList({
  initialNextActions,
  projects,
  contexts,
  userId,
}: NextActionListProps) {
  const { nextActions, setNextActions, reorderNextActions } = useAppStore();
  const [filterProject, setFilterProject] = useState("all");
  const [filterContext, setFilterContext] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [groupBy, setGroupBy] = useState("none");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setNextActions(initialNextActions);
  }, [initialNextActions, setNextActions]);

  const filteredAndSortedActions = useMemo(() => {
    return nextActions
      .filter(
        (action) =>
          (filterProject === "all" || action.project?.id === filterProject) &&
          (filterContext === "all" ||
            action?.contexts?.some((c) => c.id === filterContext)) &&
          (searchTerm
            ? action.title.toLowerCase().includes(searchTerm.toLowerCase())
            : true),
      )
      .sort((a, b) => {
        switch (sortBy) {
          case "priority":
            return a.priority - b.priority;
          case "title":
            return a.title.localeCompare(b.title);
          case "dueDate":
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return (
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );
          default:
            return 0;
        }
      });
  }, [nextActions, filterProject, filterContext, sortBy, searchTerm]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(filteredAndSortedActions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderNextActions(
      items.map((item, index) => ({ ...item, priority: index })),
    );

    // Update priorities on the server
    try {
      await updateItemsPriority(items.map((item, index) => ({ id: item.id, priority: index })));
    } catch (error) {
      console.error("Error updating priorities:", error);
    }
  };

  const renderGroupedActions = (actions: NextAction[]) => {
    if (groupBy === "none") {
      return (
        <div className="space-y-4">
          {actions.map((action, index) => (
            <Draggable key={action.id} draggableId={action.id} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <NextActionCard action={action} />
                </div>
              )}
            </Draggable>
          ))}
        </div>
      );
    }

    const groups = actions.reduce(
      (acc: { [key: string]: NextAction[] }, action) => {
        let groupKey = "";
        switch (groupBy) {
          case "project":
            groupKey = action.project?.title || "No Project";
            break;
          case "context":
            if (!action.contexts?.length) {
              groupKey = "No Context";
            } else {
              action.contexts.forEach((context) => {
                const contextKey = context.name;
                if (!acc[contextKey]) acc[contextKey] = [];
                acc[contextKey].push(action);
              });
              return acc;
            }
            break;
          case "priority":
            const priority = action.priority || 0;
            groupKey =
              priority < 3
                ? "High Priority"
                : priority < 6
                  ? "Medium Priority"
                  : "Low Priority";
            break;
        }
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(action);
        return acc;
      },
      {},
    );

    return Object.entries(groups).map(([groupName, items]) => (
      <div key={groupName} className="mb-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-700">
          {groupName}
        </h3>
        <div className="space-y-4">
          {items.map((action, index) => (
            <Draggable key={action.id} draggableId={action.id} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <NextActionCard action={action} />
                </div>
              )}
            </Draggable>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div>
      <div className="mb-6 rounded-lg border bg-gray-50/50 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder="Search actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SortAsc className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 border-t pt-4 md:grid-cols-3">
          <div>
            <Label htmlFor="project-filter">Project</Label>
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger id="project-filter">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="context-filter">Context</Label>
            <Select value={filterContext} onValueChange={setFilterContext}>
              <SelectTrigger id="context-filter">
                <SelectValue placeholder="All Contexts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contexts</SelectItem>
                {contexts.map((context) => (
                  <SelectItem key={context.id} value={context.id}>
                    {context.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="group-by">Group by</Label>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger id="group-by">
                <SelectValue placeholder="No Grouping" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="context">Context</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="min-h-[200px]">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="next-actions">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {renderGroupedActions(filteredAndSortedActions)}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      {filteredAndSortedActions.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-lg font-medium text-gray-600">
            No next actions found
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterProject !== "all" || filterContext !== "all"
              ? "Try adjusting your filters"
              : "Add some next actions to get started"}
          </p>
        </div>
      )}
    </div>
  );
}
