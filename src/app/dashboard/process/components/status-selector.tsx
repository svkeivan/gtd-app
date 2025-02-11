"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ItemStatus } from "@prisma/client";

interface StatusSelectorProps {
  status: ItemStatus;
  error?: string;
  onStatusChange: (status: ItemStatus) => void;
}

export function StatusSelector({
  status,
  error,
  onStatusChange,
}: StatusSelectorProps) {
  return (
    <div className="space-y-4 rounded-lg bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">1. Process as</Label>
        <span className="text-sm text-muted-foreground">
          Press key in (brackets) for quick selection
        </span>
      </div>
      {error && <div className="text-sm text-destructive">{error}</div>}
      <RadioGroup
        onValueChange={(value) => onStatusChange(value as ItemStatus)}
        required
        value={status}
      >
        <div className="grid grid-cols-3 gap-4">
          <StatusOption
            value="NEXT_ACTION"
            label="Next Action"
            shortcut="N"
            description="Actionable task that can be done immediately"
            currentStatus={status}
          />
          <StatusOption
            value="PROJECT"
            label="Project"
            shortcut="P"
            description="Requires multiple steps to complete"
            currentStatus={status}
          />
          <StatusOption
            value="WAITING_FOR"
            label="Waiting For"
            shortcut="W"
            description="Delegated or awaiting external input"
            currentStatus={status}
          />
          <StatusOption
            value="SOMEDAY_MAYBE"
            label="Someday/Maybe"
            shortcut="S"
            description="Future consideration, not urgent"
            currentStatus={status}
          />
          <StatusOption
            value="REFERENCE"
            label="Reference"
            shortcut="R"
            description="Information to keep for future reference"
            currentStatus={status}
          />
          <StatusOption
            value="COMPLETED"
            label="Completed"
            shortcut="C"
            description="Task has been finished"
            currentStatus={status}
          />
        </div>
      </RadioGroup>
    </div>
  );
}

interface StatusOptionProps {
  value: ItemStatus;
  label: string;
  shortcut: string;
  description: string;
  currentStatus: ItemStatus;
}

function StatusOption({
  value,
  label,
  shortcut,
  description,
  currentStatus,
}: StatusOptionProps) {
  return (
    <div
      className={`rounded-lg border p-4 transition-all duration-200 hover:border-primary hover:bg-primary/5 ${
        currentStatus === value ? "border-primary bg-primary/10" : ""
      }`}
    >
      <Label htmlFor={value.toLowerCase()} className="flex items-center space-x-2">
        <RadioGroupItem value={value} id={value.toLowerCase()} />
        <span>
          {label}{" "}
          <span className="text-xs text-muted-foreground">({shortcut})</span>
        </span>
      </Label>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}