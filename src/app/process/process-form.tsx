"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { processItem } from "@/actions/items";

export function ProcessForm({
  item,
  projects,
  contexts,
}: {
  item: Record<string, unknown>;
  projects: Record<string, unknown>[];
  contexts: Record<string, unknown>[];
}) {
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");
  const [contextId, setContextId] = useState("");
  const router = useRouter();
  const { removeItem } = useAppStore();

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
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className='space-y-4'
        >
          <div>
            <p className='font-medium mb-2'>Notes:</p>
            <p>{item.notes || "No additional notes"}</p>
          </div>
          <RadioGroup
            onValueChange={setStatus}
            required
          >
            <div className='flex items-center space-x-2'>
              <RadioGroupItem
                value='NEXT_ACTION'
                id='next_action'
              />
              <Label htmlFor='next_action'>Next Action</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem
                value='PROJECT'
                id='project'
              />
              <Label htmlFor='project'>Project</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem
                value='SOMEDAY_MAYBE'
                id='someday_maybe'
              />
              <Label htmlFor='someday_maybe'>Someday/Maybe</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem
                value='REFERENCE'
                id='reference'
              />
              <Label htmlFor='reference'>Reference</Label>
            </div>
          </RadioGroup>
          {status === "PROJECT" && (
            <div>
              <Label htmlFor='project_select'>Project</Label>
              <Select
                value={projectId}
                onValueChange={setProjectId}
              >
                <SelectTrigger id='project_select'>
                  <SelectValue placeholder='Select a project' />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem
                      key={project.id as string}
                      value={project.id as string}
                    >
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor='context_select'>Context (optional)</Label>
            <Select
              value={contextId}
              onValueChange={setContextId}
            >
              <SelectTrigger id='context_select'>
                <SelectValue placeholder='Select a context' />
              </SelectTrigger>
              <SelectContent>
                {contexts.map((context) => (
                  <SelectItem
                    key={context.id as string}
                    value={context.id as string}
                  >
                    {context.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type='submit'>Process Item</Button>
        </form>
      </CardContent>
    </Card>
  );
}
