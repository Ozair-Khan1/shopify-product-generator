# AI Product Generator — Task Checklist

## Planning
- [/] Explore existing project structure
- [/] Write implementation plan
- [ ] Get user approval on plan

## Backend — AI & GraphQL Libs
- [ ] Create `app/lib/openai.js` — Google Gemini text generation (description, variants, pricing, tags, SEO)
- [ ] Create `app/lib/imageGen.js` — Image generation via Gemini Imagen / DALL·E
- [ ] Create `app/lib/shopifyGraphql.js` — Product create, media upload, variant mutations

## Prisma — Settings & History
- [ ] Add `AiSettings` and `GeneratedProduct` models to [schema.prisma](file:///c:/Users/Others/Documents/test/product-generator/prisma/schema.prisma)
- [ ] Run migration

## Routes — Pages
- [ ] [app.jsx](file:///c:/Users/Others/Documents/test/product-generator/app/routes/app.jsx) — Update nav to include new pages
- [ ] [app._index.jsx](file:///c:/Users/Others/Documents/test/product-generator/app/routes/app._index.jsx) — Dashboard page (stats + quick-create button)
- [ ] `app.ai.jsx` — AI Generation page (form + action)
- [ ] `app.ai-preview.jsx` — Preview & Publish page
- [ ] `app.settings.jsx` — AI Preferences page

## Components
- [ ] `app/components/AIForm.jsx`
- [ ] `app/components/AIPreview.jsx`
- [ ] `app/components/ImageGrid.jsx`
- [ ] `app/components/VariantTable.jsx`

## Verification
- [ ] Run `npm run dev` and confirm no build errors
- [ ] Manual walkthrough of full flow in the Shopify admin
