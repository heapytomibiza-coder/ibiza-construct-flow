import { useCallback, useMemo, useState } from "react"

import {
  CalculatorState,
  QualityTier,
  ScopeBundle,
  SizePreset,
  calculatorAdders,
  defaultState,
  locationFactors,
  projectTypes,
  qualityTiers,
  scopeBundles,
  sizePresets,
  type CalculatorAdder,
  type LocationFactor,
  type ProjectType,
} from "../data-model"

export type UseCalculatorStateResult = {
  state: CalculatorState
  projectTypeOptions: ProjectType[]
  sizePresetOptions: SizePreset[]
  qualityTierOptions: QualityTier[]
  scopeBundleOptions: ScopeBundle[]
  adderOptions: CalculatorAdder[]
  locationOptions: LocationFactor[]
  selectedSizePreset: SizePreset
  selectedQualityTier: QualityTier
  selectedScopeBundles: ScopeBundle[]
  selectedAdders: CalculatorAdder[]
  selectedLocation: LocationFactor
  setProjectType: (projectType: ProjectType) => void
  selectSizePreset: (sizePresetId: string) => void
  selectQualityTier: (qualityTierId: string) => void
  toggleScopeBundle: (scopeBundleId: string) => void
  toggleAdder: (adderId: string) => void
  selectLocation: (locationId: string) => void
  resetCalculator: () => void
}

const getDefaultStateForProjectType = (projectType: ProjectType): CalculatorState => {
  const firstPreset = sizePresets[projectType][0]
  const defaultScopeBundles = scopeBundles
    .filter((bundle) => bundle.projectType === projectType && bundle.defaultSelected)
    .map((bundle) => bundle.id)
  const fallbackBundle = scopeBundles.find((bundle) => bundle.projectType === projectType)

  return {
    ...defaultState,
    projectType,
    sizePresetId: firstPreset.id,
    scopeBundleIds: defaultScopeBundles.length
      ? defaultScopeBundles
      : fallbackBundle
      ? [fallbackBundle.id]
      : [],
    qualityTierId: defaultState.qualityTierId,
    adderIds: [],
    size: Math.round((firstPreset.min + firstPreset.max) / 2),
    locationId: defaultState.locationId,
  }
}

const ensureValidSelection = (state: CalculatorState): CalculatorState => {
  const presets = sizePresets[state.projectType]
  const preset = presets.find((item) => item.id === state.sizePresetId) ?? presets[0]
  const bundles = scopeBundles.filter((bundle) => bundle.projectType === state.projectType)
  const validBundleIds = state.scopeBundleIds.filter((id) => bundles.some((bundle) => bundle.id === id))

  return {
    ...state,
    sizePresetId: preset.id,
    scopeBundleIds: validBundleIds.length
      ? validBundleIds
      : (() => {
          const defaults = bundles.filter((bundle) => bundle.defaultSelected)
          if (defaults.length) {
            return [defaults[0].id]
          }
          return bundles.length ? [bundles[0].id] : []
        })(),
  }
}

export const useCalculatorState = (): UseCalculatorStateResult => {
  const [state, setState] = useState<CalculatorState>(() => ensureValidSelection(defaultState))

  const setProjectType = useCallback((projectType: ProjectType) => {
    setState(() => ensureValidSelection(getDefaultStateForProjectType(projectType)))
  }, [])

  const selectSizePreset = useCallback((sizePresetId: string) => {
    setState((previous) => {
      const presets = sizePresets[previous.projectType]
      const preset = presets.find((item) => item.id === sizePresetId) ?? presets[0]

      return {
        ...previous,
        sizePresetId: preset.id,
        size: Math.round((preset.min + preset.max) / 2),
      }
    })
  }, [])

  const selectQualityTier = useCallback((qualityTierId: string) => {
    setState((previous) => ({
      ...previous,
      qualityTierId,
    }))
  }, [])

  const toggleScopeBundle = useCallback((scopeBundleId: string) => {
    setState((previous) => {
      const availableBundles = scopeBundles.filter((bundle) => bundle.projectType === previous.projectType)
      const isValidBundle = availableBundles.some((bundle) => bundle.id === scopeBundleId)
      if (!isValidBundle) {
        return previous
      }

      const isSelected = previous.scopeBundleIds.includes(scopeBundleId)
      const updatedScopeBundles = isSelected
        ? previous.scopeBundleIds.filter((id) => id !== scopeBundleId)
        : [...previous.scopeBundleIds, scopeBundleId]

      return {
        ...previous,
        scopeBundleIds: updatedScopeBundles.length ? updatedScopeBundles : [availableBundles[0].id],
      }
    })
  }, [])

  const toggleAdder = useCallback((adderId: string) => {
    setState((previous) => {
      const adder = calculatorAdders.find((item) => item.id === adderId)
      if (!adder || !adder.appliesTo.includes(previous.projectType)) {
        return previous
      }

      return {
        ...previous,
        adderIds: previous.adderIds.includes(adderId)
          ? previous.adderIds.filter((id) => id !== adderId)
          : [...previous.adderIds, adderId],
      }
    })
  }, [])

  const selectLocation = useCallback((locationId: string) => {
    setState((previous) => ({
      ...previous,
      locationId,
    }))
  }, [])

  const resetCalculator = useCallback(() => {
    setState(ensureValidSelection(defaultState))
  }, [])

  const selectedSizePreset = useMemo(() => {
    const presets = sizePresets[state.projectType]
    return presets.find((preset) => preset.id === state.sizePresetId) ?? presets[0]
  }, [state.projectType, state.sizePresetId])

  const selectedQualityTier = useMemo(() => {
    return qualityTiers.find((tier) => tier.id === state.qualityTierId) ?? qualityTiers[0]
  }, [state.qualityTierId])

  const selectedScopeBundles = useMemo(() => {
    return scopeBundles.filter(
      (bundle) => bundle.projectType === state.projectType && state.scopeBundleIds.includes(bundle.id)
    )
  }, [state.projectType, state.scopeBundleIds])

  const selectedAdders = useMemo(() => {
    return calculatorAdders.filter(
      (adder) => state.adderIds.includes(adder.id) && adder.appliesTo.includes(state.projectType)
    )
  }, [state.adderIds, state.projectType])

  const selectedLocation = useMemo(() => {
    return locationFactors.find((location) => location.id === state.locationId) ?? locationFactors[0]
  }, [state.locationId])

  const projectTypeOptions = useMemo(() => [...projectTypes], [])
  const sizePresetOptions = useMemo(() => [...sizePresets[state.projectType]], [state.projectType])
  const qualityTierOptions = useMemo(() => [...qualityTiers], [])
  const scopeBundleOptions = useMemo(
    () => scopeBundles.filter((bundle) => bundle.projectType === state.projectType),
    [state.projectType]
  )
  const adderOptions = useMemo(
    () => calculatorAdders.filter((adder) => adder.appliesTo.includes(state.projectType)),
    [state.projectType]
  )
  const locationOptions = useMemo(() => [...locationFactors], [])

  return {
    state,
    projectTypeOptions,
    sizePresetOptions,
    qualityTierOptions,
    scopeBundleOptions,
    adderOptions,
    locationOptions,
    selectedSizePreset,
    selectedQualityTier,
    selectedScopeBundles,
    selectedAdders,
    selectedLocation,
    setProjectType,
    selectSizePreset,
    selectQualityTier,
    toggleScopeBundle,
    toggleAdder,
    selectLocation,
    resetCalculator,
  }
}
