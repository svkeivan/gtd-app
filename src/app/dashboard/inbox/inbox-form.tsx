"use client";
import { inboxTr } from "@/lib/translations/inbox";

import { createItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PriorityLevel } from "@prisma/client";
import { cn } from "@/lib/utils";
import { 
  AlertCircle, 
  BrainCircuit, 
  Clock, 
  Flag, 
  Lightbulb, 
  Mic, 
  Plus, 
  Sparkles 
} from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

export function InboxForm({ projectId }: { projectId?: string }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("MEDIUM");
  const [estimated, setEstimated] = useState<number>(30);
  const [requiresFocus, setRequiresFocus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const addItem = useAppStore((state) => state.addItem);

  // Focus the title input on mount
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  const handleEstimatedChange = (value: number[]) => {
    // Slider returns an array, we take the first value
    setEstimated(value[0]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit form on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const form = e.currentTarget.closest('form');
      if (form) {
        e.preventDefault();
        form.requestSubmit();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      const newItem = await createItem({ 
        title, 
        notes, 
        projectId,
        priority,
        estimated,
        requiresFocus
      });
      
      addItem(newItem);
      setTitle("");
      setNotes("");
      setPriority("MEDIUM");
      setEstimated(30);
      setRequiresFocus(false);
      
      // Show success toast
      toast({
        title: inboxTr['ItemCaptured'] || "Item captured",
        description: inboxTr['ItemAddedToInbox'] || "Your item has been added to your inbox",
        duration: 3000,
      });
      
      // Focus back on title input for quick consecutive captures
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
      
      router.refresh();
    } catch (error) {
      console.error("Failed to create item:", error);
      toast({
        title: inboxTr['Error'] || "Error",
        description: inboxTr['FailedToCreateItem'] || "Failed to create item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: PriorityLevel) => {
    switch (priority) {
      case "LOW": return "bg-slate-400";
      case "MEDIUM": return "bg-blue-500";
      case "HIGH": return "bg-yellow-500";
      case "URGENT": return "bg-red-500";
      default: return "bg-blue-500";
    }
  };

  const getEstimatedTimeLabel = () => {
    if (estimated < 60) {
      return `${estimated} ${inboxTr['Minutes'] || "minutes"}`;
    } else {
      const hours = Math.floor(estimated / 60);
      const minutes = estimated % 60;
      if (minutes === 0) {
        return `${hours} ${hours === 1 ? (inboxTr['Hour'] || "hour") : (inboxTr['Hours'] || "hours")}`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-4"
      onKeyDown={handleKeyDown}
    >
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            {inboxTr['AddNewItem'] || 'Add New Item'}
          </h2>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{inboxTr['VoiceCapture'] || "Voice capture"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                  >
                    <BrainCircuit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{inboxTr['GenerateIdeas'] || "Generate ideas"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="grid gap-4">
          <div className="relative">
            <Input
              ref={titleInputRef}
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={inboxTr['WhatsOnYourMind'] || "What's on your mind? (e.g., 'Call dentist', 'Buy groceries')"}
              required
              className="h-12 text-lg pr-20"
              disabled={isSubmitting}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Badge 
                variant="outline" 
                className={cn("flex items-center gap-1", getPriorityColor(priority))}
              >
                <Flag className="h-3 w-3 text-white" />
                <span className="text-white">{priority}</span>
              </Badge>
            </div>
          </div>
          
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={inboxTr['AddAdditionalDetails'] || "Add any additional details, context, or thoughts... (optional)"}
                  rows={3}
                  className="resize-none"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="priority" className="flex items-center gap-1">
                      <Flag className="h-4 w-4 text-muted-foreground" />
                      {inboxTr['PriorityLevel'] || "Priority Level"}
                    </Label>
                  </div>
                  <Select 
                    value={priority} 
                    onValueChange={(value: PriorityLevel) => setPriority(value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={inboxTr['SelectPriority'] || "Select priority"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">
                        <div className="flex items-center">
                          <span className={cn("inline-block w-2 h-2 rounded-full mr-2 bg-slate-400")} />
                          {inboxTr['Low'] || "Low"}
                        </div>
                      </SelectItem>
                      <SelectItem value="MEDIUM">
                        <div className="flex items-center">
                          <span className={cn("inline-block w-2 h-2 rounded-full mr-2 bg-blue-500")} />
                          {inboxTr['Medium'] || "Medium"}
                        </div>
                      </SelectItem>
                      <SelectItem value="HIGH">
                        <div className="flex items-center">
                          <span className={cn("inline-block w-2 h-2 rounded-full mr-2 bg-yellow-500")} />
                          {inboxTr['High'] || "High"}
                        </div>
                      </SelectItem>
                      <SelectItem value="URGENT">
                        <div className="flex items-center">
                          <span className={cn("inline-block w-2 h-2 rounded-full mr-2 bg-red-500")} />
                          {inboxTr['Urgent'] || "Urgent"}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="estimated" className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {inboxTr['EstimatedTimeMinutes'] || "Estimated Time"}
                    </Label>
                    <span className="text-sm font-medium">
                      {getEstimatedTimeLabel()}
                    </span>
                  </div>
                  <Slider
                    id="estimated"
                    value={[estimated]}
                    min={5}
                    max={480}
                    step={5}
                    onValueChange={handleEstimatedChange}
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5m</span>
                    <span>1h</span>
                    <span>2h</span>
                    <span>4h</span>
                    <span>8h</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="focus-mode"
                    checked={requiresFocus}
                    onCheckedChange={setRequiresFocus}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="focus-mode" className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      {inboxTr['RequiresFocusMode'] || "Requires Focus Mode"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {inboxTr['EnableForTasksThatNeedConcentratedAttention'] || "Enable for tasks that need concentrated attention"}
                    </p>
                  </Label>
                </div>
              </div>
            </CollapsibleContent>
            
            {!isExpanded && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="mt-2 w-full justify-start text-muted-foreground"
                onClick={() => setIsExpanded(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {inboxTr['ShowMoreOptions'] || "Show more options"}
              </Button>
            )}
          </Collapsible>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg" 
              className="px-8 gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {inboxTr['Capturing'] || "Capturing..."}
                </div>
              ) : (
                <>
                  {inboxTr['Capture'] || "Capture"}
                  <kbd className="pointer-events-none ml-1 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">⌘</span>Enter
                  </kbd>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
