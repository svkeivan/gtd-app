'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSubscription } from "@/actions/subscription"

import { SubscriptionData } from "@/types/profile-types"

const DEFAULT_FEATURES = {
  projects: 'No projects',
  analytics: 'Not available',
  support: 'Not available',
  teamFeatures: 'Not available'
} as const;

// Extended type for client-side subscription data that always includes features
interface ClientSubscriptionData extends Omit<SubscriptionData, 'features'> {
  features: {
    projects: string;
    analytics: string;
    support: string;
    teamFeatures: string;
  }
}

const toClientSubscription = (data: SubscriptionData): ClientSubscriptionData => ({
  ...data,
  features: data.features ?? DEFAULT_FEATURES
});

interface SubscriptionInfoProps {
  userId: string;
  initialSubscription?: SubscriptionData | null;
}

function FeatureItem({ feature, value }: { feature: string, value: string }) {
  return (
    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
      <span className="text-sm font-medium">{feature}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  )
}

export function SubscriptionInfo({ userId, initialSubscription }: SubscriptionInfoProps) {
  const [subscription, setSubscription] = useState<ClientSubscriptionData | null>(() =>
    initialSubscription ? toClientSubscription(initialSubscription) : null
  );
  const [loading, setLoading] = useState(!initialSubscription)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const result = await getSubscription({ userId })
        if (result.error) {
          throw new Error(result.error)
        }
        if (result.data) {
          setSubscription(toClientSubscription(result.data))
        }
      } catch (err) {
        setError('Failed to load subscription information')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No subscription information available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Features</CardTitle>
            <CardDescription>Your available features and capabilities</CardDescription>
          </div>
          <Badge className="bg-green-500">ACTIVE</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h4 className="font-medium">Available Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureItem
              feature="Projects"
              value={subscription.features.projects}
            />
            <FeatureItem
              feature="Analytics"
              value={subscription.features.analytics}
            />
            <FeatureItem
              feature="Support"
              value={subscription.features.support}
            />
            <FeatureItem
              feature="Team Features"
              value={subscription.features.teamFeatures}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}