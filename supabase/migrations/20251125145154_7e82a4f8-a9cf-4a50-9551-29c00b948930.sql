-- Insert 3D Visualization question pack
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
  '3d-visualization',
  1,
  'approved',
  'manual',
  $json${
    "id": "de6d632d-6c2b-4aaf-81bf-14eb33b1b581",
    "category": "architects-design",
    "name": "3D Visualization",
    "slug": "3d-visualization",
    "i18nPrefix": "architectsDesign.visualization3d",
    "questions": [
      {
        "key": "visualization_type",
        "type": "single",
        "i18nKey": "architectsDesign.visualization3d.questions.visualization_type.title",
        "required": true,
        "aiHint": "Whether the visualisation is interior, exterior, product or full property.",
        "options": [
          {"i18nKey": "architectsDesign.visualization3d.questions.visualization_type.options.interior", "value": "interior", "order": 0},
          {"i18nKey": "architectsDesign.visualization3d.questions.visualization_type.options.exterior", "value": "exterior", "order": 1},
          {"i18nKey": "architectsDesign.visualization3d.questions.visualization_type.options.product_design", "value": "product_design", "order": 2},
          {"i18nKey": "architectsDesign.visualization3d.questions.visualization_type.options.full_property", "value": "full_property", "order": 3},
          {"i18nKey": "architectsDesign.visualization3d.questions.visualization_type.options.landscape", "value": "landscape", "order": 4},
          {"i18nKey": "architectsDesign.visualization3d.questions.visualization_type.options.architectural_concept", "value": "architectural_concept", "order": 5}
        ]
      },
      {
        "key": "project_stage",
        "type": "single",
        "i18nKey": "architectsDesign.visualization3d.questions.project_stage.title",
        "required": true,
        "aiHint": "How developed the underlying design is when requesting 3D work.",
        "options": [
          {"i18nKey": "architectsDesign.visualization3d.questions.project_stage.options.concept_stage", "value": "concept_stage", "order": 0},
          {"i18nKey": "architectsDesign.visualization3d.questions.project_stage.options.floorplan_ready", "value": "floorplan_ready", "order": 1},
          {"i18nKey": "architectsDesign.visualization3d.questions.project_stage.options.full_design_ready", "value": "full_design_ready", "order": 2},
          {"i18nKey": "architectsDesign.visualization3d.questions.project_stage.options.sketches_only", "value": "sketches_only", "order": 3}
        ]
      },
      {
        "key": "output_format",
        "type": "single",
        "i18nKey": "architectsDesign.visualization3d.questions.output_format.title",
        "required": true,
        "aiHint": "What output formats are required from the 3D artist.",
        "options": [
          {"i18nKey": "architectsDesign.visualization3d.questions.output_format.options.static_renders", "value": "static_renders", "order": 0},
          {"i18nKey": "architectsDesign.visualization3d.questions.output_format.options.views_360", "value": "views_360", "order": 1},
          {"i18nKey": "architectsDesign.visualization3d.questions.output_format.options.walkthrough_animation", "value": "walkthrough_animation", "order": 2},
          {"i18nKey": "architectsDesign.visualization3d.questions.output_format.options.multiple_formats", "value": "multiple_formats", "order": 3}
        ]
      },
      {
        "key": "existing_files",
        "type": "single",
        "i18nKey": "architectsDesign.visualization3d.questions.existing_files.title",
        "required": true,
        "aiHint": "What base files or references already exist for the 3D work.",
        "options": [
          {"i18nKey": "architectsDesign.visualization3d.questions.existing_files.options.cad_or_3d", "value": "cad_or_3d", "order": 0},
          {"i18nKey": "architectsDesign.visualization3d.questions.existing_files.options.basic_sketches", "value": "basic_sketches", "order": 1},
          {"i18nKey": "architectsDesign.visualization3d.questions.existing_files.options.none", "value": "none", "order": 2}
        ]
      },
      {
        "key": "realism_level",
        "type": "single",
        "i18nKey": "architectsDesign.visualization3d.questions.realism_level.title",
        "required": true,
        "aiHint": "How realistic the 3D images or animations should appear.",
        "options": [
          {"i18nKey": "architectsDesign.visualization3d.questions.realism_level.options.photorealistic", "value": "photorealistic", "order": 0},
          {"i18nKey": "architectsDesign.visualization3d.questions.realism_level.options.stylised", "value": "stylised", "order": 1},
          {"i18nKey": "architectsDesign.visualization3d.questions.realism_level.options.conceptual", "value": "conceptual", "order": 2},
          {"i18nKey": "architectsDesign.visualization3d.questions.realism_level.options.fast_draft", "value": "fast_draft", "order": 3}
        ]
      },
      {
        "key": "match_materials_lighting",
        "type": "single",
        "i18nKey": "architectsDesign.visualization3d.questions.match_materials_lighting.title",
        "required": true,
        "aiHint": "Whether specific materials and lighting need to be matched in the render.",
        "options": [
          {"i18nKey": "architectsDesign.visualization3d.questions.match_materials_lighting.options.exact_spec", "value": "exact_spec", "order": 0},
          {"i18nKey": "architectsDesign.visualization3d.questions.match_materials_lighting.options.approximate", "value": "approximate", "order": 1},
          {"i18nKey": "architectsDesign.visualization3d.questions.match_materials_lighting.options.designer_choice", "value": "designer_choice", "order": 2}
        ]
      },
      {
        "key": "number_of_scenes",
        "type": "single",
        "i18nKey": "architectsDesign.visualization3d.questions.number_of_scenes.title",
        "required": true,
        "aiHint": "Rough number of viewpoints or scenes the client needs rendered.",
        "options": [
          {"i18nKey": "architectsDesign.visualization3d.questions.number_of_scenes.options.one_to_two", "value": "one_to_two", "order": 0},
          {"i18nKey": "architectsDesign.visualization3d.questions.number_of_scenes.options.three_to_five", "value": "three_to_five", "order": 1},
          {"i18nKey": "architectsDesign.visualization3d.questions.number_of_scenes.options.six_plus", "value": "six_plus", "order": 2},
          {"i18nKey": "architectsDesign.visualization3d.questions.number_of_scenes.options.not_sure", "value": "not_sure", "order": 3}
        ]
      }
    ]
  }$json$::jsonb,
  true,
  now()
);

