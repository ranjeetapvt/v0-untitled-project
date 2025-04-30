import { type NextRequest, NextResponse } from "next/server"
import { buildItineraryPrompt } from "@/lib/ai-prompt-builder"
import { searchUnsplashImage } from "@/lib/unsplash"
import { getLocationDetails } from "@/lib/geoapify"
import { adminAuth, adminDb } from "@/lib/firebase/admin"

export async function POST(request: NextRequest) {
  try {
    // Get the current user from the authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]

    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the form data
    const formData = await request.json()

    // Build the prompt for Gemini
    const prompt = buildItineraryPrompt(formData)

    // Call Gemini API
    const geminiApiKey = process.env.GEMINI_API_KEY

    if (!geminiApiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      },
    )

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json()
      console.error("Gemini API error:", errorData)
      return NextResponse.json({ error: "Failed to generate itinerary" }, { status: 500 })
    }

    const geminiData = await geminiResponse.json()

    // Extract the generated content
    const generatedText = geminiData.candidates[0].content.parts[0].text

    // Parse the JSON response
    let itineraryContent
    try {
      // Find the JSON object in the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        itineraryContent = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (error) {
      console.error("Error parsing JSON from Gemini response:", error)
      return NextResponse.json({ error: "Failed to parse itinerary data" }, { status: 500 })
    }

    // Get an image for the destination
    const imageUrl = await searchUnsplashImage(`${formData.destination} travel landmark`)
    itineraryContent.image_url = imageUrl

    // Enhance the itinerary with location data
    for (const day of itineraryContent.days) {
      for (const activity of day.activities) {
        // Get location details for each activity
        const locationDetails = await getLocationDetails(`${activity.location}, ${formData.destination}`)
        if (locationDetails) {
          activity.mapLink = locationDetails.mapUrl
        } else {
          activity.mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location + ", " + formData.destination)}`
        }

        // Get an image for each activity
        const activityImage = await searchUnsplashImage(`${activity.title} ${formData.destination}`)
        activity.image = activityImage
      }

      // Get location details for accommodation
      const accommodationDetails = await getLocationDetails(`${day.accommodation.name}, ${formData.destination}`)
      if (accommodationDetails) {
        day.accommodation.mapLink = accommodationDetails.mapUrl
      } else {
        day.accommodation.mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(day.accommodation.name + ", " + formData.destination)}`
      }
    }

    // Add map links to accommodations
    for (const accommodation of itineraryContent.accommodations) {
      const accommodationDetails = await getLocationDetails(`${accommodation.name}, ${formData.destination}`)
      if (accommodationDetails) {
        accommodation.mapLink = accommodationDetails.mapUrl
      } else {
        accommodation.mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accommodation.name + ", " + formData.destination)}`
      }
    }

    // Save the itinerary to Firestore
    const itineraryData = {
      userId: userId,
      destination: formData.destination,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budgetType: formData.budgetType,
      travelGroupType: formData.travelGroupType,
      travelersCount: formData.travelersCount,
      arrivalMode: formData.arrivalMode,
      departureMode: formData.departureMode,
      arrivalTime: formData.arrivalTime,
      departureTime: formData.departureTime,
      content: itineraryContent,
      initialPrompt: prompt,
      tripStyles: formData.tripStyles,
      pace: formData.pace,
      wakeUpTime: formData.wakeUpTime,
      cuisinePreferences: formData.cuisinePreferences,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add the itinerary to Firestore
    const itineraryRef = adminDb.collection("itineraries").doc()
    await itineraryRef.set(itineraryData)

    return NextResponse.json({ itineraryId: itineraryRef.id })
  } catch (error) {
    console.error("Error generating itinerary:", error)
    return NextResponse.json({ error: "Failed to generate itinerary" }, { status: 500 })
  }
}
