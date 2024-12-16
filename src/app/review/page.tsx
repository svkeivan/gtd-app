import { getReviewItems, getLastReviewDate } from "../../actions/reviews";
import { ReviewForm } from "./review-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ReviewPage() {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    redirect("/login");
  }

  const reviewItems = await getReviewItems(user.id);
  const lastReviewDate = await getLastReviewDate(user.id);

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Weekly Review</h1>
      {lastReviewDate && (
        <p className='mb-4'>
          Last review completed on: {lastReviewDate.toLocaleDateString()}
        </p>
      )}
      <ReviewForm
        userId={user.id}
        initialReviewItems={reviewItems}
      />
    </div>
  );
}
