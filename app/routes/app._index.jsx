import { useLoaderData, Link } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const totalGenerated = await prisma.generatedProduct.count({
    where: { shop },
  });
  const totalPublished = await prisma.generatedProduct.count({
    where: { shop, status: "published" },
  });
  const totalDrafts = await prisma.generatedProduct.count({
    where: { shop, status: "draft" },
  });

  const recentGenerations = await prisma.generatedProduct.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      shopifyProductId: true,
    },
  });

  return {
    stats: { totalGenerated, totalPublished, totalDrafts },
    recentGenerations,
  };
};

export default function Dashboard() {
  const { stats, recentGenerations } = useLoaderData();

  return (
    <s-page heading="AI Product Generator">
      <s-button slot="primary-action" href="/app/ai" variant="primary">
        Create Product with AI
      </s-button>

      <s-section heading="Overview">
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <s-stack direction="inline" gap="large" wrap>
            <div style={{ display: 'flex', justifyContent: 'space-evenly', width: '100%', gap: '100px' }}>
              <s-card>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "4px", justifyContent: 'center' }}>
                  <s-text variant="headingLg">{stats.totalGenerated}</s-text>
                  <s-text variant="bodySm" tone="subdued">
                    Total Generated
                  </s-text>
                </div>
              </s-card>
              <s-card>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "4px", justifyContent: 'center' }}>
                  <s-text variant="headingLg">{stats.totalPublished}</s-text>
                  <s-text variant="bodySm" tone="subdued">
                    Published to Shopify
                  </s-text>
                </div>
              </s-card>
              <s-card>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "4px", justifyContent: 'center' }}>
                  <s-text variant="headingLg">{stats.totalDrafts}</s-text>
                  <s-text variant="bodySm" tone="subdued">
                    Drafts
                  </s-text>
                </div>
              </s-card>
            </div>
          </s-stack>
        </div>
      </s-section>

      {/* Recent Generations */}
      <s-section heading="Recent Generations">
        {recentGenerations.length === 0 ? (
          <s-card>
            <s-stack direction="block" gap="base">
              <s-paragraph>
                No products generated yet. Click "Create Product with AI" to get
                started!
              </s-paragraph>
            </s-stack>
          </s-card>
        ) : (
          <s-card>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid var(--p-color-border, #ddd)",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "8px 12px" }}>Product Title</th>
                  <th style={{ padding: "8px 12px" }}>Status</th>
                  <th style={{ padding: "8px 12px" }}>Created</th>
                  <th style={{ padding: "8px 12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentGenerations.map((gen) => (
                  <tr
                    key={gen.id}
                    style={{
                      borderBottom:
                        "1px solid var(--p-color-border-subdued, #eee)",
                    }}
                  >
                    <td style={{ padding: "8px 12px", fontWeight: 500 }}>
                      {gen.title}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <s-badge
                        tone={
                          gen.status === "published" ? "success" : "attention"
                        }
                      >
                        {gen.status === "published" ? "Published" : "Draft"}
                      </s-badge>
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {new Date(gen.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {gen.status === "draft" ? (
                        <s-button
                          variant="tertiary"
                          href={`/app/preview?id=${gen.id}`}
                          size="slim"
                        >
                          Preview
                        </s-button>
                      ) : (
                        <s-text tone="subdued">—</s-text>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </s-card>
        )}
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
