import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  language: z.enum(['en', 'es', 'fr', 'de']),
  theme: z.enum(['light', 'dark', 'system']),
  timezone: z.string(),
  avatar: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function ProfileSetupForm() {
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [originalData, setOriginalData] = useState<ProfileFormData | null>(null)
  
  const form = useForm<ProfileFormData>({
    mode: 'onChange', // Enable real-time validation
    resolver: zodResolver(profileSchema),
    defaultValues: {
      language: 'en',
      theme: 'system',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  })

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (!response.ok) throw new Error('Failed to fetch profile')
        
        const data = await response.json()
        const initialData = {
          name: data.name || '',
          language: data.language || 'en',
          theme: data.theme || 'system',
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          avatar: data.avatar || '',
        }
        setOriginalData(initialData)
        form.reset(initialData)
        
        // Update progress based on fetched data
        const values = form.getValues()
        const totalFields = Object.keys(profileSchema.shape).length
        const completedFields = Object.entries(values).filter(([_, value]) => value).length
        setProgress((completedFields / totalFields) * 100)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [form])

  // Calculate form completion progress
  useEffect(() => {
    const values = form.getValues()
    const totalFields = Object.keys(profileSchema.shape).length
    const completedFields = Object.entries(values).filter(([_, value]) => value).length
    setProgress((completedFields / totalFields) * 100)
  }, [form.watch()])

  const handleCancel = () => {
    if (originalData) {
      form.reset(originalData)
      setError(null)
      setSuccess(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true)
      setError(null)
      
      // Optimistically update the form state
      const previousData = form.getValues()
      form.reset(data)
      
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const result = await response.json()
      setOriginalData(data)
      setSuccess(true)
      setError(null)
    } catch (err) {
      // Revert to previous state on error
      form.reset(originalData || {})
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSuccess(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Enter your name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              onValueChange={(value) => form.setValue('language', value as any)}
              defaultValue={form.getValues('language')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              onValueChange={(value) => form.setValue('theme', value as any)}
              defaultValue={form.getValues('theme')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input
              value={form.getValues('timezone')}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">Automatically detected from your browser</p>
          </div>

          <div className="space-y-2">
            <Label>Profile Completion</Label>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50">
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!form.formState.isDirty || !form.formState.isValid || isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={!form.formState.isDirty || isSaving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