-- Insert Space Planning question pack
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
  'space-planning',
  1,
  'approved',
  'manual',
  $json${
    "id": "591fce6f-dc0c-448d-943f-b2f190790017",
    "category": "architects-design",
    "name": "Space Planning",
    "slug": "space-planning",
    "i18nPrefix": "architectsDesign.spacePlanning",
    "questions": [
      {
        "key": "primary_goal",
        "type": "single",
        "i18nKey": "architectsDesign.spacePlanning.questions.primary_goal.title",
        "required": true,
        "aiHint": "Main objective of the space planning work.",
        "options": [
          {"i18nKey": "architectsDesign.spacePlanning.questions.primary_goal.options.flow_improvement", "value": "flow_improvement", "order": 0},
          {"i18nKey": "architectsDesign.spacePlanning.questions.primary_goal.options.better_furniture_placement", "value": "better_furniture_placement", "order": 1},
          {"i18nKey": "architectsDesign.spacePlanning.questions.primary_goal.options.maximising_space", "value": "maximising_space", "order": 2},
          {"i18nKey": "architectsDesign.spacePlanning.questions.primary_goal.options.re_zoning", "value": "re_zoning", "order": 3},
          {"i18nKey": "architectsDesign.spacePlanning.questions.primary_goal.options.storage_optimisation", "value": "storage_optimisation", "order": 4}
        ]
      },
      {
        "key": "current_use",
        "type": "single",
        "i18nKey": "architectsDesign.spacePlanning.questions.current_use.title",
        "required": true,
        "aiHint": "How the space is currently being used in everyday life.",
        "options": [
          {"i18nKey": "architectsDesign.spacePlanning.questions.current_use.options.living", "value": "living", "order": 0},
          {"i18nKey": "architectsDesign.spacePlanning.questions.current_use.options.working", "value": "working", "order": 1},
          {"i18nKey": "architectsDesign.spacePlanning.questions.current_use.options.storage", "value": "storage", "order": 2},
          {"i18nKey": "architectsDesign.spacePlanning.questions.current_use.options.mixed_use", "value": "mixed_use", "order": 3},
          {"i18nKey": "architectsDesign.spacePlanning.questions.current_use.options.unclear", "value": "unclear", "order": 4}
        ]
      },
      {
        "key": "layout_change_flexibility",
        "type": "single",
        "i18nKey": "architectsDesign.spacePlanning.questions.layout_change_flexibility.title",
        "required": true,
        "aiHint": "How open the client is to structural vs furniture-only changes.",
        "options": [
          {"i18nKey": "architectsDesign.spacePlanning.questions.layout_change_flexibility.options.full_remodelling", "value": "full_remodelling", "order": 0},
          {"i18nKey": "architectsDesign.spacePlanning.questions.layout_change_flexibility.options.minor_changes", "value": "minor_changes", "order": 1},
          {"i18nKey": "architectsDesign.spacePlanning.questions.layout_change_flexibility.options.furniture_only", "value": "furniture_only", "order": 2}
        ]
      },
      {
        "key": "required_zones",
        "type": "multi",
        "i18nKey": "architectsDesign.spacePlanning.questions.required_zones.title",
        "required": true,
        "aiHint": "Functional zones that must be considered in the space plan.",
        "options": [
          {"i18nKey": "architectsDesign.spacePlanning.questions.required_zones.options.living", "value": "living", "order": 0},
          {"i18nKey": "architectsDesign.spacePlanning.questions.required_zones.options.dining", "value": "dining", "order": 1},
          {"i18nKey": "architectsDesign.spacePlanning.questions.required_zones.options.sleeping", "value": "sleeping", "order": 2},
          {"i18nKey": "architectsDesign.spacePlanning.questions.required_zones.options.office", "value": "office", "order": 3},
          {"i18nKey": "architectsDesign.spacePlanning.questions.required_zones.options.storage", "value": "storage", "order": 4},
          {"i18nKey": "architectsDesign.spacePlanning.questions.required_zones.options.kitchen_interaction", "value": "kitchen_interaction", "order": 5},
          {"i18nKey": "architectsDesign.spacePlanning.questions.required_zones.options.flexible_space", "value": "flexible_space", "order": 6}
        ]
      },
      {
        "key": "constraints",
        "type": "multi",
        "i18nKey": "architectsDesign.spacePlanning.questions.constraints.title",
        "required": true,
        "aiHint": "Technical or structural constraints that must be respected.",
        "options": [
          {"i18nKey": "architectsDesign.spacePlanning.questions.constraints.options.fixed_plumbing", "value": "fixed_plumbing", "order": 0},
          {"i18nKey": "architectsDesign.spacePlanning.questions.constraints.options.fixed_electrical", "value": "fixed_electrical", "order": 1},
          {"i18nKey": "architectsDesign.spacePlanning.questions.constraints.options.load_bearing_walls", "value": "load_bearing_walls", "order": 2},
          {"i18nKey": "architectsDesign.spacePlanning.questions.constraints.options.built_ins", "value": "built_ins", "order": 3},
          {"i18nKey": "architectsDesign.spacePlanning.questions.constraints.options.none", "value": "none", "order": 4}
        ]
      },
      {
        "key": "existing_furniture_requirement",
        "type": "single",
        "i18nKey": "architectsDesign.spacePlanning.questions.existing_furniture_requirement.title",
        "required": true,
        "aiHint": "How much existing furniture must be kept and integrated.",
        "options": [
          {"i18nKey": "architectsDesign.spacePlanning.questions.existing_furniture_requirement.options.multiple_pieces", "value": "multiple_pieces", "order": 0},
          {"i18nKey": "architectsDesign.spacePlanning.questions.existing_furniture_requirement.options.few_pieces", "value": "few_pieces", "order": 1},
          {"i18nKey": "architectsDesign.spacePlanning.questions.existing_furniture_requirement.options.none", "value": "none", "order": 2}
        ]
      },
      {
        "key": "main_problem",
        "type": "single",
        "i18nKey": "architectsDesign.spacePlanning.questions.main_problem.title",
        "required": true,
        "aiHint": "The biggest current issue with the layout from the client perspective.",
        "options": [
          {"i18nKey": "architectsDesign.spacePlanning.questions.main_problem.options.crowded_layout", "value": "crowded_layout", "order": 0},
          {"i18nKey": "architectsDesign.spacePlanning.questions.main_problem.options.poor_circulation", "value": "poor_circulation", "order": 1},
          {"i18nKey": "architectsDesign.spacePlanning.questions.main_problem.options.lack_of_storage", "value": "lack_of_storage", "order": 2},
          {"i18nKey": "architectsDesign.spacePlanning.questions.main_problem.options.poor_zoning", "value": "poor_zoning", "order": 3},
          {"i18nKey": "architectsDesign.spacePlanning.questions.main_problem.options.awkward_dimensions", "value": "awkward_dimensions", "order": 4}
        ]
      }
    ]
  }$json$::jsonb,
  true,
  now()
);

