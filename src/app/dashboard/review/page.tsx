import { getLastReviewDate, getReviewItems } from "@/actions/reviews";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReviewForm } from "./review-form";

export default async function ReviewPage() {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    redirect("/login");
  }

  const reviewItems = await getReviewItems(user.id);
  const lastReviewDate = await getLastReviewDate(user.id);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Weekly Review</h1>
      {lastReviewDate && (
        <p className="mb-4">
          Last review completed on: {lastReviewDate.toLocaleDateString()}
        </p>
      )}
      <ReviewForm userId={user.id} initialReviewItems={reviewItems} />
    </div>
  );
}
