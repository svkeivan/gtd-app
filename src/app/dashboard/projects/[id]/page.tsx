"use client";

import { getProject } from "@/actions/projects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Item, Project } from "@prisma/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InboxForm } from "../../inbox/inbox-form";
import { ItemCard } from "../../inbox/item-card";

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

  useEffect(() => {
    const fetchItems = async () => {
      if (!params.id || typeof params.id !== "string") return;

      try {
        const response = await getProject(params.id);
        if (!response) return;
        setProject(response);
        setItems(response.items || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, [params.id]);

  return (
    <div>
      <div className="mb-8 space-y-6">
        <div className="rounded-xl bg-card p-8 shadow-lg transition-shadow hover:shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                {project?.title}
              </h1>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Created {project?.createdAt?.toLocaleDateString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  Status: {project?.status || "Active"}
                </span>
              </div>
              {project?.description && (
                <p className="mt-4 text-muted-foreground">{project.description}</p>
              )}
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Add Task
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-blue-500/10 p-6 shadow-sm transition-all hover:bg-blue-500/20 hover:shadow dark:bg-blue-500/5">
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                Total Items
              </h3>
              <p className="text-3xl font-bold text-blue-800 dark:text-blue-300">{items.length}</p>
            </div>
            <div className="rounded-xl bg-green-500/10 p-6 shadow-sm transition-all hover:bg-green-500/20 hover:shadow dark:bg-green-500/5">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                Completed Items
              </h3>
              <p className="text-3xl font-bold text-green-800 dark:text-green-300">
                {items.filter((item) => item.status === "COMPLETED").length}
              </p>
            </div>
            <div className="rounded-xl bg-purple-500/10 p-6 shadow-sm transition-all hover:bg-purple-500/20 hover:shadow dark:bg-purple-500/5">
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400">
                Completion Rate
              </h3>
              <p className="text-3xl font-bold text-purple-800 dark:text-purple-300">
                {items.length > 0
                  ? Math.round(
                      (items.filter((item) => item.status === "COMPLETED")
                        .length /
                        items.length) *
                        100,
                    )
                  : 0}
                %
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Overall Progress
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {items.length > 0
                  ? Math.round(
                      (items.filter((item) => item.status === "COMPLETED")
                        .length /
                        items.length) *
                        100,
                    )
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={
                items.length > 0
                  ? Math.round(
                      (items.filter((item) => item.status === "COMPLETED")
                        .length /
                        items.length) *
                        100,
                    )
                  : 0
              }
              className="h-2"
            />
          </div>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <InboxForm projectId={id} />
        </DialogContent>
      </Dialog>

      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Project Items</h2>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px]"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="NEXT_ACTION">Next Action</SelectItem>
                <SelectItem value="PROJECT">Project</SelectItem>
                <SelectItem value="WAITING_FOR">Waiting For</SelectItem>
                <SelectItem value="SOMEDAY_MAYBE">Someday/Maybe</SelectItem>
                <SelectItem value="REFERENCE">Reference</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div>
        {items.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-border">
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">No tasks yet</p>
              <p className="text-sm text-muted-foreground">
                Add your first task to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items
              .filter((item) =>
                statusFilter === "all" ? true : item.status === statusFilter,
              )
              .filter((item) =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .sort((a, b) => {
                switch (sortBy) {
                  case "newest":
                    return (
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                    );
                  case "oldest":
                    return (
                      new Date(a.createdAt).getTime() -
                      new Date(b.createdAt).getTime()
                    );
                  case "title":
                    return a.title.localeCompare(b.title);
                  case "title-desc":
                    return b.title.localeCompare(a.title);
                  default:
                    return 0;
                }
              })
              .map((item) => (
                <ItemCard item={item} key={item.id} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
