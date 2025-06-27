"use client"

import { useState, useEffect } from "react"

interface GeolocationData {
  city?: string
  country?: string
  latitude?: number
  longitude?: number
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getLocation = async () => {
      try {
        // Essayer d'obtenir la position géographique
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords

              try {
                // Utiliser une API de géocodage inverse pour obtenir la ville
                const response = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`,
                )
                const data = await response.json()

                setLocation({
                  city: data.city || data.locality,
                  country: data.countryName,
                  latitude,
                  longitude,
                })
              } catch (apiError) {
                // Si l'API échoue, utiliser une ville par défaut
                setLocation({
                  city: "Paris",
                  country: "France",
                  latitude,
                  longitude,
                })
              }
              setLoading(false)
            },
            (error) => {
              console.error("Erreur de géolocalisation:", error)
              // Utiliser une localisation par défaut
              setLocation({
                city: "Paris",
                country: "France",
              })
              setError("Impossible d'obtenir la localisation")
              setLoading(false)
            },
          )
        } else {
          setError("Géolocalisation non supportée")
          setLocation({
            city: "Paris",
            country: "France",
          })
          setLoading(false)
        }
      } catch (err) {
        setError("Erreur lors de la récupération de la localisation")
        setLocation({
          city: "Paris",
          country: "France",
        })
        setLoading(false)
      }
    }

    getLocation()
  }, [])

  return { location, city: location?.city, loading, error }
}
