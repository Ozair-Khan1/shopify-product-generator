import { AppProvider, Page, Card, FormLayout, TextField, Button, Text, BlockStack, Layout } from "@shopify/polaris";
import { useState } from "react";
import { Form, useActionData, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const loader = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));

  return { errors };
};

export const action = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));

  return {
    errors,
  };
};

export default function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;

  return (
    <AppProvider embedded={false}>
      <Page narrowWidth>
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Log in</Text>
                <Form method="post">
                  <FormLayout>
                    <TextField
                      label="Shop domain"
                      name="shop"
                      value={shop}
                      onChange={(val) => setShop(val)}
                      placeholder="example.myshopify.com"
                      autoComplete="on"
                      error={errors?.shop}
                    />
                    <Button submit variant="primary">Log in</Button>
                  </FormLayout>
                </Form>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </AppProvider>
  );
}
