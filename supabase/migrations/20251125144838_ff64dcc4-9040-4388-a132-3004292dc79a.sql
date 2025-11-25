-- Create Interior Design micro-service
INSERT INTO service_micro_categories (
  id,
  name,
  slug,
  subcategory_id,
  display_order,
  created_at
) VALUES (
  '158488a7-e5b2-4dfb-8254-e3507d989b0c',
  'Interior Design',
  'interior-design',
  '04c0a208-5cc7-4542-9af4-c34ab9171114',
  3,
  now()
);

-- Insert Interior Design question pack
INSERT INTO question_packs (
  pack_id,
  micro_slug,
  version,
  status,
  source,
  content,
  is_active,
  created_at
) VALUES (
  gen_random_uuid(),
  'interior-design',
  1,
  'approved',
  'manual',
  '{
    "id": "158488a7-e5b2-4dfb-8254-e3507d989b0c",
    "category": "architects-design",
    "name": "Interior Design",
    "slug": "interior-design",
    "i18nPrefix": "architectsDesign.interiorDesign",
    "questions": [
      {
        "key": "style_direction",
        "type": "single",
        "i18nKey": "architectsDesign.interiorDesign.questions.style_direction.title",
        "required": true,
        "aiHint": "Overall interior style direction the client prefers.",
        "options": [
          {"i18nKey": "architectsDesign.interiorDesign.questions.style_direction.options.modern", "value": "modern", "order": 0},
          {"i18nKey": "architectsDesign.interiorDesign.questions.style_direction.options.minimalist", "value": "minimalist", "order": 1},
          {"i18nKey": "architectsDesign.interiorDesign.questions.style_direction.options.scandinavian", "value": "scandinavian", "order": 2},
          {"i18nKey": "architectsDesign.interiorDesign.questions.style_direction.options.rustic", "value": "rustic", "order": 3},
          {"i18nKey": "architectsDesign.interiorDesign.questions.style_direction.options.industrial", "value": "industrial", "order": 4},
          {"i18nKey": "architectsDesign.interiorDesign.questions.style_direction.options.mediterranean", "value": "mediterranean", "order": 5},
          {"i18nKey": "architectsDesign.interiorDesign.questions.style_direction.options.open_to_proposals", "value": "open_to_proposals", "order": 6}
        ]
      },
      {
        "key": "inspiration_materials",
        "type": "single",
        "i18nKey": "architectsDesign.interiorDesign.questions.inspiration_materials.title",
        "required": true,
        "aiHint": "What kind of reference materials the client already has.",
        "options": [
          {"i18nKey": "architectsDesign.interiorDesign.questions.inspiration_materials.options.mood_boards", "value": "mood_boards", "order": 0},
          {"i18nKey": "architectsDesign.interiorDesign.questions.inspiration_materials.options.social_screenshots", "value": "social_screenshots", "order": 1},
          {"i18nKey": "architectsDesign.interiorDesign.questions.inspiration_materials.options.previous_designs", "value": "previous_designs", "order": 2},
          {"i18nKey": "architectsDesign.interiorDesign.questions.inspiration_materials.options.none", "value": "none", "order": 3}
        ]
      },
      {
        "key": "design_scope",
        "type": "single",
        "i18nKey": "architectsDesign.interiorDesign.questions.design_scope.title",
        "required": true,
        "aiHint": "What aspects of the interior require design work.",
        "options": [
          {"i18nKey": "architectsDesign.interiorDesign.questions.design_scope.options.furniture_layout", "value": "furniture_layout", "order": 0},
          {"i18nKey": "architectsDesign.interiorDesign.questions.design_scope.options.colour_palette", "value": "colour_palette", "order": 1},
          {"i18nKey": "architectsDesign.interiorDesign.questions.design_scope.options.materials_finishes", "value": "materials_finishes", "order": 2},
          {"i18nKey": "architectsDesign.interiorDesign.questions.design_scope.options.lighting_plan", "value": "lighting_plan", "order": 3},
          {"i18nKey": "architectsDesign.interiorDesign.questions.design_scope.options.full_concept", "value": "full_concept", "order": 4}
        ]
      },
      {
        "key": "sourcing_required",
        "type": "single",
        "i18nKey": "architectsDesign.interiorDesign.questions.sourcing_required.title",
        "required": true,
        "aiHint": "Whether the designer should source furniture and materials.",
        "options": [
          {"i18nKey": "architectsDesign.interiorDesign.questions.sourcing_required.options.yes", "value": "yes", "order": 0},
          {"i18nKey": "architectsDesign.interiorDesign.questions.sourcing_required.options.no", "value": "no", "order": 1},
          {"i18nKey": "architectsDesign.interiorDesign.questions.sourcing_required.options.depends_on_concept", "value": "depends_on_concept", "order": 2}
        ]
      },
      {
        "key": "structure_flexibility",
        "type": "single",
        "i18nKey": "architectsDesign.interiorDesign.questions.structure_flexibility.title",
        "required": true,
        "aiHint": "How flexible the current room structure is.",
        "options": [
          {"i18nKey": "architectsDesign.interiorDesign.questions.structure_flexibility.options.structural_changes_allowed", "value": "structural_changes_allowed", "order": 0},
          {"i18nKey": "architectsDesign.interiorDesign.questions.structure_flexibility.options.cosmetic_changes_only", "value": "cosmetic_changes_only", "order": 1},
          {"i18nKey": "architectsDesign.interiorDesign.questions.structure_flexibility.options.no_changes", "value": "no_changes", "order": 2}
        ]
      },
      {
        "key": "must_keep_elements",
        "type": "single",
        "i18nKey": "architectsDesign.interiorDesign.questions.must_keep_elements.title",
        "required": true,
        "aiHint": "Existing items or finishes that must remain in the design.",
        "options": [
          {"i18nKey": "architectsDesign.interiorDesign.questions.must_keep_elements.options.furniture", "value": "furniture", "order": 0},
          {"i18nKey": "architectsDesign.interiorDesign.questions.must_keep_elements.options.built_ins", "value": "built_ins", "order": 1},
          {"i18nKey": "architectsDesign.interiorDesign.questions.must_keep_elements.options.flooring", "value": "flooring", "order": 2},
          {"i18nKey": "architectsDesign.interiorDesign.questions.must_keep_elements.options.wall_finishes", "value": "wall_finishes", "order": 3},
          {"i18nKey": "architectsDesign.interiorDesign.questions.must_keep_elements.options.none", "value": "none", "order": 4}
        ]
      },
      {
        "key": "desired_atmosphere",
        "type": "single",
        "i18nKey": "architectsDesign.interiorDesign.questions.desired_atmosphere.title",
        "required": true,
        "aiHint": "The feeling or mood the client wants the space to create.",
        "options": [
          {"i18nKey": "architectsDesign.interiorDesign.questions.desired_atmosphere.options.warm_cozy", "value": "warm_cozy", "order": 0},
          {"i18nKey": "architectsDesign.interiorDesign.questions.desired_atmosphere.options.clean_bright", "value": "clean_bright", "order": 1},
          {"i18nKey": "architectsDesign.interiorDesign.questions.desired_atmosphere.options.luxurious", "value": "luxurious", "order": 2},
          {"i18nKey": "architectsDesign.interiorDesign.questions.desired_atmosphere.options.artistic", "value": "artistic", "order": 3},
          {"i18nKey": "architectsDesign.interiorDesign.questions.desired_atmosphere.options.functional_efficient", "value": "functional_efficient", "order": 4}
        ]
      }
    ]
  }'::jsonb,
  true,
  now()
);