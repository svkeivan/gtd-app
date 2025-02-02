import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tag, Search, Filter, Edit3, Trash2 } from "lucide-react";

export function TagsPageHint() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Quick Tips
        </CardTitle>
        <CardDescription>
          Make the most of your tag organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              Search and Filter
            </p>
            <p className="text-sm text-muted-foreground">
              Quickly find tags using the search bar or filter by usage
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Filter className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              Categories
            </p>
            <p className="text-sm text-muted-foreground">
              Group related tags together for better organization
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Edit3 className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              Quick Edit
            </p>
            <p className="text-sm text-muted-foreground">
              Double-click a tag to edit its name or color directly
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Trash2 className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              Bulk Actions
            </p>
            <p className="text-sm text-muted-foreground">
              Select multiple tags to edit or delete them together
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}