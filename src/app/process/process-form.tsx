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
import { useRouter } from "next/navigation";
import { useState } from "react";
interface ItemWithContext extends Item {
  context: Context;
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
    (item?.context?.id as string) || "",
  );
  const router = useRouter();
  const { removeItem } = useAppStore();

  const currentProject = projects.find((p) => p.id === item.projectId);
  const currentContext = contexts.find((c) => c.id === item.context?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;

    const contextIds = contextId ? [contextId] : [];

    await processItem(item.id as string, { status, projectId, contextIds });
    removeItem(item.id as string);
    router.refresh();
    router.push("/inbox");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{item.title as string}</CardTitle>
        {currentProject && (
          <div className="mt-2 text-sm text-muted-foreground">
            Current Project: {currentProject.title as string}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-lg">Details</Label>
            <div className="rounded-lg bg-muted p-4">
              <div className="mb-4">
                <span className="font-medium">Created:</span>{" "}
                {new Date(item.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Notes:</span>
                <p className="mt-1 whitespace-pre-wrap">
                  {(item.notes as string) || "No additional notes"}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-lg">Process as</Label>
            <RadioGroup onValueChange={setStatus} required value={status}>
              <div className="grid grid-cols-4 gap-4">
                <div className="rounded-lg border p-4">
                  <Label
                    htmlFor="next_action"
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value="NEXT_ACTION" id="next_action" />
                    <span>Next Action</span>
                  </Label>
                </div>
                <div className="rounded-lg border p-4">
                  <Label
                    htmlFor="project"
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value="PROJECT" id="project" />
                    <span>Project</span>
                  </Label>
                </div>
                <div className="rounded-lg border p-4">
                  <Label
                    htmlFor="someday_maybe"
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value="SOMEDAY_MAYBE" id="someday_maybe" />
                    <span>Someday/Maybe</span>
                  </Label>
                </div>
                <div className="rounded-lg border p-4">
                  <Label
                    htmlFor="reference"
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value="REFERENCE" id="reference" />
                    <span>Reference</span>
                  </Label>
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
            {currentContext && (
              <p className="text-sm text-muted-foreground">
                Current Context: {currentContext.name as string}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Process Item
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
