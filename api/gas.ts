export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { zipCode } = req.body ?? {};

    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return res.status(400).json({ error: "zipCode must be a 5-digit string" });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GOOGLE_MAPS_API_KEY" });
    }

    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode},FL&key=${apiKey}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return res.status(404).json({ error: "ZIP code not found" });
    }

    const location = geoData.results[0].geometry.location;

    const placesRes = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.fuelOptions,places.location",
      },
      body: JSON.stringify({
        includedTypes: ["gas_station"],
        maxResultCount: 10,
        locationRestriction: {
          circle: {
            center: {
              latitude: location.lat,
              longitude: location.lng,
            },
            radius: 8000,
          },
        },
      }),
    });

    const placesData = await placesRes.json();

    const stations = (placesData.places || [])
      .map((place: any) => {
        const fuelPrices = place.fuelOptions?.fuelPrices || [];
        const regular = fuelPrices.find((fuel: any) =>
          String(fuel.type || "").toLowerCase().includes("regular")
        );

        let regularPrice = null;

        if (regular?.price) {
          const units = Number(regular.price.units || 0);
          const nanos = Number(regular.price.nanos || 0) / 1_000_000_000;
          regularPrice = units + nanos;
        }

        return {
          name: place.displayName?.text || "Unknown",
          address: place.formattedAddress || "",
          regularPrice,
        };
      })
      .filter((station: any) => station.regularPrice !== null)
      .sort((left: any, right: any) => left.regularPrice - right.regularPrice);

    return res.status(200).json({
      zipCode,
      center: location,
      cheapestRegular: stations[0] || null,
      stations,
    });
  } catch {
    return res.status(500).json({ error: "Something went wrong" });
  }
}