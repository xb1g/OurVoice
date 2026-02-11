DO $$ BEGIN
  CREATE TYPE issue_stage AS ENUM ('RAISE', 'VALIDATE', 'IDEATE', 'VOTE', 'ONGOING', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE issue_vote_kind AS ENUM ('up', 'down');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  stage issue_stage NOT NULL DEFAULT 'VALIDATE',
  views integer NOT NULL DEFAULT 0,
  rating double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS issue_supports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (issue_id, user_id)
);

CREATE TABLE IF NOT EXISTS issue_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind issue_vote_kind NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (issue_id, user_id)
);

CREATE TABLE IF NOT EXISTS issue_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  author_name text NOT NULL,
  author_skills jsonb,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS issue_solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  author_name text NOT NULL,
  author_skills jsonb,
  description text NOT NULL,
  estimated_cost double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS issue_solution_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid NOT NULL REFERENCES issue_solutions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (solution_id, user_id)
);

CREATE TABLE IF NOT EXISTS issue_ai_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  requested_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  analysis text NOT NULL,
  contractors jsonb,
  estimated_budget text,
  sources jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS issues_customer_id_idx ON issues(customer_id);
CREATE INDEX IF NOT EXISTS issues_author_id_idx ON issues(author_id);
CREATE INDEX IF NOT EXISTS issues_stage_idx ON issues(stage);
CREATE INDEX IF NOT EXISTS issue_supports_issue_id_idx ON issue_supports(issue_id);
CREATE INDEX IF NOT EXISTS issue_votes_issue_id_idx ON issue_votes(issue_id);
CREATE INDEX IF NOT EXISTS issue_comments_issue_id_idx ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS issue_solutions_issue_id_idx ON issue_solutions(issue_id);
CREATE INDEX IF NOT EXISTS issue_solution_votes_solution_id_idx ON issue_solution_votes(solution_id);
CREATE INDEX IF NOT EXISTS issue_ai_snapshots_issue_id_idx ON issue_ai_snapshots(issue_id);
