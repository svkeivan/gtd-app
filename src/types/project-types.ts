export type Project = {
  id: string;
  title: string;
  status: "ACTIVE" | "ARCHIVED" | "DELETED";
  userId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  items: any[];
};
