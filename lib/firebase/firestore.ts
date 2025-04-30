import { collection, getDocs, getDoc, deleteDoc, doc, query, where, orderBy, type Timestamp } from "firebase/firestore"
import { db } from "./config"

// Types
export interface Itinerary {
  id?: string
  userId: string
  destination: string
  startDate: string
  endDate: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
  budgetType: "Cheap" | "Moderate" | "Luxury" | null
  travelGroupType: string
  travelersCount: number
  arrivalMode: string
  departureMode: string | null
  arrivalTime: string | null
  departureTime: string | null
  content: any
  initialPrompt: string | null
  tripStyles: string[] | null
  pace: "Light" | "Balanced" | "Full" | null
  wakeUpTime: "Early" | "Mid" | "Late" | null
  cuisinePreferences: string[] | null
}

// Get all itineraries for a user
export async function getUserItineraries(userId: string) {
  try {
    const q = query(collection(db, "itineraries"), where("userId", "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    const itineraries: Itinerary[] = []

    querySnapshot.forEach((doc) => {
      itineraries.push({ id: doc.id, ...doc.data() } as Itinerary)
    })

    return itineraries
  } catch (error) {
    console.error("Error getting itineraries:", error)
    throw error
  }
}

// Get a single itinerary by ID
export async function getItinerary(id: string) {
  try {
    const docRef = doc(db, "itineraries", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Itinerary
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting itinerary:", error)
    throw error
  }
}

// Delete an itinerary
export async function deleteItinerary(id: string) {
  try {
    await deleteDoc(doc(db, "itineraries", id))
    return true
  } catch (error) {
    console.error("Error deleting itinerary:", error)
    throw error
  }
}
