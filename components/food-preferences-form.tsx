"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FoodPreferencesFormProps {
  formData: any
  updateFormData: (data: any) => void
}

export function FoodPreferencesForm({ formData, updateFormData }: FoodPreferencesFormProps) {
  const cuisineOptions = [
    { id: "local", label: "Local Cuisine" },
    { id: "international", label: "International" },
    { id: "vegetarian", label: "Vegetarian" },
    { id: "vegan", label: "Vegan" },
    { id: "seafood", label: "Seafood" },
    { id: "street-food", label: "Street Food" },
    { id: "fine-dining", label: "Fine Dining" },
    { id: "cafes", label: "Cafes & Bakeries" },
  ]

  const handleCuisineChange = (checked: boolean, value: string) => {
    if (checked) {
      updateFormData({ cuisinePreferences: [...formData.cuisinePreferences, value] })
    } else {
      updateFormData({
        cuisinePreferences: formData.cuisinePreferences.filter((cuisine: string) => cuisine !== value),
      })
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Step 5 of 6: Food Preferences</h2>

      <div>
        <Label className="mb-2 block">Cuisine Preferences (Select all that apply)</Label>
        <div className="grid gap-4 sm:grid-cols-2">
          {cuisineOptions.map((cuisine) => (
            <div key={cuisine.id} className="flex items-center space-x-2">
              <Checkbox
                id={cuisine.id}
                checked={formData.cuisinePreferences.includes(cuisine.id)}
                onCheckedChange={(checked) => handleCuisineChange(!!checked, cuisine.id)}
              />
              <Label htmlFor={cuisine.id}>{cuisine.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="dietary-restrictions">Dietary Restrictions or Allergies (Optional)</Label>
        <Textarea
          id="dietary-restrictions"
          placeholder="E.g., gluten-free, nut allergies, halal, kosher, etc."
          className="mt-2"
        />
      </div>
    </div>
  )
}
