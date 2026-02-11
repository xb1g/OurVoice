import { INITIAL_ISSUES, MOCK_USERS } from '../constants';
import { Issue, User } from '../types';

// Deprecated: kept only for local fallback/debug migrations.
// Production flows use authenticated API persistence.
const ISSUES_KEY = 'ourvoice_issues';
const CURRENT_USER_KEY = 'ourvoice_current_user';

export const getIssues = (): Issue[] => {
  const stored = localStorage.getItem(ISSUES_KEY);
  if (!stored) {
    localStorage.setItem(ISSUES_KEY, JSON.stringify(INITIAL_ISSUES));
    return INITIAL_ISSUES;
  }
  return JSON.parse(stored);
};

export const saveIssues = (issues: Issue[]) => {
  localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
};

export const getIssueById = (id: string): Issue | undefined => {
  const issues = getIssues();
  return issues.find((i) => i.id === id);
};

export const getCurrentUser = (): User => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : MOCK_USERS[0];
};

export const setCurrentUser = (user: User) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};
