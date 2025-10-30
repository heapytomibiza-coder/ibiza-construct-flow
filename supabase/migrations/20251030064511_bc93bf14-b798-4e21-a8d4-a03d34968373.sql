-- Add ui_config column to question_packs table for storing UX metadata
ALTER TABLE question_packs 
ADD COLUMN IF NOT EXISTS ui_config JSONB DEFAULT '{}'::jsonb;

-- Add GIN index for efficient JSONB queries on ui_config
CREATE INDEX IF NOT EXISTS idx_question_packs_ui_config 
ON question_packs USING gin(ui_config);

-- Add comment for documentation
COMMENT ON COLUMN question_packs.ui_config IS 
'Stores UX metadata for questions: placeholder, help, min_selections, max_selections, accept, max_files, max_total_mb';