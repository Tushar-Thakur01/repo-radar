// Next.js App Router route handler for RepoRadar GraphQL API
// Powered by GraphQL Yoga with full GraphiQL interactive playground

import { createSchema, createYoga } from "graphql-yoga";
import { typeDefs } from "@/lib/graphql/schema";
import { resolvers } from "@/lib/graphql/resolvers";

export const dynamic = "force-dynamic";

const schema = createSchema({
  typeDefs,
  resolvers,
});

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response, Request },
  graphiql: {
    title: "RepoRadar GraphQL Explorer",
    defaultQuery: /* GraphQL */ `
      query GetDashboardOverview {
        repositoryStats {
          totalRepos
          totalStars
          totalLanguages
          totalTopics
        }
        trendingRepositories(limit: 5) {
          id
          fullName
          stars
          starGrowth
          trendingScore
          primaryLanguage
          summary {
            summary
            beginnerTake
          }
        }
        trendingTopics(limit: 6) {
          topic
          count
        }
      }
    `,
  },
});

export async function GET(request: Request) {
  return handleRequest(request, {});
}

export async function POST(request: Request) {
  return handleRequest(request, {});
}

export async function OPTIONS(request: Request) {
  return handleRequest(request, {});
}