-- Insert House Extension Plans question pack
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
  'house-extension-plans',
  1,
  'approved',
  'manual',
  $json${
    "id": "d0d2a2b1-6ff7-4b1e-8d3f-6b9c62a4b011",
    "category": "residential-architects",
    "name": "House Extension Plans",
    "slug": "house-extension-plans",
    "i18nPrefix": "residentialArchitects.houseExtensionPlans",
    "questions": [
      {
        "key": "type_of_extension",
        "type": "single",
        "i18nKey": "residentialArchitects.houseExtensionPlans.questions.type_of_extension.title",
        "required": true,
        "aiHint": "Type of house extension the client is planning.",
        "options": [
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.type_of_extension.options.rear_extension", "value": "rear_extension", "order": 0},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.type_of_extension.options.side_extension", "value": "side_extension", "order": 1},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.type_of_extension.options.wrap_around", "value": "wrap_around", "order": 2},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.type_of_extension.options.two_storey", "value": "two_storey", "order": 3},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.type_of_extension.options.roof_extension", "value": "roof_extension", "order": 4},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.type_of_extension.options.balcony", "value": "balcony", "order": 5},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.type_of_extension.options.unsure", "value": "unsure", "order": 6}
        ]
      },
      {
        "key": "extension_purpose",
        "type": "single",
        "i18nKey": "residentialArchitects.houseExtensionPlans.questions.extension_purpose.title",
        "required": true,
        "aiHint": "Main functional purpose of the new extension.",
        "options": [
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.extension_purpose.options.bigger_kitchen", "value": "bigger_kitchen", "order": 0},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.extension_purpose.options.additional_bedroom", "value": "additional_bedroom", "order": 1},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.extension_purpose.options.living_space", "value": "living_space", "order": 2},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.extension_purpose.options.home_office", "value": "home_office", "order": 3},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.extension_purpose.options.storage", "value": "storage", "order": 4},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.extension_purpose.options.open_plan_space", "value": "open_plan_space", "order": 5}
        ]
      },
      {
        "key": "extension_size",
        "type": "single",
        "i18nKey": "residentialArchitects.houseExtensionPlans.questions.extension_size.title",
        "required": true,
        "aiHint": "Approximate size of the extension based on rooms or area.",
        "options": [
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.extension_size.options.small_one_room", "value": "small_one_room", "order": 0},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.extension_size.options.medium_two_rooms", "value": "medium_two_rooms", "order": 1},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.extension_size.options.large_multi_room", "value": "large_multi_room", "order": 2},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.extension_size.options.full_floor_expansion", "value": "full_floor_expansion", "order": 3},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.extension_size.options.not_sure", "value": "not_sure", "order": 4}
        ]
      },
      {
        "key": "structural_changes",
        "type": "single",
        "i18nKey": "residentialArchitects.houseExtensionPlans.questions.structural_changes.title",
        "required": true,
        "aiHint": "How much structural change is expected to the existing building.",
        "options": [
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.structural_changes.options.yes_major", "value": "yes_major", "order": 0},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.structural_changes.options.yes_minor", "value": "yes_minor", "order": 1},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.structural_changes.options.not_sure", "value": "not_sure", "order": 2},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.structural_changes.options.prefer_no_changes", "value": "prefer_no_changes", "order": 3}
        ]
      },
      {
        "key": "match_existing_style",
        "type": "single",
        "i18nKey": "residentialArchitects.houseExtensionPlans.questions.match_existing_style.title",
        "required": true,
        "aiHint": "Whether the extension should visually match or contrast with the existing house.",
        "options": [
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.match_existing_style.options.seamless_match", "value": "seamless_match", "order": 0},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.match_existing_style.options.modern_contrast", "value": "modern_contrast", "order": 1},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.match_existing_style.options.mix_of_both", "value": "mix_of_both", "order": 2},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.match_existing_style.options.open_to_suggestions", "value": "open_to_suggestions", "order": 3}
        ]
      },
      {
        "key": "required_drawings",
        "type": "multi",
        "i18nKey": "residentialArchitects.houseExtensionPlans.questions.required_drawings.title",
        "required": true,
        "aiHint": "Which technical drawings the client expects for the extension plans.",
        "options": [
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.required_drawings.options.floor_plans", "value": "floor_plans", "order": 0},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.required_drawings.options.elevations", "value": "elevations", "order": 1},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.required_drawings.options.sections", "value": "sections", "order": 2},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.required_drawings.options.structural_layouts", "value": "structural_layouts", "order": 3},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.required_drawings.options.all_of_the_above", "value": "all_of_the_above", "order": 4},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.required_drawings.options.not_sure", "value": "not_sure", "order": 5}
        ]
      },
      {
        "key": "detail_level",
        "type": "single",
        "i18nKey": "residentialArchitects.houseExtensionPlans.questions.detail_level.title",
        "required": true,
        "aiHint": "Level of detail expected from the extension plans.",
        "options": [
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.detail_level.options.concept_only", "value": "concept_only", "order": 0},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.detail_level.options.concept_plus_technical", "value": "concept_plus_technical", "order": 1},
          {"i18nKey": "residentialArchitects.houseExtensionPlans.questions.detail_level.options.full_construction_ready", "value": "full_construction_ready", "order": 2}
        ]
      }
    ]
  }$json$::jsonb,
  true,
  now()
);