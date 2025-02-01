'use client';

import { Suspense } from 'react';
import Link from 'next/link';

function NotFoundContent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mb-8 text-gray-600">The page you're looking for doesn't exist.</p>
      <Link
        href="/"
        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Return Home
      </Link>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  );
}
