type Vehicle = any;

export function getCostPerMile({
  vehicle,
  gasPricePerGallon,
  homeElectricityPrice,
}: {
  vehicle: Vehicle;
  gasPricePerGallon: number;
  homeElectricityPrice: number;
}) {
  if (vehicle.type === "electric") {
    const milesPerKwh =
      (vehicle.rangeElectric || 0) / (vehicle.batteryKwh || 1);
    if (!milesPerKwh) return null;
    return homeElectricityPrice / milesPerKwh;
  }

  const mpg = vehicle.mpgCombined || 0;
  if (!mpg) return null;
  return gasPricePerGallon / mpg;
}

export function getAnnualFuelCost({
  vehicle,
  gasPricePerGallon,
  homeElectricityPrice,
  annualMiles,
}: {
  vehicle: Vehicle;
  gasPricePerGallon: number;
  homeElectricityPrice: number;
  annualMiles: number;
}) {
  const costPerMile = getCostPerMile({
    vehicle,
    gasPricePerGallon,
    homeElectricityPrice,
  });

  if (costPerMile == null) return null;

  return costPerMile * annualMiles;
}

export function getPayback({
  expensive,
  baseline,
  gasPricePerGallon,
  homeElectricityPrice,
  annualMiles,
}: {
  expensive: Vehicle;
  baseline: Vehicle;
  gasPricePerGallon: number;
  homeElectricityPrice: number;
  annualMiles: number;
}) {
  const expensiveAnnual = getAnnualFuelCost({
    vehicle: expensive,
    gasPricePerGallon,
    homeElectricityPrice,
    annualMiles,
  });

  const baselineAnnual = getAnnualFuelCost({
    vehicle: baseline,
    gasPricePerGallon,
    homeElectricityPrice,
    annualMiles,
  });

  if (expensiveAnnual == null || baselineAnnual == null) return null;

  const savingsPerYear = baselineAnnual - expensiveAnnual;
  const priceDiff = expensive.price - baseline.price;

  if (savingsPerYear <= 0) {
    return {
      priceDiff,
      savingsPerYear,
      paybackYears: null,
    };
  }

  return {
    priceDiff,
    savingsPerYear,
    paybackYears: priceDiff / savingsPerYear,
  };
}