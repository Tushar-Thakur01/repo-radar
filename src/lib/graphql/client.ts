// Lightweight GraphQL fetch client for RepoRadar
// Works in both Client Components and Server Components without heavy dependencies

export async function fetchGraphQL<T = any>(
  query: string,
  variables: Record<string, any> = {}
): Promise<{ data?: T; errors?: Array<{ message: string }> }> {
  try {
    const baseUrl =
      typeof window !== "undefined"
        ? ""
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed with HTTP ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error("GraphQL client error:", err);
    return {
      errors: [{ message: err.message || "Network error executing GraphQL query" }],
    };
  }
}
