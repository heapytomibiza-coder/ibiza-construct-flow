/**
 * Hook for loading wizard questions with construction-first approach
 * Returns questions, loading state, and micro UUID for job submission
 */

import { useState, useEffect } from 'react'
import { buildConstructionWizardQuestions, WizardQuestion } from '@/lib/data/constructionQuestionBlocks'

interface UseWizardQuestionsReturn {
  questions: WizardQuestion[]
  loading: boolean
  error: string | null
  microSlug: string | null
  microUuid: string | null
}

export const useWizardQuestions = (
  categories: string[], 
  responses: Record<string, any> = {}
): UseWizardQuestionsReturn => {
  const [allQuestions, setAllQuestions] = useState<WizardQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [microInfo, setMicroInfo] = useState<{ slug: string | null; uuid: string | null }>({ 
    slug: null, 
    uuid: null 
  })

  // Load questions when categories change
  useEffect(() => {
    const loadQuestions = async () => {
      if (categories.length === 0) {
        setAllQuestions([])
        setMicroInfo({ slug: null, uuid: null })
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Try construction-first approach with UUID lookup
        const { questions: constructionQuestions, microId, microUuid } = await buildConstructionWizardQuestions(categories)
        
        if (constructionQuestions.length > 0) {
          setMicroInfo({ slug: microId, uuid: microUuid })
          setAllQuestions(constructionQuestions)
          console.log('[useWizardQuestions] Loaded construction questions:', {
            count: constructionQuestions.length,
            microId,
            microUuid
          })
        } else {
          // No construction questions found - could integrate with other sources here
          setAllQuestions([])
          setMicroInfo({ slug: null, uuid: null })
        }
      } catch (err) {
        console.error('[useWizardQuestions] Error loading questions:', err)
        setError(err instanceof Error ? err.message : 'Failed to load questions')
        setAllQuestions([])
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [categories.join(',')])

  // Filter questions based on conditional logic
  const visibleQuestions = allQuestions.filter(question => {
    if (!question.conditional) return true

    const dependsOnValue = responses[question.conditional.depends_on]
    const showWhen = question.conditional.show_when

    if (Array.isArray(showWhen)) {
      return showWhen.includes(dependsOnValue)
    } else {
      return dependsOnValue === showWhen
    }
  })

  return {
    questions: visibleQuestions,
    loading,
    error,
    microSlug: microInfo.slug,
    microUuid: microInfo.uuid
  }
}

// Re-export WizardQuestion type for convenience
export type { WizardQuestion }
