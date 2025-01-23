"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { Item, Project } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProject, updateProject } from "../../actions/projects";

interface ProjectWithItems extends Project {
  items: Item[];
}

export function ProjectCard({ project }: { project: ProjectWithItems }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [status, setStatus] = useState(project.status);
  const router = useRouter();
  const { updateProject: updateProjectInStore, removeProject } = useAppStore();

  const handleUpdate = async () => {
    const updatedProject = await updateProject(project.id, { title, status });
    updateProjectInStore(updatedProject);
    setIsEditing(false);
    router.refresh();
  };

  const handleDelete = async () => {
    await deleteProject(project.id);
    removeProject(project.id);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          ) : (
            project.title
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          Status:{" "}
          {isEditing ? (
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            status
          )}
        </p>
        <p>Items: {project?.items?.length || 0}</p>
      </CardContent>
      <CardFooter className="justify-end space-x-2">
        {isEditing ? (
          <>
            <Button onClick={handleUpdate}>Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => router.push(`/projects/${project.id}`)}>
              Show Tasks
            </Button>
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
