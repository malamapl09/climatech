-- Add started_at timestamp to track when a job actually begins
ALTER TABLE jobs ADD COLUMN started_at TIMESTAMPTZ;

-- Add job_running_late notification type
ALTER TYPE notification_type ADD VALUE 'job_running_late';
