"use client";

import { getItemComments } from "@/actions/items";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CommentType } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { ActivityIcon, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { CommentForm } from "./comment-form";

interface Comment {
  id: string;
  content: string;
  type: CommentType;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

export function CommentList({ itemId }: { itemId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadComments = async () => {
    try {
      const fetchedComments = await getItemComments(itemId);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [itemId]);

  const onCommentAdded = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  const getCommentIcon = (type: CommentType) => {
    switch (type) {
      case "COMMENT":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <ActivityIcon className="h-4 w-4" />;
    }
  };

  const getCommentClass = (type: CommentType) => {
    switch (type) {
      case "COMMENT":
        return "bg-card";
      case "STATUS_CHANGE":
        return "bg-blue-500/10";
      case "PRIORITY_CHANGE":
        return "bg-yellow-500/10";
      case "ESTIMATE_CHANGE":
        return "bg-green-500/10";
      case "DEPENDENCY_ADDED":
      case "DEPENDENCY_REMOVED":
        return "bg-purple-500/10";
      default:
        return "bg-card";
    }
  };

  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      <CommentForm itemId={itemId} onCommentAdded={onCommentAdded} />
      
      <Card className="p-4">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`rounded-lg p-4 ${getCommentClass(comment.type)}`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {comment.user.name?.[0] || comment.user.email[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {comment.user.name || comment.user.email}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  {getCommentIcon(comment.type)}
                </div>
                <div className="ml-8 text-sm">
                  {comment.type === "COMMENT" ? (
                    <ReactMarkdown className="prose prose-sm dark:prose-invert">
                      {comment.content}
                    </ReactMarkdown>
                  ) : (
                    <span className="text-muted-foreground">
                      {comment.content}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
