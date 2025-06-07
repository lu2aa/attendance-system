CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_number TEXT UNIQUE NOT NULL,
  employee_name TEXT NOT NULL,
  phone_number TEXT,
  national_id TEXT,
  link TEXT,
  email TEXT UNIQUE,
  job_title TEXT,
  grade TEXT,
  work_status TEXT,
  work_days INTEGER,
  part_time BOOLEAN,
  shift TEXT,
  is_christian BOOLEAN,
  nursing_hour BOOLEAN,
  disability BOOLEAN,
  regular_leave_balance INTEGER,
  casual_leave_balance INTEGER,
  absence_days_count INTEGER,
  remaining_regular_leave INTEGER,
  remaining_casual_leave INTEGER,
  remaining_absence_days INTEGER,
  nursing_hour_type TEXT,
  nursing_hour_start TIME,
  nursing_hour_end TIME,
  monthly_evaluation TEXT,
  training TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_name TEXT NOT NULL,
  request_type TEXT NOT NULL,
  request_start_date DATE,
  request_end_date DATE,
  approval TEXT DEFAULT 'pending',
  reply TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE evaluation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_name TEXT NOT NULL,
  evaluation_month TEXT NOT NULL,
  evaluation_score INTEGER,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_name TEXT NOT NULL,
  shift_date DATE NOT NULL,
  shift_start_time TIME,
  shift_end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);