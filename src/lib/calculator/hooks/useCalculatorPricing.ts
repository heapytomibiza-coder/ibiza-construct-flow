import { useMemo } from "react"

import { baseRatesPerSqm, calculatorAdders, costTemplates, locationFactors, qualityTiers, scopeBundles, sizePresets } from "../data-model"

import type { CalculatorAdder, CalculatorState, ScopeBundle } from "../data-model"
import type { PricingResult, PricingBreakdown } from "../results/types"

type UseCalculatorPricingProps = {
  state: CalculatorState
}

const calculateBundleAdjustments = (state: CalculatorState, bundles: ScopeBundle[]): number => {
  return bundles.reduce((sum, bundle) => sum + bundle.basePricePerSqm * state.size, 0)
}

const calculateAdderValue = (state: CalculatorState, adders: CalculatorAdder[], base: number): number => {
  let fixed = 0
  let perSqm = 0
  let percentage = 0

  adders.forEach((adder) => {
    if (adder.priceType === "fixed") {
      fixed += adder.priceValue
    }

    if (adder.priceType === "per_sqm") {
      perSqm += adder.priceValue * state.size
    }

    if (adder.priceType === "percentage") {
      percentage += adder.priceValue
    }
  })

  return (base + fixed + perSqm) * (1 + percentage)
}

const toEuros = (value: number): number => Math.round(value)

export const useCalculatorPricing = ({ state }: UseCalculatorPricingProps): PricingResult => {
  return useMemo(() => {
    const baseRate = baseRatesPerSqm[state.projectType] ?? 0
    const baseCost = state.size * baseRate

    const tier = qualityTiers.find((item) => item.id === state.qualityTierId) ?? qualityTiers[0]
    const bundles = scopeBundles.filter(
      (bundle) => bundle.projectType === state.projectType && state.scopeBundleIds.includes(bundle.id)
    )
    const adders = calculatorAdders.filter(
      (adder) => state.adderIds.includes(adder.id) && adder.appliesTo.includes(state.projectType)
    )
    const location = locationFactors.find((item) => item.id === state.locationId) ?? locationFactors[0]
    const preset = sizePresets[state.projectType].find((item) => item.id === state.sizePresetId)

    const bundleCost = calculateBundleAdjustments(state, bundles)
    const tierAdjusted = (baseCost + bundleCost) * tier.multiplier
    const addersApplied = calculateAdderValue(state, adders, tierAdjusted)
    const locationAdjusted = addersApplied * (1 + location.upliftPercentage)

    const template =
      costTemplates[state.projectType]?.[tier.id] ?? costTemplates[state.projectType]?.[qualityTiers[0].id]

    const total = toEuros(locationAdjusted)
    const breakdown: PricingBreakdown = template
      ? {
          labour: toEuros(total * template.labourPercentage),
          materials: toEuros(total * template.materialsPercentage),
          permits: toEuros(total * template.permitsPercentage),
          contingency: toEuros(total * template.contingencyPercentage),
          disposal: toEuros(total * template.disposalPercentage),
        }
      : {
          labour: toEuros(total * 0.42),
          materials: toEuros(total * 0.32),
          permits: toEuros(total * 0.06),
          contingency: toEuros(total * 0.12),
          disposal: toEuros(total * 0.08),
        }

    const swing = Math.max(0.05 * total, 1200)
    const lowEstimate = toEuros(total - swing)
    const highEstimate = toEuros(total + swing)

    const notes = new Set<string>()
    bundles.forEach((bundle) => bundle.educationBlurbs?.forEach((blurb) => notes.add(blurb)))
    adders.forEach((adder) => {
      if (adder.tooltip) {
        notes.add(adder.tooltip)
      }
    })
    if (location.notes) {
      notes.add(location.notes)
    }

    const timeline = preset
      ? {
          minDays: preset.typicalDurationDays.min + adders.length * 2,
          maxDays: preset.typicalDurationDays.max + adders.length * 3,
        }
      : { minDays: 21, maxDays: 35 }

    return {
      base: toEuros(baseCost),
      total,
      lowEstimate,
      highEstimate,
      breakdown,
      timeline,
      bundles,
      adders,
      location,
      qualityTier: tier,
      notes: Array.from(notes),
    }
  }, [state])
}
