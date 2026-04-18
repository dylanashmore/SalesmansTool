export async function POST(req: Request) {
  try {
    const { zipCode } = await req.json();

    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return Response.json(
        { error: "zipCode must be a 5-digit string" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Missing GOOGLE_MAPS_API_KEY" },
        { status: 500 }
      );
    }

    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode},FL&key=${apiKey}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return Response.json(
        { error: "ZIP code not found" },
        { status: 404 }
      );
    }

    const location = geoData.results[0].geometry.location;

    const placesRes = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.fuelOptions,places.location",
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
      }
    );

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

    return Response.json({
      zipCode,
      center: location,
      cheapestRegular: stations[0] || null,
      stations,
    });
  } catch {
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}