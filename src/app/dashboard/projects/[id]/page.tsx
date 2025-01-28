"use client";

import { getProject } from "@/actions/projects";
import { InboxForm } from "@/app/inbox/inbox-form";
import { ItemCard } from "@/app/inbox/item-card";
import { Item, Project } from "@prisma/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProjectPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [items, setItems] = useState<Item[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [project, setProject] = useState<Project>({
    id: "",
    title: "",
    status: "",
    userId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
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
      <div className="mb-8 rounded-xl bg-white p-8 shadow-lg transition-shadow hover:shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-800">
            {project?.title}{" "}
            <span className="text-sm font-normal text-gray-500">
              {project?.createdAt?.toLocaleDateString()}
            </span>
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Add Task
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-blue-50 p-6 shadow-sm transition-all hover:bg-blue-100 hover:shadow">
            <h3 className="text-lg font-semibold text-blue-700">Total Items</h3>
            <p className="text-3xl font-bold text-blue-800">{items.length}</p>
          </div>
          <div className="rounded-xl bg-green-50 p-6 shadow-sm transition-all hover:bg-green-100 hover:shadow">
            <h3 className="text-lg font-semibold text-green-700">
              Completed Items
            </h3>
            <p className="text-3xl font-bold text-green-800">
              {items.filter((item) => item.status === "completed").length}
            </p>
          </div>
          <div className="rounded-xl bg-purple-50 p-6 shadow-sm transition-all hover:bg-purple-100 hover:shadow">
            <h3 className="text-lg font-semibold text-purple-700">
              Completion Rate
            </h3>
            <p className="text-3xl font-bold text-purple-800">
              {items.length > 0
                ? Math.round(
                    (items.filter((item) => item.status === "completed")
                      .length /
                      items.length) *
                      100,
                  )
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-xl bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Add New Task</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <InboxForm projectId={id} />
          </div>
        </div>
      )}

      <h1 className="mb-6 text-3xl font-bold text-gray-800">Project Items</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <ItemCard item={item} key={item.id} />
        ))}
      </div>
    </div>
  );
}
