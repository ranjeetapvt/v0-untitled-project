import { Navbar } from "@/components/navbar"
import { ItineraryHeader } from "@/components/itinerary-header"
import { ItineraryTabs } from "@/components/itinerary-tabs"
import { DayPlan } from "@/components/day-plan"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import DeleteItineraryButton from "@/components/delete-itinerary-button"

export default async function ItineraryView({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Fetch the itinerary
  const { data: itinerary, error } = await supabase
    .from("itineraries")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (error || !itinerary) {
    notFound()
  }

  // Format the itinerary data
  const formattedItinerary = {
    id: itinerary.id,
    destination: itinerary.destination,
    startDate: new Date(itinerary.start_date),
    endDate: new Date(itinerary.end_date),
    travelersCount: itinerary.travelers_count,
    travelGroupType: itinerary.travel_group_type,
    description: itinerary.content.description,
    image: itinerary.content.image_url || "/placeholder.svg?height=400&width=800",
    days: itinerary.content.days,
    accommodations: itinerary.content.accommodations,
    tips: itinerary.content.tips,
    travelDetails: itinerary.content.travelDetails,
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <ItineraryHeader itinerary={formattedItinerary} />

        <ItineraryTabs itinerary={formattedItinerary} />

        <div className="mt-8 space-y-8">
          {formattedItinerary.days.map((day) => (
            <DayPlan key={day.dayNumber} day={day} />
          ))}
        </div>

        <div className="mt-12 flex justify-between">
          <DeleteItineraryButton id={params.id} />

          <Link href={`/itinerary/${params.id}/pdf`}>
            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Printer size={18} />
              Print Itinerary
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
