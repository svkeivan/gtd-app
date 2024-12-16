"use client";

import { useState, useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useAppStore } from "@/lib/store";
import { NextActionCard } from "./next-action-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Project {
  id: string;
  title: string;
}

interface Context {
  id: string;
  name: string;
}

interface NextActionListProps {
  initialNextActions: any[];
  projects: Project[];
  contexts: Context[];
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
  const [searchTerm, setSearchTerm] = useState("");

  useState(() => {
    setNextActions(initialNextActions);
  }, [initialNextActions, setNextActions]);

  const filteredAndSortedActions = useMemo(() => {
    return nextActions
      .filter(
        (action) =>
          (filterProject === "all" || action.project?.id === filterProject) &&
          (filterContext === "all" ||
            action.contexts.some((c) => c.id === filterContext)) &&
          (searchTerm
            ? action.title.toLowerCase().includes(searchTerm.toLowerCase())
            : true),
      )
      .sort((a, b) => {
        if (sortBy === "priority") {
          return a.priority - b.priority;
        } else if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        return 0;
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
      await fetch("/api/items/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item, index) => ({ id: item.id, priority: index })),
          userId,
        }),
      });
    } catch (error) {
      console.error("Error updating priorities:", error);
    }
  };

  return (
    <div>
      <div className='mb-4 grid gap-4 md:grid-cols-4'>
        <div>
          <Label htmlFor='search'>Search</Label>
          <Input
            id='search'
            type='text'
            placeholder='Search actions...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor='project-filter'>Filter by Project</Label>
          <Select
            value={filterProject}
            onValueChange={setFilterProject}
          >
            <SelectTrigger id='project-filter'>
              <SelectValue placeholder='All Projects' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem
                  key={project.id}
                  value={project.id}
                >
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor='context-filter'>Filter by Context</Label>
          <Select
            value={filterContext}
            onValueChange={setFilterContext}
          >
            <SelectTrigger id='context-filter'>
              <SelectValue placeholder='All Contexts' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Contexts</SelectItem>
              {contexts.map((context) => (
                <SelectItem
                  key={context.id}
                  value={context.id}
                >
                  {context.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor='sort-by'>Sort by</Label>
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger id='sort-by'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='priority'>Priority</SelectItem>
              <SelectItem value='title'>Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='next-actions'>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className='space-y-4'
            >
              {filteredAndSortedActions.map((action, index) => (
                <Draggable
                  key={action.id}
                  draggableId={action.id}
                  index={index}
                >
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
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {filteredAndSortedActions.length === 0 && (
        <p className='text-center text-gray-500 mt-4'>No next actions found.</p>
      )}
    </div>
  );
}
