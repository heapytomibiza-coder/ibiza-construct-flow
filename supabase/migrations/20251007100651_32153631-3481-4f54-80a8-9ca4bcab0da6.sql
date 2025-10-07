-- Create micro_service_questions table for storing questions per micro-service
CREATE TABLE IF NOT EXISTS public.micro_service_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  micro_id UUID NOT NULL,
  micro_name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.micro_service_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can read questions
CREATE POLICY "Anyone can view micro service questions"
  ON public.micro_service_questions
  FOR SELECT
  USING (true);

-- Only admins can manage questions
CREATE POLICY "Admins can manage questions"
  ON public.micro_service_questions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_micro_questions_micro_id ON public.micro_service_questions(micro_id);
CREATE INDEX idx_micro_questions_category ON public.micro_service_questions(category, subcategory);

-- Insert sample questions for common services
INSERT INTO public.micro_service_questions (micro_id, micro_name, category, subcategory, questions) VALUES
  -- Builder questions
  (gen_random_uuid(), 'New Build', 'Builder', 'New Construction', '[
    {"id": "property_size", "type": "radio", "label": "Property size (m²)", "required": true, "options": [
      {"label": "Under 100 m²", "value": "under_100"},
      {"label": "100-200 m²", "value": "100_200"},
      {"label": "200-300 m²", "value": "200_300"},
      {"label": "Over 300 m²", "value": "over_300"}
    ]},
    {"id": "floors", "type": "radio", "label": "Number of floors", "required": true, "options": [
      {"label": "Single storey", "value": "1"},
      {"label": "Two storey", "value": "2"},
      {"label": "Three+ storey", "value": "3+"}
    ]},
    {"id": "finish_level", "type": "radio", "label": "Finish level", "required": true, "options": [
      {"label": "Basic", "value": "basic"},
      {"label": "Standard", "value": "standard"},
      {"label": "High-end", "value": "high_end"},
      {"label": "Luxury", "value": "luxury"}
    ]},
    {"id": "timeline", "type": "radio", "label": "Desired timeline", "required": true, "options": [
      {"label": "Less than 6 months", "value": "under_6"},
      {"label": "6-12 months", "value": "6_12"},
      {"label": "12-18 months", "value": "12_18"},
      {"label": "Flexible", "value": "flexible"}
    ]}
  ]'::jsonb),
  
  -- Plumber questions
  (gen_random_uuid(), 'Bathroom Installation', 'Plumber', 'Installation', '[
    {"id": "bathroom_type", "type": "radio", "label": "Bathroom type", "required": true, "options": [
      {"label": "Full bathroom", "value": "full"},
      {"label": "Half bathroom", "value": "half"},
      {"label": "Ensuite", "value": "ensuite"},
      {"label": "Wet room", "value": "wet_room"}
    ]},
    {"id": "fixtures", "type": "checkbox", "label": "Fixtures to install", "required": true, "options": [
      {"label": "Toilet", "value": "toilet"},
      {"label": "Sink", "value": "sink"},
      {"label": "Shower", "value": "shower"},
      {"label": "Bathtub", "value": "bathtub"},
      {"label": "Bidet", "value": "bidet"}
    ]},
    {"id": "pipe_work", "type": "radio", "label": "Pipework needed", "required": true, "options": [
      {"label": "New installation", "value": "new"},
      {"label": "Modification of existing", "value": "modify"},
      {"label": "Complete replacement", "value": "replace"}
    ]},
    {"id": "urgency", "type": "radio", "label": "How urgent?", "required": true, "options": [
      {"label": "Emergency", "value": "emergency"},
      {"label": "This week", "value": "urgent"},
      {"label": "Within 2 weeks", "value": "normal"},
      {"label": "Flexible", "value": "flexible"}
    ]}
  ]'::jsonb),
  
  -- Electrician questions
  (gen_random_uuid(), 'Rewiring', 'Electrician', 'Installation', '[
    {"id": "scope", "type": "radio", "label": "Rewiring scope", "required": true, "options": [
      {"label": "Full property", "value": "full"},
      {"label": "Partial (specific rooms)", "value": "partial"},
      {"label": "Extension only", "value": "extension"}
    ]},
    {"id": "property_size", "type": "radio", "label": "Property size", "required": true, "options": [
      {"label": "1-2 bedrooms", "value": "small"},
      {"label": "3-4 bedrooms", "value": "medium"},
      {"label": "5+ bedrooms", "value": "large"}
    ]},
    {"id": "includes", "type": "checkbox", "label": "Work includes", "required": true, "options": [
      {"label": "Consumer unit upgrade", "value": "consumer_unit"},
      {"label": "New sockets", "value": "sockets"},
      {"label": "New lighting", "value": "lighting"},
      {"label": "Data points", "value": "data"},
      {"label": "Outdoor electrics", "value": "outdoor"}
    ]},
    {"id": "certificate", "type": "yesno", "label": "Need electrical certificate?", "required": true}
  ]'::jsonb),
  
  -- Painter questions  
  (gen_random_uuid(), 'Interior Painting', 'Painter', 'Interior', '[
    {"id": "rooms", "type": "radio", "label": "Number of rooms", "required": true, "options": [
      {"label": "1-2 rooms", "value": "1_2"},
      {"label": "3-4 rooms", "value": "3_4"},
      {"label": "5+ rooms", "value": "5_plus"},
      {"label": "Whole property", "value": "whole"}
    ]},
    {"id": "surfaces", "type": "checkbox", "label": "Surfaces to paint", "required": true, "options": [
      {"label": "Walls", "value": "walls"},
      {"label": "Ceilings", "value": "ceilings"},
      {"label": "Doors", "value": "doors"},
      {"label": "Windows frames", "value": "windows"},
      {"label": "Skirting boards", "value": "skirting"}
    ]},
    {"id": "condition", "type": "radio", "label": "Surface condition", "required": true, "options": [
      {"label": "Good - ready to paint", "value": "good"},
      {"label": "Fair - minor prep needed", "value": "fair"},
      {"label": "Poor - extensive prep needed", "value": "poor"}
    ]},
    {"id": "finish", "type": "radio", "label": "Finish type", "required": true, "options": [
      {"label": "Matt", "value": "matt"},
      {"label": "Silk", "value": "silk"},
      {"label": "Gloss", "value": "gloss"}
    ]}
  ]'::jsonb),
  
  -- Tiler questions
  (gen_random_uuid(), 'Floor Tiling', 'Tiler', 'Floor', '[
    {"id": "area_size", "type": "radio", "label": "Area size (m²)", "required": true, "options": [
      {"label": "Under 10 m²", "value": "under_10"},
      {"label": "10-20 m²", "value": "10_20"},
      {"label": "20-40 m²", "value": "20_40"},
      {"label": "Over 40 m²", "value": "over_40"}
    ]},
    {"id": "tile_type", "type": "radio", "label": "Tile type", "required": true, "options": [
      {"label": "Ceramic", "value": "ceramic"},
      {"label": "Porcelain", "value": "porcelain"},
      {"label": "Natural stone", "value": "stone"},
      {"label": "Mosaic", "value": "mosaic"}
    ]},
    {"id": "floor_prep", "type": "radio", "label": "Floor preparation needed", "required": true, "options": [
      {"label": "None - ready to tile", "value": "none"},
      {"label": "Leveling needed", "value": "leveling"},
      {"label": "Remove old tiles", "value": "remove"},
      {"label": "Complete new subfloor", "value": "new_subfloor"}
    ]},
    {"id": "pattern", "type": "radio", "label": "Tile pattern", "required": true, "options": [
      {"label": "Straight", "value": "straight"},
      {"label": "Diagonal", "value": "diagonal"},
      {"label": "Herringbone", "value": "herringbone"},
      {"label": "Complex pattern", "value": "complex"}
    ]}
  ]'::jsonb);

-- Add trigger for updated_at
CREATE TRIGGER update_micro_questions_updated_at
  BEFORE UPDATE ON public.micro_service_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_micro_questions_updated_at();