import { getLastReviewDate, getReviewItems } from "@/actions/reviews"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ReviewForm } from "./review-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"

export default async function ReviewPage() {
  const { user } = await auth()

  if (!user || !user.isLoggedIn) {
    redirect("/login")
  }

  const reviewItems = await getReviewItems(user.id)
  const lastReviewDate = await getLastReviewDate(user.id)

  const daysSinceLastReview = lastReviewDate
    ? Math.floor((Date.now() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Weekly Review</h1>
        <p className="text-muted-foreground">
          A thorough review helps maintain clarity and control of your commitments
        </p>
      </div>

      {lastReviewDate && (
        <Card>
          <CardHeader className="flex flex-row items-center space-x-4 pb-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Review History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last review completed:</p>
                <p className="font-medium">
                  {lastReviewDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Days since last review:</p>
                <p className={`font-medium ${daysSinceLastReview && daysSinceLastReview > 7 ? "text-destructive" : ""}`}>
                  {daysSinceLastReview} {daysSinceLastReview === 1 ? "day" : "days"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <ReviewForm userId={user.id} initialReviewItems={reviewItems} />
        </div>
      </div>
    </div>
  )
}
