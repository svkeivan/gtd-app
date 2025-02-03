'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { SubscriptionData } from "@/types/profile-types"
import { SubscriptionService } from "@/lib/subscription"

export function SubscriptionInfo() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await SubscriptionService.getSubscription(window.__NEXT_DATA__.props.pageProps.userId)
        if (data) {
          setSubscription({
            plan: data.plan,
            status: data.status,
            trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null,
            currentPeriodEnd: new Date(data.currentPeriodEnd),
            cancelAtPeriodEnd: data.cancelAtPeriodEnd,
          })
        }
      } catch (err) {
        setError('Failed to load subscription information')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

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
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500'
      case 'TRIALING':
        return 'bg-blue-500'
      case 'PAST_DUE':
        return 'bg-yellow-500'
      case 'CANCELED':
      case 'UNPAID':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const getTrialProgress = () => {
    if (!subscription.trialEndsAt) return 100
    const start = new Date(subscription.currentPeriodEnd)
    start.setDate(start.getDate() - 15) // 15-day trial
    const now = new Date()
    const total = subscription.trialEndsAt.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </div>
          <Badge className={getStatusColor(subscription.status)}>
            {subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{subscription.plan} Plan</h3>
            <Button variant="outline" asChild>
              <a href="/dashboard/profile/billing">Manage Billing</a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Next billing date: {formatDate(subscription.currentPeriodEnd)}
          </p>
        </div>

        {subscription.status === 'TRIALING' && subscription.trialEndsAt && (
          <div className="space-y-2">
            <h4 className="font-medium">Trial Period</h4>
            <Progress value={getTrialProgress()} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Trial ends on {formatDate(subscription.trialEndsAt)}
            </p>
          </div>
        )}

        {subscription.cancelAtPeriodEnd && (
          <Alert>
            <AlertDescription>
              Your subscription will be canceled at the end of the current period.
              You can continue to use all features until {formatDate(subscription.currentPeriodEnd)}.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureItem
              feature="Projects"
              value={subscription.plan === 'FREE' ? '3 projects' : 
                     subscription.plan === 'PERSONAL' ? '10 projects' : 
                     'Unlimited projects'}
            />
            <FeatureItem
              feature="Analytics"
              value={subscription.plan === 'FREE' ? 'Basic' :
                     subscription.plan === 'PERSONAL' ? 'Full' :
                     'Advanced'}
            />
            <FeatureItem
              feature="Support"
              value={subscription.plan === 'FREE' ? 'Community' :
                     subscription.plan === 'ENTERPRISE' ? 'Dedicated' :
                     'Priority'}
            />
            <FeatureItem
              feature="Team Features"
              value={subscription.plan === 'PROFESSIONAL' || subscription.plan === 'ENTERPRISE' ? 'Included' : 'Not available'}
            />
          </div>
        </div>

        {subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd && (
          <div className="pt-4">
            <Button variant="outline" className="w-full" onClick={async () => {
              try {
                await SubscriptionService.cancelSubscription(window.__NEXT_DATA__.props.pageProps.userId)
                setSubscription(prev => prev ? {
                  ...prev,
                  cancelAtPeriodEnd: true
                } : null)
              } catch (err) {
                setError('Failed to cancel subscription')
              }
            }}>
              Cancel Subscription
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FeatureItem({ feature, value }: { feature: string, value: string }) {
  return (
    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
      <span className="text-sm font-medium">{feature}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  )
}