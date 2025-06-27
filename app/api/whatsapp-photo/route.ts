import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ success: false, error: "Le numéro de téléphone est obligatoire" }, { status: 400 })
    }

    // Supprimer les caractères non numériques
    const cleanPhone = phone.replace(/[^0-9]/g, "")

    // Ajouter le code pays si absent (en supposant la France +33)
    let fullNumber = cleanPhone
    if (!cleanPhone.startsWith("33") && cleanPhone.length === 10) {
      fullNumber = "33" + cleanPhone.substring(1) // Retirer le 0 initial français
    }

    console.log("Recherche de photo pour le numéro:", fullNumber)

    // Faire une requête à l'API externe
    const apiUrl = `https://primary-production-aac6.up.railway.app/webhook/request_photo?tel=${fullNumber}`

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Origin: "https://whatspy.chat",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      console.error(`L'API a retourné le statut: ${response.status}`)
      // Fallback: retourner une photo générique si l'API échoue
      return NextResponse.json({
        success: true,
        result:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        is_photo_private: false,
      })
    }

    const data = await response.json()
    console.log("Réponse de l'API:", data)

    // Vérifier si la photo est privée ou par défaut
    const isPhotoPrivate =
      !data.link || data.link === null || data.link.includes("no-user-image-icon") || data.link.includes("default")

    return NextResponse.json({
      success: true,
      result: isPhotoPrivate
        ? "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
        : data.link,
      is_photo_private: isPhotoPrivate,
    })
  } catch (error) {
    console.error("Erreur dans l'API WhatsApp:", error)

    // En cas d'erreur, retourner une photo de profil générique
    return NextResponse.json({
      success: true,
      result:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      is_photo_private: false,
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
