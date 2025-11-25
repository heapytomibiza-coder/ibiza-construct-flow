/**
 * New Question Packs - Batch 1
 * Carpentry (17) + Floors, Doors & Windows (5) = 22 packs total
 * Format: Ready for seed function
 */

export const newCarpentryQuestionPacks = [
  {
    microSlug: 'cabinet-installation',
    subcategorySlug: 'cabinetry-storage',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'location',
        type: 'single',
        i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q1.options.kitchen', value: 'kitchen', order: 0 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q1.options.bathroom', value: 'bathroom', order: 1 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q1.options.utility-room', value: 'utility-room', order: 2 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q1.options.living-room', value: 'living-room', order: 3 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q1.options.bedroom', value: 'bedroom', order: 4 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q1.options.hallway', value: 'hallway', order: 5 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q1.options.multiple-areas', value: 'multiple-areas', order: 6 }
        ]
      },
      {
        key: 'cabinet_type',
        type: 'single',
        i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q2.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q2.options.flat-pack', value: 'flat-pack', order: 0 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q2.options.pre-assembled', value: 'pre-assembled', order: 1 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q2.options.custom-made', value: 'custom-made', order: 2 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q2.options.not-sure', value: 'not-sure', order: 3 }
        ]
      },
      {
        key: 'count',
        type: 'single',
        i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q3.options.1-3', value: '1-3', order: 0 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q3.options.4-6', value: '4-6', order: 1 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q3.options.7-10', value: '7-10', order: 2 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q3.options.10-plus', value: '10-plus', order: 3 }
        ]
      },
      {
        key: 'removal_needed',
        type: 'single',
        i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q4.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q4.options.yes-remove', value: 'yes-remove', order: 0 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q4.options.no-removal', value: 'no-removal', order: 1 }
        ]
      },
      {
        key: 'walls',
        type: 'single',
        i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q5.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q5.options.plasterboard', value: 'plasterboard', order: 0 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q5.options.block', value: 'block', order: 1 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q5.options.concrete', value: 'concrete', order: 2 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q5.options.mixed-unsure', value: 'mixed-unsure', order: 3 }
        ]
      },
      {
        key: 'extras',
        type: 'multi',
        i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q6.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q6.options.worktop-fitting', value: 'worktop-fitting', order: 0 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q6.options.plumbing-connection', value: 'plumbing-connection', order: 1 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q6.options.electrical-adjustments', value: 'electrical-adjustments', order: 2 },
          { i18nKey: 'carpentry.cabinetry-storage.cabinet-installation.q6.options.none', value: 'none', order: 3 }
        ]
      }
    ]
  },
  {
    microSlug: 'deck-construction',
    subcategorySlug: 'decking',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'deck_size',
        type: 'single',
        i18nKey: 'carpentry.decking.deck-construction.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.decking.deck-construction.q1.options.small', value: 'small', order: 0 },
          { i18nKey: 'carpentry.decking.deck-construction.q1.options.medium', value: 'medium', order: 1 },
          { i18nKey: 'carpentry.decking.deck-construction.q1.options.large', value: 'large', order: 2 },
          { i18nKey: 'carpentry.decking.deck-construction.q1.options.extra-large', value: 'extra-large', order: 3 }
        ]
      },
      {
        key: 'material',
        type: 'single',
        i18nKey: 'carpentry.decking.deck-construction.q2.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.decking.deck-construction.q2.options.softwood', value: 'softwood', order: 0 },
          { i18nKey: 'carpentry.decking.deck-construction.q2.options.hardwood', value: 'hardwood', order: 1 },
          { i18nKey: 'carpentry.decking.deck-construction.q2.options.composite', value: 'composite', order: 2 },
          { i18nKey: 'carpentry.decking.deck-construction.q2.options.pvc', value: 'pvc', order: 3 },
          { i18nKey: 'carpentry.decking.deck-construction.q2.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'height',
        type: 'single',
        i18nKey: 'carpentry.decking.deck-construction.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.decking.deck-construction.q3.options.ground-level', value: 'ground-level', order: 0 },
          { i18nKey: 'carpentry.decking.deck-construction.q3.options.low-raised', value: 'low-raised', order: 1 },
          { i18nKey: 'carpentry.decking.deck-construction.q3.options.raised', value: 'raised', order: 2 },
          { i18nKey: 'carpentry.decking.deck-construction.q3.options.high-deck', value: 'high-deck', order: 3 }
        ]
      },
      {
        key: 'features',
        type: 'multi',
        i18nKey: 'carpentry.decking.deck-construction.q4.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.decking.deck-construction.q4.options.steps', value: 'steps', order: 0 },
          { i18nKey: 'carpentry.decking.deck-construction.q4.options.railing', value: 'railing', order: 1 },
          { i18nKey: 'carpentry.decking.deck-construction.q4.options.built-in-seating', value: 'built-in-seating', order: 2 },
          { i18nKey: 'carpentry.decking.deck-construction.q4.options.lighting', value: 'lighting', order: 3 },
          { i18nKey: 'carpentry.decking.deck-construction.q4.options.none', value: 'none', order: 4 }
        ]
      },
      {
        key: 'access',
        type: 'single',
        i18nKey: 'carpentry.decking.deck-construction.q5.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.decking.deck-construction.q5.options.easy', value: 'easy', order: 0 },
          { i18nKey: 'carpentry.decking.deck-construction.q5.options.moderate', value: 'moderate', order: 1 },
          { i18nKey: 'carpentry.decking.deck-construction.q5.options.poor', value: 'poor', order: 2 },
          { i18nKey: 'carpentry.decking.deck-construction.q5.options.unsure', value: 'unsure', order: 3 }
        ]
      },
      {
        key: 'old_deck',
        type: 'single',
        i18nKey: 'carpentry.decking.deck-construction.q6.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.decking.deck-construction.q6.options.yes', value: 'yes', order: 0 },
          { i18nKey: 'carpentry.decking.deck-construction.q6.options.no', value: 'no', order: 1 },
          { i18nKey: 'carpentry.decking.deck-construction.q6.options.no-deck-currently', value: 'no-deck-currently', order: 2 }
        ]
      }
    ]
  },
  {
    microSlug: 'deck-repair',
    subcategorySlug: 'decking',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'issues',
        type: 'multi',
        i18nKey: 'carpentry.decking.deck-repair.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.decking.deck-repair.q1.options.loose-broken-boards', value: 'loose-broken-boards', order: 0 },
          { i18nKey: 'carpentry.decking.deck-repair.q1.options.rotten-wood', value: 'rotten-wood', order: 1 },
          { i18nKey: 'carpentry.decking.deck-repair.q1.options.wobbly-railing', value: 'wobbly-railing', order: 2 },
          { i18nKey: 'carpentry.decking.deck-repair.q1.options.structural-issues', value: 'structural-issues', order: 3 },
          { i18nKey: 'carpentry.decking.deck-repair.q1.options.general-wear', value: 'general-wear', order: 4 }
        ]
      },
      {
        key: 'deck_size',
        type: 'single',
        i18nKey: 'carpentry.decking.deck-repair.q2.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.decking.deck-repair.q2.options.small', value: 'small', order: 0 },
          { i18nKey: 'carpentry.decking.deck-repair.q2.options.medium', value: 'medium', order: 1 },
          { i18nKey: 'carpentry.decking.deck-repair.q2.options.large', value: 'large', order: 2 },
          { i18nKey: 'carpentry.decking.deck-repair.q2.options.unsure', value: 'unsure', order: 3 }
        ]
      },
      {
        key: 'material',
        type: 'single',
        i18nKey: 'carpentry.decking.deck-repair.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.decking.deck-repair.q3.options.softwood', value: 'softwood', order: 0 },
          { i18nKey: 'carpentry.decking.deck-repair.q3.options.hardwood', value: 'hardwood', order: 1 },
          { i18nKey: 'carpentry.decking.deck-repair.q3.options.composite', value: 'composite', order: 2 },
          { i18nKey: 'carpentry.decking.deck-repair.q3.options.pvc', value: 'pvc', order: 3 },
          { i18nKey: 'carpentry.decking.deck-repair.q3.options.unsure', value: 'unsure', order: 4 }
        ]
      },
      {
        key: 'age',
        type: 'single',
        i18nKey: 'carpentry.decking.deck-repair.q4.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.decking.deck-repair.q4.options.0-5-years', value: '0-5-years', order: 0 },
          { i18nKey: 'carpentry.decking.deck-repair.q4.options.5-10-years', value: '5-10-years', order: 1 },
          { i18nKey: 'carpentry.decking.deck-repair.q4.options.10-20-years', value: '10-20-years', order: 2 },
          { i18nKey: 'carpentry.decking.deck-repair.q4.options.20-plus-years', value: '20-plus-years', order: 3 },
          { i18nKey: 'carpentry.decking.deck-repair.q4.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'urgent',
        type: 'single',
        i18nKey: 'carpentry.decking.deck-repair.q5.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.decking.deck-repair.q5.options.emergency', value: 'emergency', order: 0 },
          { i18nKey: 'carpentry.decking.deck-repair.q5.options.within-week', value: 'within-week', order: 1 },
          { i18nKey: 'carpentry.decking.deck-repair.q5.options.not-urgent', value: 'not-urgent', order: 2 }
        ]
      }
    ]
  },
  {
    microSlug: 'deck-replacement',
    subcategorySlug: 'decking',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'reason',
        type: 'multi',
        i18nKey: 'carpentry.decking.deck-replacement.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.decking.deck-replacement.q1.options.rotten-wood', value: 'rotten-wood', order: 0 },
          { i18nKey: 'carpentry.decking.deck-replacement.q1.options.unsafe-structure', value: 'unsafe-structure', order: 1 },
          { i18nKey: 'carpentry.decking.deck-replacement.q1.options.old-worn', value: 'old-worn', order: 2 },
          { i18nKey: 'carpentry.decking.deck-replacement.q1.options.design-change', value: 'design-change', order: 3 }
        ]
      },
      {
        key: 'size',
        type: 'single',
        i18nKey: 'carpentry.decking.deck-replacement.q2.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.decking.deck-replacement.q2.options.small', value: 'small', order: 0 },
          { i18nKey: 'carpentry.decking.deck-replacement.q2.options.medium', value: 'medium', order: 1 },
          { i18nKey: 'carpentry.decking.deck-replacement.q2.options.large', value: 'large', order: 2 },
          { i18nKey: 'carpentry.decking.deck-replacement.q2.options.extra-large', value: 'extra-large', order: 3 },
          { i18nKey: 'carpentry.decking.deck-replacement.q2.options.unsure', value: 'unsure', order: 4 }
        ]
      },
      {
        key: 'material',
        type: 'single',
        i18nKey: 'carpentry.decking.deck-replacement.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.decking.deck-replacement.q3.options.softwood', value: 'softwood', order: 0 },
          { i18nKey: 'carpentry.decking.deck-replacement.q3.options.hardwood', value: 'hardwood', order: 1 },
          { i18nKey: 'carpentry.decking.deck-replacement.q3.options.composite', value: 'composite', order: 2 },
          { i18nKey: 'carpentry.decking.deck-replacement.q3.options.pvc', value: 'pvc', order: 3 },
          { i18nKey: 'carpentry.decking.deck-replacement.q3.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'features',
        type: 'multi',
        i18nKey: 'carpentry.decking.deck-replacement.q4.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.decking.deck-replacement.q4.options.steps', value: 'steps', order: 0 },
          { i18nKey: 'carpentry.decking.deck-replacement.q4.options.railing', value: 'railing', order: 1 },
          { i18nKey: 'carpentry.decking.deck-replacement.q4.options.lighting', value: 'lighting', order: 2 },
          { i18nKey: 'carpentry.decking.deck-replacement.q4.options.built-seating', value: 'built-seating', order: 3 },
          { i18nKey: 'carpentry.decking.deck-replacement.q4.options.same-as-existing', value: 'same-as-existing', order: 4 }
        ]
      }
    ]
  },
  {
    microSlug: 'deck-staining-sealing',
    subcategorySlug: 'decking',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'service_type',
        type: 'single',
        i18nKey: 'carpentry.decking.deck-staining-sealing.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.decking.deck-staining-sealing.q1.options.staining', value: 'staining', order: 0 },
          { i18nKey: 'carpentry.decking.deck-staining-sealing.q1.options.sealing', value: 'sealing', order: 1 },
          { i18nKey: 'carpentry.decking.deck-staining-sealing.q1.options.both', value: 'both', order: 2 }
        ]
      },
      {
        key: 'deck_condition',
        type: 'single',
        i18nKey: 'carpentry.decking.deck-staining-sealing.q2.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.decking.deck-staining-sealing.q2.options.good', value: 'good', order: 0 },
          { i18nKey: 'carpentry.decking.deck-staining-sealing.q2.options.minor-wear', value: 'minor-wear', order: 1 },
          { i18nKey: 'carpentry.decking.deck-staining-sealing.q2.options.damaged', value: 'damaged', order: 2 },
          { i18nKey: 'carpentry.decking.deck-staining-sealing.q2.options.grey-weathered', value: 'grey-weathered', order: 3 }
        ]
      },
      {
        key: 'deck_size',
        type: 'single',
        i18nKey: 'carpentry.decking.deck-staining-sealing.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.decking.deck-staining-sealing.q3.options.small', value: 'small', order: 0 },
          { i18nKey: 'carpentry.decking.deck-staining-sealing.q3.options.medium', value: 'medium', order: 1 },
          { i18nKey: 'carpentry.decking.deck-staining-sealing.q3.options.large', value: 'large', order: 2 },
          { i18nKey: 'carpentry.decking.deck-staining-sealing.q3.options.extra-large', value: 'extra-large', order: 3 }
        ]
      },
      {
        key: 'cleaning_needed',
        type: 'single',
        i18nKey: 'carpentry.decking.deck-staining-sealing.q4.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.decking.deck-staining-sealing.q4.options.yes-pressure-wash', value: 'yes-pressure-wash', order: 0 },
          { i18nKey: 'carpentry.decking.deck-staining-sealing.q4.options.no', value: 'no', order: 1 },
          { i18nKey: 'carpentry.decking.deck-staining-sealing.q4.options.not-sure', value: 'not-sure', order: 2 }
        ]
      }
    ]
  },
  {
    microSlug: 'door-frame-replacement',
    subcategorySlug: 'doors',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'door_location',
        type: 'single',
        i18nKey: 'carpentry.doors.door-frame-replacement.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-frame-replacement.q1.options.front-door', value: 'front-door', order: 0 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q1.options.back-door', value: 'back-door', order: 1 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q1.options.internal-door', value: 'internal-door', order: 2 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q1.options.patio-balcony', value: 'patio-balcony', order: 3 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q1.options.garage-side', value: 'garage-side', order: 4 }
        ]
      },
      {
        key: 'door_count',
        type: 'single',
        i18nKey: 'carpentry.doors.door-frame-replacement.q2.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-frame-replacement.q2.options.1', value: '1', order: 0 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q2.options.2-3', value: '2-3', order: 1 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q2.options.4-6', value: '4-6', order: 2 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q2.options.more-than-6', value: 'more-than-6', order: 3 }
        ]
      },
      {
        key: 'frame_issue',
        type: 'single',
        i18nKey: 'carpentry.doors.door-frame-replacement.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-frame-replacement.q3.options.rotten-damaged', value: 'rotten-damaged', order: 0 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q3.options.misaligned-twisted', value: 'misaligned-twisted', order: 1 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q3.options.water-damage', value: 'water-damage', order: 2 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q3.options.security-upgrade', value: 'security-upgrade', order: 3 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q3.options.other-not-sure', value: 'other-not-sure', order: 4 }
        ]
      },
      {
        key: 'material_preference',
        type: 'single',
        i18nKey: 'carpentry.doors.door-frame-replacement.q4.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-frame-replacement.q4.options.softwood', value: 'softwood', order: 0 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q4.options.hardwood', value: 'hardwood', order: 1 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q4.options.metal', value: 'metal', order: 2 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q4.options.upvc', value: 'upvc', order: 3 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q4.options.match-existing', value: 'match-existing', order: 4 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q4.options.not-sure', value: 'not-sure', order: 5 }
        ]
      },
      {
        key: 'wall_type',
        type: 'single',
        i18nKey: 'carpentry.doors.door-frame-replacement.q5.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-frame-replacement.q5.options.block-brick', value: 'block-brick', order: 0 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q5.options.stud-plasterboard', value: 'stud-plasterboard', order: 1 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q5.options.concrete', value: 'concrete', order: 2 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q5.options.stone', value: 'stone', order: 3 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q5.options.unsure', value: 'unsure', order: 4 }
        ]
      },
      {
        key: 'decoration',
        type: 'single',
        i18nKey: 'carpentry.doors.door-frame-replacement.q6.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.doors.door-frame-replacement.q6.options.yes-painting', value: 'yes-painting', order: 0 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q6.options.yes-plastering', value: 'yes-plastering', order: 1 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q6.options.both', value: 'both', order: 2 },
          { i18nKey: 'carpentry.doors.door-frame-replacement.q6.options.no-just-frame', value: 'no-just-frame', order: 3 }
        ]
      }
    ]
  },
  {
    microSlug: 'door-hanging',
    subcategorySlug: 'doors',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'door_type',
        type: 'single',
        i18nKey: 'carpentry.doors.door-hanging.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-hanging.q1.options.internal', value: 'internal', order: 0 },
          { i18nKey: 'carpentry.doors.door-hanging.q1.options.front-door', value: 'front-door', order: 1 },
          { i18nKey: 'carpentry.doors.door-hanging.q1.options.back-door', value: 'back-door', order: 2 },
          { i18nKey: 'carpentry.doors.door-hanging.q1.options.patio-hinged', value: 'patio-hinged', order: 3 },
          { i18nKey: 'carpentry.doors.door-hanging.q1.options.other', value: 'other', order: 4 }
        ]
      },
      {
        key: 'door_count',
        type: 'single',
        i18nKey: 'carpentry.doors.door-hanging.q2.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-hanging.q2.options.1', value: '1', order: 0 },
          { i18nKey: 'carpentry.doors.door-hanging.q2.options.2-3', value: '2-3', order: 1 },
          { i18nKey: 'carpentry.doors.door-hanging.q2.options.4-6', value: '4-6', order: 2 },
          { i18nKey: 'carpentry.doors.door-hanging.q2.options.more-than-6', value: 'more-than-6', order: 3 }
        ]
      },
      {
        key: 'door_supplied',
        type: 'single',
        i18nKey: 'carpentry.doors.door-hanging.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-hanging.q3.options.yes-on-site', value: 'yes-on-site', order: 0 },
          { i18nKey: 'carpentry.doors.door-hanging.q3.options.no-supply-needed', value: 'no-supply-needed', order: 1 },
          { i18nKey: 'carpentry.doors.door-hanging.q3.options.some-supplied', value: 'some-supplied', order: 2 }
        ]
      },
      {
        key: 'frame_condition',
        type: 'single',
        i18nKey: 'carpentry.doors.door-hanging.q4.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-hanging.q4.options.good', value: 'good', order: 0 },
          { i18nKey: 'carpentry.doors.door-hanging.q4.options.minor-adjustments', value: 'minor-adjustments', order: 1 },
          { i18nKey: 'carpentry.doors.door-hanging.q4.options.repair-replacement', value: 'repair-replacement', order: 2 },
          { i18nKey: 'carpentry.doors.door-hanging.q4.options.no-frames-yet', value: 'no-frames-yet', order: 3 },
          { i18nKey: 'carpentry.doors.door-hanging.q4.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'hardware',
        type: 'single',
        i18nKey: 'carpentry.doors.door-hanging.q5.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.doors.door-hanging.q5.options.hinges-only', value: 'hinges-only', order: 0 },
          { i18nKey: 'carpentry.doors.door-hanging.q5.options.hinges-handles', value: 'hinges-handles', order: 1 },
          { i18nKey: 'carpentry.doors.door-hanging.q5.options.lock-latch', value: 'lock-latch', order: 2 },
          { i18nKey: 'carpentry.doors.door-hanging.q5.options.all-hardware', value: 'all-hardware', order: 3 },
          { i18nKey: 'carpentry.doors.door-hanging.q5.options.unsure', value: 'unsure', order: 4 }
        ]
      },
      {
        key: 'trimming',
        type: 'single',
        i18nKey: 'carpentry.doors.door-hanging.q6.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.doors.door-hanging.q6.options.yes-most', value: 'yes-most', order: 0 },
          { i18nKey: 'carpentry.doors.door-hanging.q6.options.maybe-one-two', value: 'maybe-one-two', order: 1 },
          { i18nKey: 'carpentry.doors.door-hanging.q6.options.no-pre-sized', value: 'no-pre-sized', order: 2 },
          { i18nKey: 'carpentry.doors.door-hanging.q6.options.not-sure', value: 'not-sure', order: 3 }
        ]
      }
    ]
  },
  {
    microSlug: 'door-installation',
    subcategorySlug: 'doors',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'door_location',
        type: 'single',
        i18nKey: 'carpentry.doors.door-installation.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-installation.q1.options.new-opening', value: 'new-opening', order: 0 },
          { i18nKey: 'carpentry.doors.door-installation.q1.options.replacing-old', value: 'replacing-old', order: 1 },
          { i18nKey: 'carpentry.doors.door-installation.q1.options.window-to-door', value: 'window-to-door', order: 2 },
          { i18nKey: 'carpentry.doors.door-installation.q1.options.other-not-sure', value: 'other-not-sure', order: 3 }
        ]
      },
      {
        key: 'door_position',
        type: 'single',
        i18nKey: 'carpentry.doors.door-installation.q2.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-installation.q2.options.internal', value: 'internal', order: 0 },
          { i18nKey: 'carpentry.doors.door-installation.q2.options.front-entrance', value: 'front-entrance', order: 1 },
          { i18nKey: 'carpentry.doors.door-installation.q2.options.back-side', value: 'back-side', order: 2 },
          { i18nKey: 'carpentry.doors.door-installation.q2.options.patio-terrace', value: 'patio-terrace', order: 3 }
        ]
      },
      {
        key: 'door_style',
        type: 'single',
        i18nKey: 'carpentry.doors.door-installation.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-installation.q3.options.solid-timber', value: 'solid-timber', order: 0 },
          { i18nKey: 'carpentry.doors.door-installation.q3.options.glazed-timber', value: 'glazed-timber', order: 1 },
          { i18nKey: 'carpentry.doors.door-installation.q3.options.composite', value: 'composite', order: 2 },
          { i18nKey: 'carpentry.doors.door-installation.q3.options.upvc', value: 'upvc', order: 3 },
          { i18nKey: 'carpentry.doors.door-installation.q3.options.metal', value: 'metal', order: 4 },
          { i18nKey: 'carpentry.doors.door-installation.q3.options.not-sure', value: 'not-sure', order: 5 }
        ]
      },
      {
        key: 'door_supplied',
        type: 'single',
        i18nKey: 'carpentry.doors.door-installation.q4.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-installation.q4.options.have-both', value: 'have-both', order: 0 },
          { i18nKey: 'carpentry.doors.door-installation.q4.options.door-only', value: 'door-only', order: 1 },
          { i18nKey: 'carpentry.doors.door-installation.q4.options.need-both', value: 'need-both', order: 2 },
          { i18nKey: 'carpentry.doors.door-installation.q4.options.not-sure-yet', value: 'not-sure-yet', order: 3 }
        ]
      },
      {
        key: 'security_level',
        type: 'single',
        i18nKey: 'carpentry.doors.door-installation.q5.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.doors.door-installation.q5.options.standard-domestic', value: 'standard-domestic', order: 0 },
          { i18nKey: 'carpentry.doors.door-installation.q5.options.high-security', value: 'high-security', order: 1 },
          { i18nKey: 'carpentry.doors.door-installation.q5.options.fire-rated', value: 'fire-rated', order: 2 },
          { i18nKey: 'carpentry.doors.door-installation.q5.options.not-sure', value: 'not-sure', order: 3 }
        ]
      },
      {
        key: 'finishing',
        type: 'single',
        i18nKey: 'carpentry.doors.door-installation.q6.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.doors.door-installation.q6.options.just-install', value: 'just-install', order: 0 },
          { i18nKey: 'carpentry.doors.door-installation.q6.options.trim-architrave', value: 'trim-architrave', order: 1 },
          { i18nKey: 'carpentry.doors.door-installation.q6.options.painting-varnishing', value: 'painting-varnishing', order: 2 },
          { i18nKey: 'carpentry.doors.door-installation.q6.options.plaster-paint', value: 'plaster-paint', order: 3 }
        ]
      }
    ]
  },
  {
    microSlug: 'door-repair',
    subcategorySlug: 'doors',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'problem_type',
        type: 'multi',
        i18nKey: 'carpentry.doors.door-repair.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-repair.q1.options.sticking-scraping', value: 'sticking-scraping', order: 0 },
          { i18nKey: 'carpentry.doors.door-repair.q1.options.wont-close', value: 'wont-close', order: 1 },
          { i18nKey: 'carpentry.doors.door-repair.q1.options.loose-broken-hinges', value: 'loose-broken-hinges', order: 2 },
          { i18nKey: 'carpentry.doors.door-repair.q1.options.damaged-frame', value: 'damaged-frame', order: 3 },
          { i18nKey: 'carpentry.doors.door-repair.q1.options.lock-handle-problem', value: 'lock-handle-problem', order: 4 },
          { i18nKey: 'carpentry.doors.door-repair.q1.options.other', value: 'other', order: 5 }
        ]
      },
      {
        key: 'door_type',
        type: 'single',
        i18nKey: 'carpentry.doors.door-repair.q2.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-repair.q2.options.internal', value: 'internal', order: 0 },
          { i18nKey: 'carpentry.doors.door-repair.q2.options.front-door', value: 'front-door', order: 1 },
          { i18nKey: 'carpentry.doors.door-repair.q2.options.back-door', value: 'back-door', order: 2 },
          { i18nKey: 'carpentry.doors.door-repair.q2.options.patio-balcony', value: 'patio-balcony', order: 3 },
          { i18nKey: 'carpentry.doors.door-repair.q2.options.sliding-door', value: 'sliding-door', order: 4 }
        ]
      },
      {
        key: 'material',
        type: 'single',
        i18nKey: 'carpentry.doors.door-repair.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-repair.q3.options.timber', value: 'timber', order: 0 },
          { i18nKey: 'carpentry.doors.door-repair.q3.options.composite', value: 'composite', order: 1 },
          { i18nKey: 'carpentry.doors.door-repair.q3.options.upvc', value: 'upvc', order: 2 },
          { i18nKey: 'carpentry.doors.door-repair.q3.options.aluminium', value: 'aluminium', order: 3 },
          { i18nKey: 'carpentry.doors.door-repair.q3.options.glass', value: 'glass', order: 4 },
          { i18nKey: 'carpentry.doors.door-repair.q3.options.not-sure', value: 'not-sure', order: 5 }
        ]
      },
      {
        key: 'frame_condition',
        type: 'single',
        i18nKey: 'carpentry.doors.door-repair.q4.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.door-repair.q4.options.good', value: 'good', order: 0 },
          { i18nKey: 'carpentry.doors.door-repair.q4.options.minor-damage', value: 'minor-damage', order: 1 },
          { i18nKey: 'carpentry.doors.door-repair.q4.options.rotten-severe', value: 'rotten-severe', order: 2 },
          { i18nKey: 'carpentry.doors.door-repair.q4.options.not-sure', value: 'not-sure', order: 3 }
        ]
      },
      {
        key: 'hardware',
        type: 'multi',
        i18nKey: 'carpentry.doors.door-repair.q5.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.doors.door-repair.q5.options.hinges', value: 'hinges', order: 0 },
          { i18nKey: 'carpentry.doors.door-repair.q5.options.handle-latch', value: 'handle-latch', order: 1 },
          { i18nKey: 'carpentry.doors.door-repair.q5.options.lock-cylinder', value: 'lock-cylinder', order: 2 },
          { i18nKey: 'carpentry.doors.door-repair.q5.options.door-closer', value: 'door-closer', order: 3 },
          { i18nKey: 'carpentry.doors.door-repair.q5.options.no-just-door', value: 'no-just-door', order: 4 }
        ]
      }
    ]
  },
  {
    microSlug: 'fence-installation',
    subcategorySlug: 'fencing-gates',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'fence_purpose',
        type: 'single',
        i18nKey: 'carpentry.fencing-gates.fence-installation.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q1.options.privacy', value: 'privacy', order: 0 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q1.options.security', value: 'security', order: 1 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q1.options.garden-boundary', value: 'garden-boundary', order: 2 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q1.options.pet-child-containment', value: 'pet-child-containment', order: 3 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q1.options.decorative', value: 'decorative', order: 4 }
        ]
      },
      {
        key: 'fence_length',
        type: 'single',
        i18nKey: 'carpentry.fencing-gates.fence-installation.q2.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q2.options.up-to-10m', value: 'up-to-10m', order: 0 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q2.options.10-25m', value: '10-25m', order: 1 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q2.options.25-50m', value: '25-50m', order: 2 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q2.options.50m-plus', value: '50m-plus', order: 3 }
        ]
      },
      {
        key: 'fence_height',
        type: 'single',
        i18nKey: 'carpentry.fencing-gates.fence-installation.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q3.options.up-to-1m', value: 'up-to-1m', order: 0 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q3.options.1-1.5m', value: '1-1.5m', order: 1 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q3.options.1.5-2m', value: '1.5-2m', order: 2 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q3.options.over-2m', value: 'over-2m', order: 3 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q3.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'material',
        type: 'single',
        i18nKey: 'carpentry.fencing-gates.fence-installation.q4.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q4.options.timber-panels', value: 'timber-panels', order: 0 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q4.options.timber-post-rail', value: 'timber-post-rail', order: 1 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q4.options.composite', value: 'composite', order: 2 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q4.options.metal-mesh', value: 'metal-mesh', order: 3 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q4.options.stone-brick-panels', value: 'stone-brick-panels', order: 4 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q4.options.not-sure', value: 'not-sure', order: 5 }
        ]
      },
      {
        key: 'ground_type',
        type: 'single',
        i18nKey: 'carpentry.fencing-gates.fence-installation.q5.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q5.options.soil-grass', value: 'soil-grass', order: 0 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q5.options.concrete-paving', value: 'concrete-paving', order: 1 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q5.options.mixed-ground', value: 'mixed-ground', order: 2 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q5.options.raised-wall', value: 'raised-wall', order: 3 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q5.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'old_fence',
        type: 'single',
        i18nKey: 'carpentry.fencing-gates.fence-installation.q6.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q6.options.yes-remove-dispose', value: 'yes-remove-dispose', order: 0 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q6.options.yes-i-remove', value: 'yes-i-remove', order: 1 },
          { i18nKey: 'carpentry.fencing-gates.fence-installation.q6.options.no-existing', value: 'no-existing', order: 2 }
        ]
      }
    ]
  },
  {
    microSlug: 'french-doors-installation',
    subcategorySlug: 'doors',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'situation',
        type: 'single',
        i18nKey: 'carpentry.doors.french-doors-installation.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.french-doors-installation.q1.options.replacing-existing', value: 'replacing-existing', order: 0 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q1.options.replacing-window', value: 'replacing-window', order: 1 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q1.options.new-opening', value: 'new-opening', order: 2 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q1.options.replacing-other-door', value: 'replacing-other-door', order: 3 }
        ]
      },
      {
        key: 'door_size',
        type: 'single',
        i18nKey: 'carpentry.doors.french-doors-installation.q2.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.doors.french-doors-installation.q2.options.standard-double', value: 'standard-double', order: 0 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q2.options.extra-wide', value: 'extra-wide', order: 1 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q2.options.not-standard-custom', value: 'not-standard-custom', order: 2 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q2.options.not-sure', value: 'not-sure', order: 3 }
        ]
      },
      {
        key: 'material',
        type: 'single',
        i18nKey: 'carpentry.doors.french-doors-installation.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.french-doors-installation.q3.options.timber', value: 'timber', order: 0 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q3.options.upvc', value: 'upvc', order: 1 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q3.options.aluminium', value: 'aluminium', order: 2 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q3.options.composite', value: 'composite', order: 3 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q3.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'glazing',
        type: 'single',
        i18nKey: 'carpentry.doors.french-doors-installation.q4.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.doors.french-doors-installation.q4.options.standard-double', value: 'standard-double', order: 0 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q4.options.high-efficiency', value: 'high-efficiency', order: 1 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q4.options.acoustic', value: 'acoustic', order: 2 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q4.options.not-sure', value: 'not-sure', order: 3 }
        ]
      },
      {
        key: 'threshold',
        type: 'single',
        i18nKey: 'carpentry.doors.french-doors-installation.q5.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.doors.french-doors-installation.q5.options.standard-step', value: 'standard-step', order: 0 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q5.options.low-flush', value: 'low-flush', order: 1 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q5.options.wheelchair-accessible', value: 'wheelchair-accessible', order: 2 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q5.options.not-sure', value: 'not-sure', order: 3 }
        ]
      },
      {
        key: 'finishing',
        type: 'multi',
        i18nKey: 'carpentry.doors.french-doors-installation.q6.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.doors.french-doors-installation.q6.options.internal-plaster', value: 'internal-plaster', order: 0 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q6.options.external-render', value: 'external-render', order: 1 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q6.options.painting-decorating', value: 'painting-decorating', order: 2 },
          { i18nKey: 'carpentry.doors.french-doors-installation.q6.options.no-additional-work', value: 'no-additional-work', order: 3 }
        ]
      }
    ]
  },
  {
    microSlug: 'gazebo-construction',
    subcategorySlug: 'outdoor-structures',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'gazebo_type',
        type: 'single',
        i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q1.options.pre-made-kit', value: 'pre-made-kit', order: 0 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q1.options.custom-built', value: 'custom-built', order: 1 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q1.options.metal-aluminium', value: 'metal-aluminium', order: 2 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q1.options.not-sure-yet', value: 'not-sure-yet', order: 3 }
        ]
      },
      {
        key: 'size',
        type: 'single',
        i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q2.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q2.options.small', value: 'small', order: 0 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q2.options.medium', value: 'medium', order: 1 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q2.options.large', value: 'large', order: 2 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q2.options.very-large-bespoke', value: 'very-large-bespoke', order: 3 }
        ]
      },
      {
        key: 'roof_style',
        type: 'single',
        i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q3.options.flat', value: 'flat', order: 0 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q3.options.pitched', value: 'pitched', order: 1 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q3.options.hipped', value: 'hipped', order: 2 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q3.options.thatched-look', value: 'thatched-look', order: 3 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q3.options.open-pergola-style', value: 'open-pergola-style', order: 4 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q3.options.not-sure', value: 'not-sure', order: 5 }
        ]
      },
      {
        key: 'base_prepared',
        type: 'single',
        i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q4.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q4.options.yes-solid-level', value: 'yes-solid-level', order: 0 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q4.options.rough-base', value: 'rough-base', order: 1 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q4.options.grass-soil-only', value: 'grass-soil-only', order: 2 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q4.options.not-sure', value: 'not-sure', order: 3 }
        ]
      },
      {
        key: 'features',
        type: 'multi',
        i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q5.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q5.options.balustrades-railings', value: 'balustrades-railings', order: 0 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q5.options.built-in-seating', value: 'built-in-seating', order: 1 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q5.options.lighting-cabling', value: 'lighting-cabling', order: 2 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q5.options.cladding-screening', value: 'cladding-screening', order: 3 },
          { i18nKey: 'carpentry.outdoor-structures.gazebo-construction.q5.options.no-extras', value: 'no-extras', order: 4 }
        ]
      }
    ]
  },
  {
    microSlug: 'pergola-installation',
    subcategorySlug: 'outdoor-structures',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'pergola_type',
        type: 'single',
        i18nKey: 'carpentry.outdoor-structures.pergola-installation.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q1.options.wall-mounted', value: 'wall-mounted', order: 0 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q1.options.free-standing', value: 'free-standing', order: 1 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q1.options.over-deck-terrace', value: 'over-deck-terrace', order: 2 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q1.options.pathway-walkway', value: 'pathway-walkway', order: 3 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q1.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'kit_or_custom',
        type: 'single',
        i18nKey: 'carpentry.outdoor-structures.pergola-installation.q2.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q2.options.flat-pack-kit', value: 'flat-pack-kit', order: 0 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q2.options.custom-design', value: 'custom-design', order: 1 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q2.options.undecided', value: 'undecided', order: 2 }
        ]
      },
      {
        key: 'size',
        type: 'single',
        i18nKey: 'carpentry.outdoor-structures.pergola-installation.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q3.options.up-to-3x3m', value: 'up-to-3x3m', order: 0 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q3.options.3x3-4x4m', value: '3x3-4x4m', order: 1 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q3.options.4x4-5x5m', value: '4x4-5x5m', order: 2 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q3.options.larger-custom', value: 'larger-custom', order: 3 }
        ]
      },
      {
        key: 'material',
        type: 'single',
        i18nKey: 'carpentry.outdoor-structures.pergola-installation.q4.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q4.options.softwood', value: 'softwood', order: 0 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q4.options.hardwood', value: 'hardwood', order: 1 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q4.options.composite-aluminium', value: 'composite-aluminium', order: 2 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q4.options.metal', value: 'metal', order: 3 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q4.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'roofing',
        type: 'single',
        i18nKey: 'carpentry.outdoor-structures.pergola-installation.q5.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q5.options.open-slatted', value: 'open-slatted', order: 0 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q5.options.polycarbonate-glass', value: 'polycarbonate-glass', order: 1 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q5.options.fabric-canopy', value: 'fabric-canopy', order: 2 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q5.options.bioclimatic-louvred', value: 'bioclimatic-louvred', order: 3 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q5.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'base',
        type: 'single',
        i18nKey: 'carpentry.outdoor-structures.pergola-installation.q6.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q6.options.decking', value: 'decking', order: 0 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q6.options.patio-tiles', value: 'patio-tiles', order: 1 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q6.options.concrete-slab', value: 'concrete-slab', order: 2 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q6.options.soil-grass', value: 'soil-grass', order: 3 },
          { i18nKey: 'carpentry.outdoor-structures.pergola-installation.q6.options.mixed-unsure', value: 'mixed-unsure', order: 4 }
        ]
      }
    ]
  },
  {
    microSlug: 'sliding-doors-installation',
    subcategorySlug: 'doors',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'door_type',
        type: 'single',
        i18nKey: 'carpentry.doors.sliding-doors-installation.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q1.options.patio-sliding', value: 'patio-sliding', order: 0 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q1.options.internal-sliding', value: 'internal-sliding', order: 1 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q1.options.pocket-sliding', value: 'pocket-sliding', order: 2 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q1.options.barn-style', value: 'barn-style', order: 3 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q1.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'installation_type',
        type: 'single',
        i18nKey: 'carpentry.doors.sliding-doors-installation.q2.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q2.options.replacing-old-sliding', value: 'replacing-old-sliding', order: 0 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q2.options.replacing-hinged', value: 'replacing-hinged', order: 1 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q2.options.new-opening-required', value: 'new-opening-required', order: 2 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q2.options.not-sure', value: 'not-sure', order: 3 }
        ]
      },
      {
        key: 'material',
        type: 'single',
        i18nKey: 'carpentry.doors.sliding-doors-installation.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q3.options.timber', value: 'timber', order: 0 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q3.options.upvc', value: 'upvc', order: 1 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q3.options.aluminium', value: 'aluminium', order: 2 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q3.options.composite', value: 'composite', order: 3 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q3.options.glass-frameless', value: 'glass-frameless', order: 4 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q3.options.not-sure', value: 'not-sure', order: 5 }
        ]
      },
      {
        key: 'size',
        type: 'single',
        i18nKey: 'carpentry.doors.sliding-doors-installation.q4.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q4.options.standard-size', value: 'standard-size', order: 0 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q4.options.large-multi-panel', value: 'large-multi-panel', order: 1 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q4.options.oversized-custom', value: 'oversized-custom', order: 2 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q4.options.not-sure', value: 'not-sure', order: 3 }
        ]
      },
      {
        key: 'track_system',
        type: 'single',
        i18nKey: 'carpentry.doors.sliding-doors-installation.q5.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q5.options.surface-mounted', value: 'surface-mounted', order: 0 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q5.options.recessed-flush', value: 'recessed-flush', order: 1 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q5.options.ceiling-mounted', value: 'ceiling-mounted', order: 2 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q5.options.pocket-sliding-mechanism', value: 'pocket-sliding-mechanism', order: 3 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q5.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'extra_work',
        type: 'multi',
        i18nKey: 'carpentry.doors.sliding-doors-installation.q6.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q6.options.plastering', value: 'plastering', order: 0 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q6.options.painting', value: 'painting', order: 1 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q6.options.adjusting-opening', value: 'adjusting-opening', order: 2 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q6.options.electrical', value: 'electrical', order: 3 },
          { i18nKey: 'carpentry.doors.sliding-doors-installation.q6.options.none', value: 'none', order: 4 }
        ]
      }
    ]
  },
  {
    microSlug: 'window-frame-replacement',
    subcategorySlug: 'windows',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'window_location',
        type: 'single',
        i18nKey: 'carpentry.windows.window-frame-replacement.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.windows.window-frame-replacement.q1.options.ground-floor', value: 'ground-floor', order: 0 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q1.options.upper-floor', value: 'upper-floor', order: 1 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q1.options.basement', value: 'basement', order: 2 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q1.options.multiple-levels', value: 'multiple-levels', order: 3 }
        ]
      },
      {
        key: 'window_count',
        type: 'single',
        i18nKey: 'carpentry.windows.window-frame-replacement.q2.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.windows.window-frame-replacement.q2.options.1', value: '1', order: 0 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q2.options.2-4', value: '2-4', order: 1 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q2.options.5-8', value: '5-8', order: 2 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q2.options.9-plus', value: '9-plus', order: 3 }
        ]
      },
      {
        key: 'frame_material',
        type: 'single',
        i18nKey: 'carpentry.windows.window-frame-replacement.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.windows.window-frame-replacement.q3.options.timber', value: 'timber', order: 0 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q3.options.hardwood', value: 'hardwood', order: 1 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q3.options.upvc', value: 'upvc', order: 2 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q3.options.aluminium', value: 'aluminium', order: 3 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q3.options.match-existing', value: 'match-existing', order: 4 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q3.options.not-sure', value: 'not-sure', order: 5 }
        ]
      },
      {
        key: 'glazing_type',
        type: 'single',
        i18nKey: 'carpentry.windows.window-frame-replacement.q4.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.windows.window-frame-replacement.q4.options.double-glazing', value: 'double-glazing', order: 0 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q4.options.triple-glazing', value: 'triple-glazing', order: 1 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q4.options.acoustic-glazing', value: 'acoustic-glazing', order: 2 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q4.options.match-existing', value: 'match-existing', order: 3 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q4.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'opening_type',
        type: 'single',
        i18nKey: 'carpentry.windows.window-frame-replacement.q5.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.windows.window-frame-replacement.q5.options.casement', value: 'casement', order: 0 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q5.options.sliding', value: 'sliding', order: 1 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q5.options.tilt-turn', value: 'tilt-turn', order: 2 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q5.options.fixed', value: 'fixed', order: 3 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q5.options.bay-bow', value: 'bay-bow', order: 4 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q5.options.not-sure', value: 'not-sure', order: 5 }
        ]
      },
      {
        key: 'old_frame',
        type: 'single',
        i18nKey: 'carpentry.windows.window-frame-replacement.q6.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.windows.window-frame-replacement.q6.options.yes-remove', value: 'yes-remove', order: 0 },
          { i18nKey: 'carpentry.windows.window-frame-replacement.q6.options.no-removal', value: 'no-removal', order: 1 }
        ]
      }
    ]
  },
  {
    microSlug: 'window-installation',
    subcategorySlug: 'windows',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'installation_type',
        type: 'single',
        i18nKey: 'carpentry.windows.window-installation.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.windows.window-installation.q1.options.replacing-existing', value: 'replacing-existing', order: 0 },
          { i18nKey: 'carpentry.windows.window-installation.q1.options.new-opening', value: 'new-opening', order: 1 },
          { i18nKey: 'carpentry.windows.window-installation.q1.options.door-to-window', value: 'door-to-window', order: 2 },
          { i18nKey: 'carpentry.windows.window-installation.q1.options.other-not-sure', value: 'other-not-sure', order: 3 }
        ]
      },
      {
        key: 'window_style',
        type: 'single',
        i18nKey: 'carpentry.windows.window-installation.q2.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.windows.window-installation.q2.options.casement', value: 'casement', order: 0 },
          { i18nKey: 'carpentry.windows.window-installation.q2.options.sliding', value: 'sliding', order: 1 },
          { i18nKey: 'carpentry.windows.window-installation.q2.options.tilt-turn', value: 'tilt-turn', order: 2 },
          { i18nKey: 'carpentry.windows.window-installation.q2.options.fixed', value: 'fixed', order: 3 },
          { i18nKey: 'carpentry.windows.window-installation.q2.options.bay-bow', value: 'bay-bow', order: 4 },
          { i18nKey: 'carpentry.windows.window-installation.q2.options.roof-window', value: 'roof-window', order: 5 },
          { i18nKey: 'carpentry.windows.window-installation.q2.options.not-sure', value: 'not-sure', order: 6 }
        ]
      },
      {
        key: 'material',
        type: 'single',
        i18nKey: 'carpentry.windows.window-installation.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.windows.window-installation.q3.options.upvc', value: 'upvc', order: 0 },
          { i18nKey: 'carpentry.windows.window-installation.q3.options.timber', value: 'timber', order: 1 },
          { i18nKey: 'carpentry.windows.window-installation.q3.options.aluminium', value: 'aluminium', order: 2 },
          { i18nKey: 'carpentry.windows.window-installation.q3.options.composite', value: 'composite', order: 3 },
          { i18nKey: 'carpentry.windows.window-installation.q3.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'glazing',
        type: 'single',
        i18nKey: 'carpentry.windows.window-installation.q4.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.windows.window-installation.q4.options.standard-double', value: 'standard-double', order: 0 },
          { i18nKey: 'carpentry.windows.window-installation.q4.options.triple-glazing', value: 'triple-glazing', order: 1 },
          { i18nKey: 'carpentry.windows.window-installation.q4.options.acoustic-glazing', value: 'acoustic-glazing', order: 2 },
          { i18nKey: 'carpentry.windows.window-installation.q4.options.solar-control', value: 'solar-control', order: 3 },
          { i18nKey: 'carpentry.windows.window-installation.q4.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'count',
        type: 'single',
        i18nKey: 'carpentry.windows.window-installation.q5.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.windows.window-installation.q5.options.1', value: '1', order: 0 },
          { i18nKey: 'carpentry.windows.window-installation.q5.options.2-4', value: '2-4', order: 1 },
          { i18nKey: 'carpentry.windows.window-installation.q5.options.5-8', value: '5-8', order: 2 },
          { i18nKey: 'carpentry.windows.window-installation.q5.options.9-plus', value: '9-plus', order: 3 }
        ]
      },
      {
        key: 'extra_work',
        type: 'multi',
        i18nKey: 'carpentry.windows.window-installation.q6.title',
        required: false,
        options: [
          { i18nKey: 'carpentry.windows.window-installation.q6.options.plastering', value: 'plastering', order: 0 },
          { i18nKey: 'carpentry.windows.window-installation.q6.options.painting', value: 'painting', order: 1 },
          { i18nKey: 'carpentry.windows.window-installation.q6.options.external-rendering', value: 'external-rendering', order: 2 },
          { i18nKey: 'carpentry.windows.window-installation.q6.options.none', value: 'none', order: 3 }
        ]
      }
    ]
  },
  {
    microSlug: 'window-repair',
    subcategorySlug: 'windows',
    categorySlug: 'carpentry',
    questions: [
      {
        key: 'issue_type',
        type: 'multi',
        i18nKey: 'carpentry.windows.window-repair.q1.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.windows.window-repair.q1.options.broken-glass', value: 'broken-glass', order: 0 },
          { i18nKey: 'carpentry.windows.window-repair.q1.options.condensation', value: 'condensation', order: 1 },
          { i18nKey: 'carpentry.windows.window-repair.q1.options.frame-damage', value: 'frame-damage', order: 2 },
          { i18nKey: 'carpentry.windows.window-repair.q1.options.hardware-issue', value: 'hardware-issue', order: 3 },
          { i18nKey: 'carpentry.windows.window-repair.q1.options.drafts-sealing', value: 'drafts-sealing', order: 4 },
          { i18nKey: 'carpentry.windows.window-repair.q1.options.other', value: 'other', order: 5 }
        ]
      },
      {
        key: 'window_type',
        type: 'single',
        i18nKey: 'carpentry.windows.window-repair.q2.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.windows.window-repair.q2.options.casement', value: 'casement', order: 0 },
          { i18nKey: 'carpentry.windows.window-repair.q2.options.sliding', value: 'sliding', order: 1 },
          { i18nKey: 'carpentry.windows.window-repair.q2.options.tilt-turn', value: 'tilt-turn', order: 2 },
          { i18nKey: 'carpentry.windows.window-repair.q2.options.fixed', value: 'fixed', order: 3 },
          { i18nKey: 'carpentry.windows.window-repair.q2.options.roof-window', value: 'roof-window', order: 4 },
          { i18nKey: 'carpentry.windows.window-repair.q2.options.not-sure', value: 'not-sure', order: 5 }
        ]
      },
      {
        key: 'material',
        type: 'single',
        i18nKey: 'carpentry.windows.window-repair.q3.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.windows.window-repair.q3.options.upvc', value: 'upvc', order: 0 },
          { i18nKey: 'carpentry.windows.window-repair.q3.options.timber', value: 'timber', order: 1 },
          { i18nKey: 'carpentry.windows.window-repair.q3.options.aluminium', value: 'aluminium', order: 2 },
          { i18nKey: 'carpentry.windows.window-repair.q3.options.composite', value: 'composite', order: 3 },
          { i18nKey: 'carpentry.windows.window-repair.q3.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'floor_level',
        type: 'single',
        i18nKey: 'carpentry.windows.window-repair.q4.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.windows.window-repair.q4.options.ground-floor', value: 'ground-floor', order: 0 },
          { i18nKey: 'carpentry.windows.window-repair.q4.options.first-floor', value: 'first-floor', order: 1 },
          { i18nKey: 'carpentry.windows.window-repair.q4.options.second-floor-higher', value: 'second-floor-higher', order: 2 },
          { i18nKey: 'carpentry.windows.window-repair.q4.options.multiple-floors', value: 'multiple-floors', order: 3 }
        ]
      },
      {
        key: 'urgency',
        type: 'single',
        i18nKey: 'carpentry.windows.window-repair.q5.title',
        required: true,
        options: [
          { i18nKey: 'carpentry.windows.window-repair.q5.options.emergency', value: 'emergency', order: 0 },
          { i18nKey: 'carpentry.windows.window-repair.q5.options.within-24-48h', value: 'within-24-48h', order: 1 },
          { i18nKey: 'carpentry.windows.window-repair.q5.options.within-week', value: 'within-week', order: 2 },
          { i18nKey: 'carpentry.windows.window-repair.q5.options.not-urgent', value: 'not-urgent', order: 3 }
        ]
      }
    ]
  },
  {
    microSlug: 'bifold-large-sliding-doors',
    subcategorySlug: 'doors',
    categorySlug: 'floors-doors-windows',
    questions: [
      {
        key: 'door_type',
        type: 'single',
        i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q1.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q1.options.bifold-doors', value: 'bifold-doors', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q1.options.sliding-doors', value: 'sliding-doors', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q1.options.lift-slide', value: 'lift-slide', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q1.options.slimline-aluminium', value: 'slimline-aluminium', order: 3 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q1.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'installation_type',
        type: 'single',
        i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q2.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q2.options.replacing-existing', value: 'replacing-existing', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q2.options.replacing-window', value: 'replacing-window', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q2.options.new-opening', value: 'new-opening', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q2.options.not-sure', value: 'not-sure', order: 3 }
        ]
      },
      {
        key: 'material',
        type: 'single',
        i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q3.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q3.options.aluminium', value: 'aluminium', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q3.options.upvc', value: 'upvc', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q3.options.timber', value: 'timber', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q3.options.composite', value: 'composite', order: 3 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q3.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'opening_size',
        type: 'single',
        i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q4.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q4.options.up-to-2m', value: 'up-to-2m', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q4.options.2-3m', value: '2-3m', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q4.options.3-4m', value: '3-4m', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q4.options.4-6m', value: '4-6m', order: 3 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q4.options.6m-plus', value: '6m-plus', order: 4 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q4.options.not-sure', value: 'not-sure', order: 5 }
        ]
      },
      {
        key: 'threshold_type',
        type: 'single',
        i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q5.title',
        required: false,
        options: [
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q5.options.standard', value: 'standard', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q5.options.flush-low', value: 'flush-low', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q5.options.wheelchair-accessible', value: 'wheelchair-accessible', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q5.options.not-sure', value: 'not-sure', order: 3 }
        ]
      },
      {
        key: 'extra_work',
        type: 'multi',
        i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q6.title',
        required: false,
        options: [
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q6.options.structural-support', value: 'structural-support', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q6.options.plastering', value: 'plastering', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q6.options.rendering', value: 'rendering', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q6.options.making-good', value: 'making-good', order: 3 },
          { i18nKey: 'floors-doors-windows.doors.bifold-large-sliding-doors.q6.options.none', value: 'none', order: 4 }
        ]
      }
    ]
  },
  {
    microSlug: 'door-frames-linings',
    subcategorySlug: 'doors',
    categorySlug: 'floors-doors-windows',
    questions: [
      {
        key: 'work_type',
        type: 'single',
        i18nKey: 'floors-doors-windows.doors.door-frames-linings.q1.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q1.options.install-new', value: 'install-new', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q1.options.replace-old', value: 'replace-old', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q1.options.repair-existing', value: 'repair-existing', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q1.options.not-sure', value: 'not-sure', order: 3 }
        ]
      },
      {
        key: 'door_type',
        type: 'single',
        i18nKey: 'floors-doors-windows.doors.door-frames-linings.q2.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q2.options.internal-door', value: 'internal-door', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q2.options.front-door', value: 'front-door', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q2.options.back-door', value: 'back-door', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q2.options.patio-door', value: 'patio-door', order: 3 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q2.options.other', value: 'other', order: 4 }
        ]
      },
      {
        key: 'material',
        type: 'single',
        i18nKey: 'floors-doors-windows.doors.door-frames-linings.q3.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q3.options.softwood', value: 'softwood', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q3.options.hardwood', value: 'hardwood', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q3.options.metal', value: 'metal', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q3.options.composite', value: 'composite', order: 3 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q3.options.match-existing', value: 'match-existing', order: 4 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q3.options.not-sure', value: 'not-sure', order: 5 }
        ]
      },
      {
        key: 'frame_condition',
        type: 'single',
        i18nKey: 'floors-doors-windows.doors.door-frames-linings.q4.title',
        required: false,
        options: [
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q4.options.good', value: 'good', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q4.options.minor-damage', value: 'minor-damage', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q4.options.severely-damaged', value: 'severely-damaged', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q4.options.rotten-mould', value: 'rotten-mould', order: 3 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q4.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'additions',
        type: 'multi',
        i18nKey: 'floors-doors-windows.doors.door-frames-linings.q5.title',
        required: false,
        options: [
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q5.options.architrave', value: 'architrave', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q5.options.door-hanging', value: 'door-hanging', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q5.options.painting', value: 'painting', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.door-frames-linings.q5.options.none', value: 'none', order: 3 }
        ]
      }
    ]
  },
  {
    microSlug: 'door-hardware-locks',
    subcategorySlug: 'doors',
    categorySlug: 'floors-doors-windows',
    questions: [
      {
        key: 'hardware_type',
        type: 'multi',
        i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q1.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q1.options.handle', value: 'handle', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q1.options.lock', value: 'lock', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q1.options.latch', value: 'latch', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q1.options.deadbolt', value: 'deadbolt', order: 3 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q1.options.hinges', value: 'hinges', order: 4 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q1.options.door-closer', value: 'door-closer', order: 5 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q1.options.multiple-items', value: 'multiple-items', order: 6 }
        ]
      },
      {
        key: 'door_type',
        type: 'single',
        i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q2.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q2.options.internal-door', value: 'internal-door', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q2.options.front-door', value: 'front-door', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q2.options.back-door', value: 'back-door', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q2.options.patio-door', value: 'patio-door', order: 3 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q2.options.upvc-aluminium', value: 'upvc-aluminium', order: 4 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q2.options.other', value: 'other', order: 5 }
        ]
      },
      {
        key: 'security_level',
        type: 'single',
        i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q3.title',
        required: false,
        options: [
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q3.options.standard-domestic', value: 'standard-domestic', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q3.options.high-security', value: 'high-security', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q3.options.insurance-rated', value: 'insurance-rated', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q3.options.smart-lock', value: 'smart-lock', order: 3 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q3.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'hardware_supplied',
        type: 'single',
        i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q4.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q4.options.yes-supply-only', value: 'yes-supply-only', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q4.options.no-supply-needed', value: 'no-supply-needed', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q4.options.some-supplied', value: 'some-supplied', order: 2 }
        ]
      },
      {
        key: 'extras',
        type: 'multi',
        i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q5.title',
        required: false,
        options: [
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q5.options.adjust-alignment', value: 'adjust-alignment', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q5.options.fix-sticking', value: 'fix-sticking', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q5.options.replace-hinges', value: 'replace-hinges', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.door-hardware-locks.q5.options.none', value: 'none', order: 3 }
        ]
      }
    ]
  },
  {
    microSlug: 'double-glazing-upgrades',
    subcategorySlug: 'windows',
    categorySlug: 'floors-doors-windows',
    questions: [
      {
        key: 'window_count',
        type: 'single',
        i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q1.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q1.options.1', value: '1', order: 0 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q1.options.2-4', value: '2-4', order: 1 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q1.options.5-8', value: '5-8', order: 2 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q1.options.9-15', value: '9-15', order: 3 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q1.options.15-plus', value: '15-plus', order: 4 }
        ]
      },
      {
        key: 'upgrade_type',
        type: 'single',
        i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q2.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q2.options.replace-glass-only', value: 'replace-glass-only', order: 0 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q2.options.replace-full-units', value: 'replace-full-units', order: 1 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q2.options.upgrade-triple', value: 'upgrade-triple', order: 2 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q2.options.acoustic-soundproof', value: 'acoustic-soundproof', order: 3 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q2.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'window_type',
        type: 'single',
        i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q3.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q3.options.casement', value: 'casement', order: 0 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q3.options.sliding', value: 'sliding', order: 1 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q3.options.tilt-turn', value: 'tilt-turn', order: 2 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q3.options.fixed', value: 'fixed', order: 3 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q3.options.bay-bow', value: 'bay-bow', order: 4 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q3.options.mixed-unsure', value: 'mixed-unsure', order: 5 }
        ]
      },
      {
        key: 'frame_material',
        type: 'single',
        i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q4.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q4.options.upvc', value: 'upvc', order: 0 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q4.options.timber', value: 'timber', order: 1 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q4.options.aluminium', value: 'aluminium', order: 2 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q4.options.composite', value: 'composite', order: 3 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q4.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'issues_present',
        type: 'multi',
        i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q5.title',
        required: false,
        options: [
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q5.options.condensation', value: 'condensation', order: 0 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q5.options.drafts', value: 'drafts', order: 1 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q5.options.broken-seals', value: 'broken-seals', order: 2 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q5.options.broken-glass', value: 'broken-glass', order: 3 },
          { i18nKey: 'floors-doors-windows.windows.double-glazing-upgrades.q5.options.no-issues', value: 'no-issues', order: 4 }
        ]
      }
    ]
  },
  {
    microSlug: 'exterior-doors',
    subcategorySlug: 'doors',
    categorySlug: 'floors-doors-windows',
    questions: [
      {
        key: 'door_type',
        type: 'single',
        i18nKey: 'floors-doors-windows.doors.exterior-doors.q1.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q1.options.front-door', value: 'front-door', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q1.options.back-door', value: 'back-door', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q1.options.side-door', value: 'side-door', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q1.options.garage-side-entry', value: 'garage-side-entry', order: 3 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q1.options.other', value: 'other', order: 4 }
        ]
      },
      {
        key: 'material',
        type: 'single',
        i18nKey: 'floors-doors-windows.doors.exterior-doors.q2.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q2.options.composite', value: 'composite', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q2.options.upvc', value: 'upvc', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q2.options.aluminium', value: 'aluminium', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q2.options.timber', value: 'timber', order: 3 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q2.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'installation_type',
        type: 'single',
        i18nKey: 'floors-doors-windows.doors.exterior-doors.q3.title',
        required: true,
        options: [
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q3.options.replacing-existing', value: 'replacing-existing', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q3.options.new-opening', value: 'new-opening', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q3.options.replacing-window', value: 'replacing-window', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q3.options.not-sure', value: 'not-sure', order: 3 }
        ]
      },
      {
        key: 'security_level',
        type: 'single',
        i18nKey: 'floors-doors-windows.doors.exterior-doors.q4.title',
        required: false,
        options: [
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q4.options.standard-domestic', value: 'standard-domestic', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q4.options.high-security', value: 'high-security', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q4.options.insurance-rated', value: 'insurance-rated', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q4.options.smart-security', value: 'smart-security', order: 3 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q4.options.not-sure', value: 'not-sure', order: 4 }
        ]
      },
      {
        key: 'extras',
        type: 'multi',
        i18nKey: 'floors-doors-windows.doors.exterior-doors.q5.title',
        required: false,
        options: [
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q5.options.install-frame', value: 'install-frame', order: 0 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q5.options.architrave-trim', value: 'architrave-trim', order: 1 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q5.options.plastering', value: 'plastering', order: 2 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q5.options.painting', value: 'painting', order: 3 },
          { i18nKey: 'floors-doors-windows.doors.exterior-doors.q5.options.none', value: 'none', order: 4 }
        ]
      }
    ]
  }
];
