import { useCalculatorState } from './hooks/useCalculatorState';
import { useCalculatorPricing } from './hooks/useCalculatorPricing';

export function useCalculator() {
  const calculatorState = useCalculatorState();
  const pricing = useCalculatorPricing({ state: calculatorState.state });

  return {
    ...calculatorState,
    pricing,
  };
}
