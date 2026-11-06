-- Blast / Primer Curso schema. Authorization is enforced in server functions
-- (the app role is privileged, so these checks are the security boundary).
-- Intended policies, mirrored in code:
--   profiles, users: admin write; self read
--   financial_*: all members read; admin and treasurer write
--   breakfast: all read; admin and treasurer write
--   schedule, tasks, announcements, polls, calendar: all read; admin write
--   task_progress: owner read/write only
--   messages: student inserts own; admin reads all; no replies
--   poll_responses: one row per user

create table if not exists roles (
  id text primary key,
  label text not null
);

insert into roles (id, label) values
  ('admin', 'Delegado'),
  ('treasurer', 'Tesorera'),
  ('student', 'Alumno')
on conflict (id) do nothing;

create table if not exists students (
  id serial primary key,
  last_name text not null,
  first_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists students_name_uidx on students (last_name, first_name);

insert into students (last_name, first_name)
select v.last_name, v.first_name
from (values
  ('AQUINO', 'YERUTI'),
  ('ARANDA', 'PEDRO'),
  ('AYALA', 'BRUNO'),
  ('BARRETO', 'ANGEL'),
  ('BEDOYA', 'CELESTE'),
  ('CAÑETE', 'MIGUEL'),
  ('CARMAGNOLA', 'ISAIAS'),
  ('CESPEDES', 'ALEJANDRO'),
  ('GAMARRA', 'CHRISTIAN'),
  ('GIRETT', 'ANDREA'),
  ('GONZALEZ', 'DAIANA'),
  ('INCHAUSTI', 'CARLOS'),
  ('LARA', 'NESTOR'),
  ('LOPEZ', 'GONZALO'),
  ('LUGO', 'ALAN'),
  ('MARTINEZ', 'NAHIARA'),
  ('MENDEZ', 'LUANA'),
  ('MONTALBETTI', 'DERLIS'),
  ('MOREL', 'JOSE'),
  ('OJEDA', 'LUCAS'),
  ('OJEDA', 'ROSSEL'),
  ('PAEZ', 'MEIELL'),
  ('PAEZ', 'AILEN'),
  ('PERALTA', 'BIANCA'),
  ('ROJAS', 'FIORELLA'),
  ('SALDIVAR', 'REGINA'),
  ('VELOSO', 'STEFANY'),
  ('VERA', 'MIA'),
  ('VERA', 'DAIHANA')
) as v(last_name, first_name)
where not exists (
  select 1 from students s
  where s.last_name = v.last_name and s.first_name = v.first_name
);

create table if not exists profiles (
  user_id text primary key references "user" (id) on delete cascade,
  role_id text not null references roles (id),
  student_id integer unique references students (id) on delete set null,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on profiles (role_id);

create table if not exists course_settings (
  id integer primary key default 1 check (id = 1),
  name text not null default 'Primer Curso',
  school text not null default '',
  year integer not null default 2026,
  updated_at timestamptz not null default now()
);

insert into course_settings (id, name, school, year)
values (1, 'Primer Curso', '', 2026)
on conflict (id) do nothing;

create table if not exists subjects (
  id serial primary key,
  name text not null unique,
  color text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists teachers (
  id serial primary key,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists classrooms (
  id serial primary key,
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists schedule_entries (
  id serial primary key,
  subject_id integer not null references subjects (id) on delete restrict,
  teacher_id integer not null references teachers (id) on delete restrict,
  classroom_id integer not null references classrooms (id) on delete restrict,
  weekday integer not null check (weekday between 1 and 7),
  start_time text not null,
  end_time text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists schedule_weekday_idx on schedule_entries (weekday, start_time);

create table if not exists financial_funds (
  id integer primary key default 1 check (id = 1),
  name text not null default 'Fondo general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into financial_funds (id, name) values (1, 'Fondo general')
on conflict (id) do nothing;

create table if not exists files (
  id serial primary key,
  name text not null,
  mime text not null,
  size_bytes integer not null,
  data_base64 text not null,
  uploaded_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists financial_transactions (
  id serial primary key,
  fund_id integer not null references financial_funds (id),
  type text not null check (type in ('income', 'expense')),
  amount numeric(14, 0) not null check (amount > 0),
  occurred_on date not null,
  description text not null,
  reason text not null,
  responsible text not null,
  receipt_file_id integer references files (id) on delete set null,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists fin_tx_occurred_idx on financial_transactions (occurred_on desc);
create index if not exists fin_tx_alive_idx on financial_transactions (deleted_at);

create table if not exists breakfast_assignments (
  id serial primary key,
  day date not null unique,
  updated_by text,
  updated_at timestamptz not null default now()
);

create table if not exists breakfast_assignment_students (
  assignment_id integer not null references breakfast_assignments (id) on delete cascade,
  student_id integer not null references students (id) on delete restrict,
  primary key (assignment_id, student_id)
);

create table if not exists tasks (
  id serial primary key,
  title text not null,
  description text not null default '',
  subject_id integer not null references subjects (id) on delete restrict,
  due_on date not null,
  relevance text not null check (relevance in ('low', 'high')),
  status text not null default 'pending' check (status in ('pending', 'completed')),
  completed_at timestamptz,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_due_idx on tasks (due_on);

create table if not exists task_files (
  task_id integer not null references tasks (id) on delete cascade,
  file_id integer not null references files (id) on delete cascade,
  primary key (task_id, file_id)
);

create table if not exists task_progress (
  task_id integer not null references tasks (id) on delete cascade,
  user_id text not null references "user" (id) on delete cascade,
  status text not null check (status in ('pending', 'completed')),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (task_id, user_id)
);

create table if not exists calendar_events (
  id serial primary key,
  title text not null,
  description text not null default '',
  category text not null check (category in ('birthday', 'task', 'project', 'exam', 'course', 'other')),
  starts_on date not null,
  task_id integer unique references tasks (id) on delete cascade,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists calendar_starts_idx on calendar_events (starts_on);

create table if not exists announcements (
  id serial primary key,
  title text not null,
  body text not null,
  category text not null,
  priority text not null check (priority in ('normal', 'important')),
  pinned boolean not null default false,
  external_url text,
  published_on date not null,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists announcement_files (
  announcement_id integer not null references announcements (id) on delete cascade,
  file_id integer not null references files (id) on delete cascade,
  primary key (announcement_id, file_id)
);

create table if not exists polls (
  id serial primary key,
  title text not null,
  description text not null default '',
  question text not null,
  closes_on date,
  status text not null default 'open' check (status in ('open', 'closed')),
  allow_change boolean not null default false,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists poll_options (
  id serial primary key,
  poll_id integer not null references polls (id) on delete cascade,
  label text not null,
  position integer not null
);

create table if not exists poll_responses (
  id serial primary key,
  poll_id integer not null references polls (id) on delete cascade,
  option_id integer not null references poll_options (id) on delete cascade,
  user_id text not null references "user" (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (poll_id, user_id)
);

create table if not exists messages (
  id serial primary key,
  student_user_id text not null references "user" (id) on delete cascade,
  teacher_id integer not null references teachers (id) on delete restrict,
  subject_id integer not null references subjects (id) on delete restrict,
  body text not null,
  status text not null default 'new' check (status in ('new', 'read')),
  created_at timestamptz not null default now()
);

create index if not exists messages_status_idx on messages (status, created_at desc);

create table if not exists audit_logs (
  id serial primary key,
  actor_id text not null,
  action text not null,
  entity text not null,
  entity_id text,
  detail text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists audit_created_idx on audit_logs (created_at desc);
