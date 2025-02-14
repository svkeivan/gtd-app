"use client";

import { getProject } from "@/actions/projects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getContexts } from "@/actions/contexts";
import { getProjects } from "@/actions/projects";
import { Context, Item, Project } from "@prisma/client";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { InboxForm } from "../../inbox/inbox-form";
import emitter from "@/lib/events";
import { ProjectHeader } from "./components/project-header";
import { ProjectStats } from "./components/project-stats";
import { ProjectProgress } from "./components/project-progress";
import { ProjectItemsHeader } from "./components/project-items-header";
import { ProjectItemsList } from "./components/project-items-list";

function TaskRefreshListener({ onNewTask }: { onNewTask: (projectId: string) => void }) {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const handleNewTask = (data: { projectId: string }) => {
      if (data.projectId === id) {
        onNewTask(data.projectId);
      }
    };

    emitter.on('newTask', handleNewTask);

    return () => {
      emitter.off('newTask', handleNewTask);
    };
  }, [id, onNewTask]);

  return null;
}

export default function ProjectPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [items, setItems] = useState<Item[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [project, setProject] = useState<Project>({
    id: "",
    title: "",
    status: "",
    userId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    description: null,
    parentId: null,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async (projectId: string) => {
    if (!projectId) return;

    try {
      const response = await getProject(projectId);
      if (!response) return;
      setProject(response);
      setItems(response.items || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchItems(id);
    }
  }, [id, fetchItems]);

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

  const handleNewTask = useCallback((projectId: string) => {
    if (projectId) {
      fetchItems(projectId);
    }
  }, [fetchItems]);

  if (!id) return null;

  return (
    <div>
      <div className="mb-8 space-y-6">
        <div className="rounded-xl bg-card p-8 shadow-lg transition-shadow hover:shadow-xl">
          <ProjectHeader
            project={project}
            onAddTask={() => setShowModal(true)}
            isLoading={isLoading}
          />
          <ProjectStats items={items} isLoading={isLoading} />
          <ProjectProgress items={items} isLoading={isLoading} />
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <InboxForm 
            projectId={id} 
            onSuccess={() => {
              // Just refetch the items, don't close the modal
              fetchItems(id);
            }}
          />
        </DialogContent>
      </Dialog>

      <ProjectItemsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        isLoading={isLoading}
      />

      <ProjectItemsList
        items={items}
        projects={projects}
        contexts={contexts}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        sortBy={sortBy}
        isLoading={isLoading}
      />

      <TaskRefreshListener onNewTask={handleNewTask} />
    </div>
  );
}
