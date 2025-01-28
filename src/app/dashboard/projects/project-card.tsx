"use client";

import { deleteProject, updateProject } from "@/actions/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { Item, Project } from "@prisma/client";
import { ClipboardList, Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProjectWithItems extends Project {
  items?: Item[];
}

const statusColors = {
  ACTIVE: "bg-green-500",
  COMPLETED: "bg-blue-500",
  ON_HOLD: "bg-yellow-500",
};

const statusLabels = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
};

export function ProjectCard({ project }: { project: ProjectWithItems }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || "");
  const [status, setStatus] = useState(project.status);
  const router = useRouter();
  const { updateProject: updateProjectInStore, removeProject } = useAppStore();

  const handleUpdate = async () => {
    const updatedProject = await updateProject(project.id, {
      title,
      description,
      status,
    });
    updateProjectInStore(updatedProject);
    setIsEditing(false);
    router.refresh();
  };

  const handleDelete = async () => {
    await deleteProject(project.id);
    removeProject(project.id);
    router.refresh();
  };

  const completedItems =
    project?.items?.filter((item) => item.status === "COMPLETED").length || 0;
  const totalItems = project?.items?.length || 0;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <Card className="transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold"
                placeholder="Project title"
              />
            ) : (
              <CardTitle className="text-lg font-semibold">
                {project.title}
              </CardTitle>
            )}
            <Badge
              variant="secondary"
              className={`${statusColors[status as keyof typeof statusColors]}`}
            >
              {statusLabels[status as keyof typeof statusLabels]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description"
              className="mt-2"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </>
        ) : (
          <>
            {project.description && (
              <p className="text-sm text-gray-600">{project.description}</p>
            )}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-600">
                {completedItems} of {totalItems} tasks completed
              </p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="justify-end space-x-2">
        {isEditing ? (
          <>
            <Button onClick={handleUpdate} variant="default">
              Save
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push(`/dashboard/projects/${project.id}`)}
            >
              <ClipboardList className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
