"use client";

import { CommentList } from "@/components/comments/comment-list";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface CommentsSectionProps {
  itemId: string;
}

export function CommentsSection({ itemId }: CommentsSectionProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="border-t p-6">
      <Collapsible open={showComments} onOpenChange={setShowComments}>
        <CollapsibleTrigger className="flex items-center gap-2 text-lg font-semibold transition-colors hover:text-primary">
          {showComments ? <ChevronUp /> : <ChevronDown />}
          Comments & Activity Log
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <CommentList itemId={itemId} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}