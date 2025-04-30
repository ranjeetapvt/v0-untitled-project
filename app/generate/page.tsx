"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { ProgressIndicator } from "@/components/progress-indicator"
import { TripDetailsForm } from "@/components/trip-details-form"
import { TravelersForm } from "@/components/travelers-form"
import { BudgetForm } from "@/components/budget-form"
import { TripStyleForm } from "@/components/trip-style-form"
import { FoodPreferencesForm } from "@/components/food-preferences-form"
import { ExtrasForm } from "@/components/extras-form"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/firebase/auth-context"

export default function GenerateItinerary() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useAuth()
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    arrivalMode: "",
    departureMode: "",
    arrivalTime: "",
    departureTime: "",
    travelersCount: 2,
    travelGroupType: "Couple",
    budgetType: "Moderate",
    tripStyles: [],
    pace: "Balanced",
    wakeUpTime: "Mid",
    cuisinePreferences: [],
    specialRequests: "",
    accessibilityRequirements: "",
    additionalOptions: {
      familyFriendly: false,
      offBeatenPath: false,
      sustainable: false,
    },
  })

  useEffect(() => {
    // If not logged in and not loading, redirect to sign in
    if (!loading && !user) {
      router.push("/signin")
    }
  }, [user, loading, router])

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData({ ...formData, ...data })
  }

  const nextStep = () => {
    if (step < 6) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    } else {
      generateItinerary()
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo(0, 0)
    }
  }

  const generateItinerary = async () => {
    // Validate form data
    if (!formData.destination) {
      toast({
        title: "Missing destination",
        description: "Please enter a destination for your trip.",
        variant: "destructive",
      })
      setStep(1)
      return
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Missing dates",
        description: "Please select start and end dates for your trip.",
        variant: "destructive",
      })
      setStep(1)
      return
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate an itinerary.",
        variant: "destructive",
      })
      router.push("/signin")
      return
    }

    try {
      setIsGenerating(true)

      // Get the user's ID token for authentication
      const idToken = await user.getIdToken()

      // Call the API to generate the itinerary
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate itinerary")
      }

      const data = await response.json()

      // Redirect to the itinerary page
      router.push(`/itinerary/${data.itineraryId}`)
    } catch (error) {
      console.error("Error generating itinerary:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate itinerary. Please try again.",
        variant: "destructive",
      })
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Generate Your Itinerary</h1>

        <ProgressIndicator currentStep={step} />

        <div className="mt-8 rounded-lg border p-6 shadow-sm">
          {step === 1 && <TripDetailsForm formData={formData} updateFormData={updateFormData} />}
          {step === 2 && <TravelersForm formData={formData} updateFormData={updateFormData} />}
          {step === 3 && <BudgetForm formData={formData} updateFormData={updateFormData} />}
          {step === 4 && <TripStyleForm formData={formData} updateFormData={updateFormData} />}
          {step === 5 && <FoodPreferencesForm formData={formData} updateFormData={updateFormData} />}
          {step === 6 && <ExtrasForm formData={formData} updateFormData={updateFormData} />}

          <div className="mt-6 flex justify-between">
            {step > 1 && (
              <Button variant="outline" onClick={prevStep} disabled={isGenerating}>
                ← Previous Step
              </Button>
            )}
            {step === 1 && <div />}
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : step < 6 ? (
                "Next Step →"
              ) : (
                "Generate Itinerary"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
