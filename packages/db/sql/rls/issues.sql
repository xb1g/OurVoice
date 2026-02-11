ALTER TABLE IF EXISTS issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS issue_supports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS issue_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS issue_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS issue_solution_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS issue_ai_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS issues_tenant_read ON issues;
CREATE POLICY issues_tenant_read
  ON issues
  FOR SELECT
  USING (
    customer_id::text = coalesce((auth.jwt() ->> 'customer_id'), '')
    OR (auth.jwt() ->> 'role') = 'superadmin'
  );

DROP POLICY IF EXISTS issues_tenant_insert ON issues;
CREATE POLICY issues_tenant_insert
  ON issues
  FOR INSERT
  WITH CHECK (
    customer_id::text = coalesce((auth.jwt() ->> 'customer_id'), '')
    OR (auth.jwt() ->> 'role') = 'superadmin'
  );

DROP POLICY IF EXISTS issues_admin_update ON issues;
CREATE POLICY issues_admin_update
  ON issues
  FOR UPDATE
  USING (
    customer_id::text = coalesce((auth.jwt() ->> 'customer_id'), '')
    OR (auth.jwt() ->> 'role') IN ('customer_admin', 'superadmin')
  )
  WITH CHECK (
    customer_id::text = coalesce((auth.jwt() ->> 'customer_id'), '')
    OR (auth.jwt() ->> 'role') IN ('customer_admin', 'superadmin')
  );

DROP POLICY IF EXISTS issue_supports_tenant_rw ON issue_supports;
CREATE POLICY issue_supports_tenant_rw
  ON issue_supports
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM issues i
      WHERE i.id = issue_supports.issue_id
      AND (
        i.customer_id::text = coalesce((auth.jwt() ->> 'customer_id'), '')
        OR (auth.jwt() ->> 'role') = 'superadmin'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM issues i
      WHERE i.id = issue_supports.issue_id
      AND (
        i.customer_id::text = coalesce((auth.jwt() ->> 'customer_id'), '')
        OR (auth.jwt() ->> 'role') = 'superadmin'
      )
    )
  );

DROP POLICY IF EXISTS issue_votes_tenant_rw ON issue_votes;
CREATE POLICY issue_votes_tenant_rw
  ON issue_votes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM issues i
      WHERE i.id = issue_votes.issue_id
      AND (
        i.customer_id::text = coalesce((auth.jwt() ->> 'customer_id'), '')
        OR (auth.jwt() ->> 'role') = 'superadmin'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM issues i
      WHERE i.id = issue_votes.issue_id
      AND (
        i.customer_id::text = coalesce((auth.jwt() ->> 'customer_id'), '')
        OR (auth.jwt() ->> 'role') = 'superadmin'
      )
    )
  );

DROP POLICY IF EXISTS issue_comments_tenant_rw ON issue_comments;
CREATE POLICY issue_comments_tenant_rw
  ON issue_comments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM issues i
      WHERE i.id = issue_comments.issue_id
      AND (
        i.customer_id::text = coalesce((auth.jwt() ->> 'customer_id'), '')
        OR (auth.jwt() ->> 'role') = 'superadmin'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM issues i
      WHERE i.id = issue_comments.issue_id
      AND (
        i.customer_id::text = coalesce((auth.jwt() ->> 'customer_id'), '')
        OR (auth.jwt() ->> 'role') = 'superadmin'
      )
    )
  );

DROP POLICY IF EXISTS issue_solutions_tenant_rw ON issue_solutions;
CREATE POLICY issue_solutions_tenant_rw
  ON issue_solutions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM issues i
      WHERE i.id = issue_solutions.issue_id
      AND (
        i.customer_id::text = coalesce((auth.jwt() ->> 'customer_id'), '')
        OR (auth.jwt() ->> 'role') = 'superadmin'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM issues i
      WHERE i.id = issue_solutions.issue_id
      AND (
        i.customer_id::text = coalesce((auth.jwt() ->> 'customer_id'), '')
        OR (auth.jwt() ->> 'role') = 'superadmin'
      )
    )
  );

DROP POLICY IF EXISTS issue_solution_votes_tenant_rw ON issue_solution_votes;
CREATE POLICY issue_solution_votes_tenant_rw
  ON issue_solution_votes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM issue_solutions s
      JOIN issues i ON i.id = s.issue_id
      WHERE s.id = issue_solution_votes.solution_id
      AND (
        i.customer_id::text = coalesce((auth.jwt() ->> 'customer_id'), '')
        OR (auth.jwt() ->> 'role') = 'superadmin'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM issue_solutions s
      JOIN issues i ON i.id = s.issue_id
      WHERE s.id = issue_solution_votes.solution_id
      AND (
        i.customer_id::text = coalesce((auth.jwt() ->> 'customer_id'), '')
        OR (auth.jwt() ->> 'role') = 'superadmin'
      )
    )
  );

DROP POLICY IF EXISTS issue_ai_snapshots_tenant_rw ON issue_ai_snapshots;
CREATE POLICY issue_ai_snapshots_tenant_rw
  ON issue_ai_snapshots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM issues i
      WHERE i.id = issue_ai_snapshots.issue_id
      AND (
        i.customer_id::text = coalesce((auth.jwt() ->> 'customer_id'), '')
        OR (auth.jwt() ->> 'role') IN ('customer_admin', 'superadmin')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM issues i
      WHERE i.id = issue_ai_snapshots.issue_id
      AND (
        i.customer_id::text = coalesce((auth.jwt() ->> 'customer_id'), '')
        OR (auth.jwt() ->> 'role') IN ('customer_admin', 'superadmin')
      )
    )
  );
