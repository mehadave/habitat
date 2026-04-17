-- Add category column to journal_entries
ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'brain-dump';
