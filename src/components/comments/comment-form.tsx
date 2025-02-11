"use client";

import { addComment } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface CommentFormProps {
  itemId: string;
  onCommentAdded: (comment: any) => void;
}

export function CommentForm({ itemId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const comment = await addComment(itemId, content);
      onCommentAdded(comment);
      setContent("");
    } catch (err) {
      setError(
        `Failed to add comment: ${err instanceof Error ? err.message : "Please try again"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="comment">Add a comment</Label>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Tabs defaultValue="write">
            <TabsList className="mb-4">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="write">
              <Textarea
                id="comment"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your comment here... (Markdown supported)"
                className="min-h-[100px]"
              />
            </TabsContent>
            <TabsContent value="preview">
              <Card className="min-h-[100px] p-4">
                {content ? (
                  <ReactMarkdown className="prose prose-sm dark:prose-invert">
                    {content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nothing to preview
                  </p>
                )}
              </Card>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding comment..." : "Add comment"}
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
}
