"use client";

import { addChecklistItem, addSubtask, processItem, removeChecklistItem, removeSubtask, updateChecklistItem } from "@/actions/items";
import { CommentList } from "@/components/comments/comment-list";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Context, Item, ItemStatus, Project, Subtask, ChecklistItem } from "@prisma/client";
import { format } from "date-fns";
import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
  NotebookIcon,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [showComments, setShowComments] = useState(false);
  const [progress, setProgress] = useState(0);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const router = useRouter();

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      await addSubtask(item.id, { title: newSubtaskTitle });
      setNewSubtaskTitle("");
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

  const handleAddChecklistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;

    try {
      await addChecklistItem(item.id, newChecklistItem);
      setNewChecklistItem("");
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

  return (
    <Card className="mx-auto max-w-4xl transition-all duration-200 hover:shadow-md">
      <CardHeader className="space-y-4 border-b pb-6">
        <Progress value={progress} className="h-2" />

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              {item.title as string}
            </CardTitle>
            {item.notes && (
              <p className="max-w-2xl whitespace-pre-wrap text-muted-foreground">
                {item.notes as string}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
            {currentProject && (
              <div className="flex items-center gap-1">
                <NotebookIcon className="h-4 w-4" />
                {currentProject.title}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 rounded-lg bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">1. Process as</Label>
              <span className="text-sm text-muted-foreground">
                Press key in (brackets) for quick selection
              </span>
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <RadioGroup
              onValueChange={(value) => setStatus(value as ItemStatus)}
              required
              value={status}
            >
              <div className="grid grid-cols-3 gap-4">
                <div
                  className={`rounded-lg border p-4 transition-all duration-200 hover:border-primary hover:bg-primary/5 ${
                    status === "NEXT_ACTION"
                      ? "border-primary bg-primary/10"
                      : ""
                  }`}
                >
                  <Label
                    htmlFor="next_action"
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value="NEXT_ACTION" id="next_action" />
                    <span>
                      Next Action{" "}
                      <span className="text-xs text-muted-foreground">(N)</span>
                    </span>
                  </Label>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Actionable task that can be done immediately
                  </p>
                </div>
                <div
                  className={`rounded-lg border p-4 transition-all duration-200 hover:border-primary hover:bg-primary/5 ${
                    status === "PROJECT" ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  <Label
                    htmlFor="project"
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value="PROJECT" id="project" />
                    <span>
                      Project{" "}
                      <span className="text-xs text-muted-foreground">(P)</span>
                    </span>
                  </Label>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Requires multiple steps to complete
                  </p>
                </div>
                <div
                  className={`rounded-lg border p-4 transition-all duration-200 hover:border-primary hover:bg-primary/5 ${
                    status === "WAITING_FOR"
                      ? "border-primary bg-primary/10"
                      : ""
                  }`}
                >
                  <Label
                    htmlFor="waiting_for"
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value="WAITING_FOR" id="waiting_for" />
                    <span>
                      Waiting For{" "}
                      <span className="text-xs text-muted-foreground">(W)</span>
                    </span>
                  </Label>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Delegated or awaiting external input
                  </p>
                </div>
                <div
                  className={`rounded-lg border p-4 transition-all duration-200 hover:border-primary hover:bg-primary/5 ${
                    status === "SOMEDAY_MAYBE"
                      ? "border-primary bg-primary/10"
                      : ""
                  }`}
                >
                  <Label
                    htmlFor="someday_maybe"
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value="SOMEDAY_MAYBE" id="someday_maybe" />
                    <span>
                      Someday/Maybe{" "}
                      <span className="text-xs text-muted-foreground">(S)</span>
                    </span>
                  </Label>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Future consideration, not urgent
                  </p>
                </div>
                <div
                  className={`rounded-lg border p-4 transition-all duration-200 hover:border-primary hover:bg-primary/5 ${
                    status === "REFERENCE" ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  <Label
                    htmlFor="reference"
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value="REFERENCE" id="reference" />
                    <span>
                      Reference{" "}
                      <span className="text-xs text-muted-foreground">(R)</span>
                    </span>
                  </Label>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Information to keep for future reference
                  </p>
                </div>
                <div
                  className={`rounded-lg border p-4 transition-all duration-200 hover:border-primary hover:bg-primary/5 ${
                    status === "COMPLETED" ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  <Label
                    htmlFor="completed"
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value="COMPLETED" id="completed" />
                    <span>
                      Completed{" "}
                      <span className="text-xs text-muted-foreground">(C)</span>
                    </span>
                  </Label>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Task has been finished
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-4 rounded-lg bg-muted/30 p-4">
            <Label className="text-lg font-semibold">2. Add Details & Tasks</Label>
            
            {/* Subtasks Section */}
            <div className="space-y-2">
              <Label className="text-lg">Subtasks</Label>
              {item.subtasks?.map((subtask) => (
                <div key={subtask.taskId} className="flex items-center gap-2">
                  <Input
                    value={subtask.task.title}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSubtask(subtask.taskId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <form onSubmit={handleAddSubtask} className="flex gap-2">
                <Input
                  placeholder="Add a subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="outline">
                  Add
                </Button>
              </form>
            </div>

            {/* Checklist Section */}
            <div className="space-y-2">
              <Label className="text-lg">Checklist</Label>
              {item.checklistItems?.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) =>
                      handleToggleChecklistItem(item.id, checked as boolean)
                    }
                  />
                  <Input
                    value={item.title}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                <Input
                  placeholder="Add a checklist item..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="outline">
                  Add
                </Button>
              </form>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-lg">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Add more details about this task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="estimate" className="text-lg">
                  Time Estimate (minutes)
                </Label>
                <Input
                  id="estimate"
                  type="number"
                  placeholder="e.g. 30"
                  value={estimate}
                  onChange={(e) => setEstimate(e.target.value)}
                />
              </div>

              <div className="flex-1 space-y-2">
                <Label className="text-lg">Due Date (optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !dueDate && "text-muted-foreground"
                      }`}
                    >
                      {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-lg bg-muted/30 p-4">
            <Label className="mb-4 block text-lg font-semibold">
              3. Organize
            </Label>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="project_select" className="text-lg">
                    Project (optional)
                  </Label>
                  <a
                    href="/dashboard/projects"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    + Create Project
                  </a>
                </div>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger id="project_select">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem
                        key={project.id as string}
                        value={project.id as string}
                      >
                        {project.title as string}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="context_select" className="text-lg">
                    Context (optional)
                  </Label>
                  <a
                    href="/dashboard/contexts"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    + Create Context
                  </a>
                </div>
                <Select value={contextId} onValueChange={setContextId}>
                  <SelectTrigger id="context_select">
                    <SelectValue placeholder="Select a context" />
                  </SelectTrigger>
                  <SelectContent>
                    {contexts.map((context) => (
                      <SelectItem
                        key={context.id as string}
                        value={context.id as string}
                      >
                        {context.name as string}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
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
      <div className="border-t p-6">
        <Collapsible open={showComments} onOpenChange={setShowComments}>
          <CollapsibleTrigger className="flex items-center gap-2 text-lg font-semibold transition-colors hover:text-primary">
            {showComments ? <ChevronUp /> : <ChevronDown />}
            Comments & Activity Log
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <CommentList itemId={item.id as string} />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}
