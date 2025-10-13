-- Add missing columns to services_micro (the actual table behind services_catalog view)
ALTER TABLE public.services_micro
ADD COLUMN IF NOT EXISTS name_es TEXT,
ADD COLUMN IF NOT EXISTS typical_duration_hours INTEGER,
ADD COLUMN IF NOT EXISTS icon_emoji TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_micro_ibiza_specific 
ON public.services_micro(ibiza_specific) 
WHERE ibiza_specific = true;

CREATE INDEX IF NOT EXISTS idx_services_micro_category 
ON public.services_micro(category);

-- Mark existing Architects & Design entries as inactive
UPDATE public.services_micro 
SET is_active = false 
WHERE category = 'Architects & Design';

-- Insert comprehensive Architecture & Design taxonomy (45 micro-services)

-- Subcategory 1: Architectural Planning & Design (8 services)
INSERT INTO public.services_micro (category, subcategory, micro, name_es, ibiza_specific, typical_duration_hours, icon_emoji, is_active, questions_micro, questions_logistics) VALUES
('Architects & Design', 'Architectural Planning & Design', 'Architectural plans & layouts', 'Planos y diseños arquitectónicos', false, 80, '📐', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Architectural Planning & Design', 'New build design', 'Diseño de nueva construcción', false, 120, '🏗️', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Architectural Planning & Design', 'Villa & finca design', 'Diseño de villa o finca', true, 160, '🏡', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Architectural Planning & Design', 'Extension & renovation plans', 'Planes de ampliación y reforma', false, 60, '🔧', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Architectural Planning & Design', 'Building layout & floor plan design', 'Distribución y planos de planta', false, 40, '📋', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Architectural Planning & Design', '3D visualizations', 'Renderizados 3D', false, 24, '🎨', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Architectural Planning & Design', 'Planning applications & permits', 'Licencias y permisos', false, 40, '📄', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Architectural Planning & Design', 'Concept & feasibility studies', 'Estudios de viabilidad y concepto', false, 32, '💡', true, '[]'::jsonb, '[]'::jsonb);

-- Subcategory 2: Structural & Technical Design (7 services)
INSERT INTO public.services_micro (category, subcategory, micro, name_es, ibiza_specific, typical_duration_hours, icon_emoji, is_active, questions_micro, questions_logistics) VALUES
('Architects & Design', 'Structural & Technical Design', 'Structural calculations', 'Cálculos estructurales', false, 40, '🧮', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Structural & Technical Design', 'Foundation & footing design', 'Diseño de cimentaciones y zapatas', false, 32, '🏗️', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Structural & Technical Design', 'Concrete & steel detailing', 'Detalles de hormigón y acero', false, 48, '🔩', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Structural & Technical Design', 'Roof structure & truss design', 'Diseño de estructura de techo y cerchas', false, 40, '⛺', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Structural & Technical Design', 'Drainage & stormwater layout', 'Diseño de drenaje y aguas pluviales', false, 24, '💧', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Structural & Technical Design', 'Retaining wall design', 'Diseño de muros de contención', false, 32, '🧱', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Structural & Technical Design', 'Flat roof & azotea design', 'Diseño de azoteas y cubiertas planas', true, 40, '🏠', true, '[]'::jsonb, '[]'::jsonb);

-- Subcategory 3: Interior Design & Space Planning (8 services)
INSERT INTO public.services_micro (category, subcategory, micro, name_es, ibiza_specific, typical_duration_hours, icon_emoji, is_active, questions_micro, questions_logistics) VALUES
('Architects & Design', 'Interior Design & Space Planning', 'Interior design concepts', 'Conceptos de diseño interior', false, 40, '🎨', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Interior Design & Space Planning', 'Room layout & space optimization', 'Distribución y optimización de espacios', false, 32, '📐', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Interior Design & Space Planning', 'Kitchen & bathroom design', 'Diseño de cocina y baño', false, 40, '🚿', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Interior Design & Space Planning', 'Lighting design', 'Diseño de iluminación', false, 24, '💡', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Interior Design & Space Planning', 'Material & colour selection', 'Selección de materiales y colores', false, 16, '🎨', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Interior Design & Space Planning', 'Furniture & fixture styling', 'Diseño de mobiliario y accesorios', false, 24, '🪑', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Interior Design & Space Planning', '3D interior visualizations', 'Renderizados 3D interiores', false, 24, '🖼️', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Interior Design & Space Planning', 'Villa interior styling', 'Diseño interior de villa', true, 80, '✨', true, '[]'::jsonb, '[]'::jsonb);

-- Subcategory 4: Landscape & Outdoor Design (6 services)
INSERT INTO public.services_micro (category, subcategory, micro, name_es, ibiza_specific, typical_duration_hours, icon_emoji, is_active, questions_micro, questions_logistics) VALUES
('Architects & Design', 'Landscape & Outdoor Design', 'Garden & terrace design', 'Diseño de jardines y terrazas', false, 40, '🌿', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Landscape & Outdoor Design', 'Pool & water feature design', 'Diseño de piscina y fuentes', true, 40, '🏊', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Landscape & Outdoor Design', 'Outdoor kitchen & lounge layout', 'Diseño de cocina exterior y lounge', false, 32, '🍽️', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Landscape & Outdoor Design', 'Decking, pergolas & shade structures', 'Diseño de tarimas y pérgolas', false, 32, '⛱️', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Landscape & Outdoor Design', 'Lighting & irrigation planning', 'Planificación de iluminación e irrigación', false, 24, '💡', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Landscape & Outdoor Design', 'Hardscape & pathway layouts', 'Diseño de pavimentos y caminos', false, 24, '🛤️', true, '[]'::jsonb, '[]'::jsonb);

-- Subcategory 5: Sustainable & Eco Design (6 services)
INSERT INTO public.services_micro (category, subcategory, micro, name_es, ibiza_specific, typical_duration_hours, icon_emoji, is_active, questions_micro, questions_logistics) VALUES
('Architects & Design', 'Sustainable & Eco Design', 'Energy-efficient building design', 'Diseño de edificios eficientes', false, 60, '♻️', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Sustainable & Eco Design', 'Passive solar house design', 'Diseño solar pasivo', false, 48, '☀️', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Sustainable & Eco Design', 'Green roof & wall design', 'Diseño de cubiertas y muros verdes', false, 40, '🌱', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Sustainable & Eco Design', 'Renewable system integration', 'Integración de energía solar o bomba de calor', false, 32, '⚡', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Sustainable & Eco Design', 'Rainwater & greywater reuse design', 'Diseño de sistemas de reutilización de agua', false, 32, '💧', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Sustainable & Eco Design', 'Sustainable villa design', 'Diseño sostenible de villa', true, 120, '🌍', true, '[]'::jsonb, '[]'::jsonb);

-- Subcategory 6: Documentation & Visualization (5 services)
INSERT INTO public.services_micro (category, subcategory, micro, name_es, ibiza_specific, typical_duration_hours, icon_emoji, is_active, questions_micro, questions_logistics) VALUES
('Architects & Design', 'Documentation & Visualization', '3D modelling & render packages', 'Modelado y renderizado 3D', false, 40, '🖥️', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Documentation & Visualization', 'Architectural presentation visuals', 'Visuales para presentación', false, 24, '📊', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Documentation & Visualization', 'Marketing visuals for developers', 'Renderizados para promotores', false, 32, '📸', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Documentation & Visualization', 'BIM coordination', 'Coordinación BIM', false, 48, '🏗️', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Documentation & Visualization', 'Architectural animations & walkthroughs', 'Animaciones y recorridos virtuales', false, 60, '🎬', true, '[]'::jsonb, '[]'::jsonb);

-- Subcategory 7: Consultation & Surveying (5 services)
INSERT INTO public.services_micro (category, subcategory, micro, name_es, ibiza_specific, typical_duration_hours, icon_emoji, is_active, questions_micro, questions_logistics) VALUES
('Architects & Design', 'Consultation & Surveying', 'Architectural consultation', 'Consulta con arquitecto', false, 4, '💬', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Consultation & Surveying', 'Site visit & measurement survey', 'Visita y levantamiento de medidas', false, 8, '📏', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Consultation & Surveying', 'Planning strategy advice', 'Asesoramiento en planificación', false, 8, '🗺️', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Consultation & Surveying', 'Material & cost estimation', 'Estimación de materiales y costes', false, 16, '💰', true, '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Consultation & Surveying', 'Compliance & technical checks', 'Verificación de cumplimiento técnico', false, 16, '✅', true, '[]'::jsonb, '[]'::jsonb);