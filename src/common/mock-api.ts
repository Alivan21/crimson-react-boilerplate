/**
 * Mock user database for development purposes
 */
const mockUsers = [
  { id: "1", username: "admin", password: "admin123" },
  { id: "2", username: "user", password: "password123" },
  { id: "3", username: "demo", password: "demo" },
];

/**
 * Validates user credentials against mock database
 * @param username Username from the login form
 * @param password Password from the login form
 * @returns User ID if credentials are valid, null otherwise
 */
export async function validateCredentials(
  username: FormDataEntryValue | null,
  password: FormDataEntryValue | null,
): Promise<string | null> {
  // Simple validation for null/undefined values
  if (!username || !password) return null;

  // Simulate network delay for a more realistic experience
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Find matching user
  const user = mockUsers.find((u) => u.username === username && u.password === password);

  return user?.id || null;
}
