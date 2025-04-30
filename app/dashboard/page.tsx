"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { DashboardHeader } from "@/components/dashboard-header"
import { ItineraryGrid } from "@/components/itinerary-grid"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { getUserItineraries } from "@/lib/firebase/firestore"

export default function Dashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [itineraries, setItineraries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // If not logged in and not loading, redirect to sign in
    if (!loading && !user) {
      router.push("/signin")
      return
    }

    // Fetch itineraries if user is logged in
    const fetchItineraries = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const userItineraries = await getUserItineraries(user.uid)

        // Transform the data for the ItineraryGrid component
        const formattedItineraries = userItineraries.map((itinerary) => ({
          id: itinerary.id,
          destination: itinerary.destination,
          startDate: new Date(itinerary.startDate),
          endDate: new Date(itinerary.endDate),
          image: itinerary.content.image_url || "/placeholder.svg?height=200&width=300",
        }))

        setItineraries(formattedItineraries)
      } catch (error) {
        console.error("Error fetching itineraries:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchItineraries()
    }
  }, [user, loading, router])

  if (loading || isLoading) {
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
        <DashboardHeader title="My Trips" />

        <div className="mb-6">
          <Link href="/generate">
            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <PlusCircle size={18} />
              Create New Itinerary
            </Button>
          </Link>
        </div>

        <ItineraryGrid itineraries={itineraries} />
      </div>
    </div>
  )
}
