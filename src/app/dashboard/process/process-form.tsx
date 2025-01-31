"use client";

import { processItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { Context, Item, Project } from "@prisma/client";
import { CalendarIcon, Loader2, NotebookIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ItemWithContext extends Item {
  contexts: Context[];
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
  const [status, setStatus] = useState((item.status as string) || "");
  const [projectId, setProjectId] = useState((item.projectId as string) || "");
  const [contextId, setContextId] = useState(
    (item.contexts[0]?.id as string) || "",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { removeItem } = useAppStore();

  const currentProject = projects.find((p) => p.id === item.projectId);

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
      await processItem(item.id as string, { status, projectId, contextIds });
      removeItem(item.id as string);
      router.refresh();
      router.push("/inbox");
    } catch (err) {
      setError(
        `Failed to process item: ${err instanceof Error ? err.message : "Please try again"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="border-b pb-6">
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
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Process as</Label>
              <span className="text-sm text-muted-foreground">
                Press key in (brackets) for quick selection
              </span>
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <RadioGroup onValueChange={setStatus} required value={status}>
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
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="project_select" className="text-lg">
                Project (optional)
              </Label>
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
              <Label htmlFor="context_select" className="text-lg">
                Context (optional)
              </Label>
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
    </Card>
  );
}
