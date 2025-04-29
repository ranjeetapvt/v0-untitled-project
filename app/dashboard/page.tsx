import { Navbar } from "@/components/navbar"
import { DashboardHeader } from "@/components/dashboard-header"
import { ItineraryGrid } from "@/components/itinerary-grid"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const supabase = createServerSupabaseClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin")
  }

  // Fetch the user's itineraries
  const { data: itineraries, error } = await supabase
    .from("itineraries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching itineraries:", error)
  }

  // Transform the data for the ItineraryGrid component
  const formattedItineraries =
    itineraries?.map((itinerary) => ({
      id: itinerary.id,
      destination: itinerary.destination,
      startDate: new Date(itinerary.start_date),
      endDate: new Date(itinerary.end_date),
      image: itinerary.content.image_url || "/placeholder.svg?height=200&width=300",
    })) || []

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

        <ItineraryGrid itineraries={formattedItineraries} />
      </div>
    </div>
  )
}
