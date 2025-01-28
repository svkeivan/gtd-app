"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { createContext } from "@/actions/contexts";

export function ContextForm({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const router = useRouter();
  const addContext = useAppStore((state) => state.addContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newContext = await createContext({ name, userId });
    addContext({ ...newContext, items: [] });
    setName("");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-4 mb-8'
    >
      <Input
        type='text'
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder='Enter a new context name'
        required
      />
      <Button type='submit'>Create Context</Button>
    </form>
  );
}
