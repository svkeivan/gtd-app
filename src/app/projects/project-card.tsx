"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProject, deleteProject } from "../../actions/projects";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";

export function ProjectCard({ project }: { project: any }) {
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
              className='mt-1'
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
            <Select
              value={status}
              onValueChange={setStatus}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ACTIVE'>Active</SelectItem>
                <SelectItem value='COMPLETED'>Completed</SelectItem>
                <SelectItem value='ON_HOLD'>On Hold</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            status
          )}
        </p>
        <p>Items: {project.items.length}</p>
      </CardContent>
      <CardFooter className='justify-end space-x-2'>
        {isEditing ? (
          <>
            <Button onClick={handleUpdate}>Save</Button>
            <Button
              variant='outline'
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
            >
              Delete
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
