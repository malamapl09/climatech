-- Add notification preferences JSONB column to profiles
ALTER TABLE profiles ADD COLUMN notification_preferences JSONB DEFAULT '{}'::jsonb;
