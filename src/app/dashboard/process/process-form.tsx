"use client";

import { processItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Context, Item, ItemStatus, Project, Subtask, ChecklistItem } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProcessHeader } from "./components/process-header";
import { StatusSelector } from "./components/status-selector";
import { TaskDetails } from "./components/task-details";
import { ItemDescription } from "./components/item-description";
import { OrganizeSection } from "./components/organize-section";
import { CommentsSection } from "./components/comments-section";
import { addChecklistItem, addSubtask, removeChecklistItem, removeSubtask, updateChecklistItem } from "@/actions/items";

interface ItemWithContext extends Item {
  contexts: Context[];
  subtasks?: Array<Subtask & { task: Item }>;
  checklistItems?: ChecklistItem[];
}

export function ProcessForm({
  item,
  projects,
  contexts,
}: {
  item: ItemWithContext;
  projects: Project[];
  contexts: Context[];
}) {
  const [status, setStatus] = useState<ItemStatus>(
    (item.status as ItemStatus) || "INBOX",
  );
  const [projectId, setProjectId] = useState((item.projectId as string) || "");
  const [contextId, setContextId] = useState(
    (item.contexts[0]?.id as string) || "",
  );
  const [description, setDescription] = useState(item.notes || "");
  const [estimate, setEstimate] = useState(item.estimated?.toString() || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    item.dueDate ? new Date(item.dueDate) : undefined,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const currentProject = projects.find((p) => p.id === item.projectId);

  // Calculate progress
  useEffect(() => {
    let completed = 0;
    if (status) completed += 25;
    if (description) completed += 25;
    if (estimate) completed += 25;
    if (projectId || contextId) completed += 25;
    setProgress(completed);
  }, [status, description, estimate, projectId, contextId]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key) {
        case "n":
          setStatus("NEXT_ACTION");
          break;
        case "p":
          setStatus("PROJECT");
          break;
        case "w":
          setStatus("WAITING_FOR");
          break;
        case "s":
          setStatus("SOMEDAY_MAYBE");
          break;
        case "r":
          setStatus("REFERENCE");
          break;
        case "c":
          setStatus("COMPLETED");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) {
      setError("Please select how to process this item");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");
      const contextIds = contextId ? [contextId] : [];
      await processItem(item.id as string, {
        status,
        projectId,
        contextIds,
        notes: description,
        estimated: estimate ? parseInt(estimate) : undefined,
        dueDate,
      });
      // Clear form
      setStatus("INBOX");
      setProjectId("");
      setContextId("");
      setDescription("");
      setEstimate("");
      setDueDate(undefined);
      router.push("/dashboard/process");
    } catch (err) {
      setError(
        `Failed to process item: ${err instanceof Error ? err.message : "Please try again"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddSubtask = async (title: string) => {
    try {
      await addSubtask(item.id, { title });
      router.refresh();
    } catch (error) {
      console.error("Failed to add subtask:", error);
    }
  };

  const handleRemoveSubtask = async (subtaskId: string) => {
    try {
      await removeSubtask(item.id, subtaskId);
      router.refresh();
    } catch (error) {
      console.error("Failed to remove subtask:", error);
    }
  };

  const handleAddChecklistItem = async (title: string) => {
    try {
      await addChecklistItem(item.id, title);
      router.refresh();
    } catch (error) {
      console.error("Failed to add checklist item:", error);
    }
  };

  const handleToggleChecklistItem = async (id: string, completed: boolean) => {
    try {
      await updateChecklistItem(id, { completed });
      router.refresh();
    } catch (error) {
      console.error("Failed to update checklist item:", error);
    }
  };

  const handleRemoveChecklistItem = async (id: string) => {
    try {
      await removeChecklistItem(id);
      router.refresh();
    } catch (error) {
      console.error("Failed to remove checklist item:", error);
    }
  };

  return (
    <Card className="mx-auto max-w-4xl transition-all duration-200 hover:shadow-md">
      <ProcessHeader
        title={item.title}
        notes={item.notes}
        createdAt={item.createdAt}
        progress={progress}
        currentProject={currentProject}
      />
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <StatusSelector
            status={status}
            error={error}
            onStatusChange={setStatus}
          />
          
          <TaskDetails
            subtasks={item.subtasks || []}
            checklistItems={item.checklistItems || []}
            onAddSubtask={handleAddSubtask}
            onRemoveSubtask={handleRemoveSubtask}
            onAddChecklistItem={handleAddChecklistItem}
            onToggleChecklistItem={handleToggleChecklistItem}
            onRemoveChecklistItem={handleRemoveChecklistItem}
          />

          <div className="space-y-4 rounded-lg bg-muted/30 p-4">
            <ItemDescription
              description={description}
              estimate={estimate}
              dueDate={dueDate}
              onDescriptionChange={setDescription}
              onEstimateChange={setEstimate}
              onDueDateChange={setDueDate}
            />
          </div>

          <OrganizeSection
            projectId={projectId}
            contextId={contextId}
            projects={projects}
            contexts={contexts}
            onProjectChange={setProjectId}
            onContextChange={setContextId}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing || !status}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Process Item"
            )}
          </Button>
        </form>
      </CardContent>
      
      <CommentsSection itemId={item.id} />
    </Card>
  );
}
