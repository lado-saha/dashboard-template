# YowYob Unified Business Dashboard: A Developer's Guide

![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)
![React](https://img.shields.io/badge/React-18+-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-cyan?logo=tailwind-css)
![Shadcn/UI](https://img.shields.io/badge/shadcn/ui-black?logo=shadcn-ui&logoColor=white)

## 1. Project Overview

This is the frontend application for the YowYob Unified Business Dashboard, a multi-tenant platform designed to serve as a comprehensive command center for various user roles. The system provides distinct, secure workspaces for:

-   **Standard Users/Customers:** For interacting with services, managing profiles, and tracking personal activity.
-   **Business Actors:** For managing the entire lifecycle of their business entities, including organizations, sub-agencies, teams, clients, and product/service attributes.
-   **Super Administrators:** For platform-wide oversight, user management, and global configuration.

This document serves as the primary technical guide for developers taking over or contributing to the project.

---

## 2. Core Architectural Concepts

Understanding these five core concepts is essential to working effectively with this codebase. They represent the "why" behind the structure.

### 2.1. The Repository Pattern & Dual Data Source

**The Problem:** We need to develop the frontend independently of the backend, but seamlessly switch to the live API when it's available.

**The Solution:** We use a **Repository Pattern** to abstract all data-fetching logic.

-   **Interface (`/lib/data-repo/.../repository-interface.ts`):** Defines a contract for what data can be fetched (e.g., `getOrganizations()`).
-   **Local Repo (`...-local-repository.ts`):** An implementation that fulfills the contract by making `fetch` calls to our own internal Mock API (`/app/api/mock/...`).
-   **Remote Repo (`...-remote-repository.ts`):** An implementation that fulfills the contract by calling the live backend microservices via the `apiClient`.
-   **The Switch:** A single environment variable, `NEXT_PUBLIC_DATA_SOURCE`, determines which implementation is used at build time.

> **Developer Takeaway:** When adding a new data-fetching function, you must add it to the interface and then implement it in **both** the local and remote repository files.

### 2.2. The BFF Proxy for CORS & Security

**The Problem:** When running `localhost:3000`, browsers block `fetch` requests to `gateway.yowyob.com` due to Cross-Origin Resource Sharing (CORS) security policies.

**The Solution:** We use a **Backend-for-Frontend (BFF) Proxy** located at `/app/api/proxy/[...slug]/route.ts`.

-   The frontend client **never** calls the YowYob gateway directly.
-   Instead, all remote API calls are directed to our own `/api/proxy` endpoint.
-   The `X-Target-URL` header tells this proxy where to forward the request on the server-side.
-   Because the server-to-server request is not subject to browser CORS rules, it succeeds.
-   **Secondary Benefit:** This also abstracts away the backend URLs and provides a single point for adding centralized logging or request transformation in the future.

> **Developer Takeaway:** All remote API calls must go through the `yowyobApiRequest` function in `lib/apiClient.ts`, which handles the proxying automatically. Do not use `fetch` directly for external APIs.

### 2.3. The Server Component Wrapper Pattern

**The Problem:** Next.js App Router disallows importing Client Components (`"use client"`) into Server Components that also export `generateMetadata` for SEO. We need both server-rendered metadata and client-side interactivity on the same page.

**The Solution:** We separate the page into two files:
1.  **`page.tsx` (Server Component):** This is the main route file. It's responsible for exporting `generateMetadata` and performing any initial, non-context-dependent data fetching. It then imports and renders the client component, passing data down as props.
2.  **`*-client.tsx` (Client Component):** This file contains the `"use client"` directive and all the interactive logic: hooks (`useState`, `useEffect`), context (`useActiveOrganization`), and event handlers.

> **Developer Takeaway:** All new pages requiring interactivity should follow this pattern. Keep the `page.tsx` minimal and place all stateful logic inside the corresponding `*-client.tsx` file.

### 2.4. Context-Based Workspace Management

**The Problem:** A Business Actor can manage multiple organizations, and each organization can have multiple agencies. The UI must always know which entity the user is currently managing.

**The Solution:** The `ActiveOrganizationProvider` (`/contexts/active-organization-context.tsx`) acts as the "workspace" manager.
-   It holds the `activeOrganizationId` and `activeAgencyId`.
-   It persists this context to `localStorage` to survive page reloads.
-   It provides functions like `setActiveOrganization` and `clearActiveAgency` to switch contexts.
-   The main `Sidebar` component uses this context to dynamically change its navigation links and display the correct workspace switcher.

> **Developer Takeaway:** To get the ID of the currently managed organization or agency, use the `useActiveOrganization()` hook. Never rely on URL parameters as the sole source of truth for the active workspace.

### 2.5. Standardized UI Components

**The Problem:** Repeating complex UI logic for tables, grids, and forms across dozens of pages leads to inconsistency and high maintenance overhead.

**The Solution:** We've built high-order components to encapsulate this logic:
-   **`ResourceDataTable`:** A universal component for all CRUD views. It handles view switching (list/grid), toolbars, filtering, loading skeletons, error states, and empty states.
-   **`FormWrapper`:** A standardized wrapper for all forms. It provides the `Card` layout, multi-step wizard navigation, and action buttons (`Back`, `Next`, `Submit`), ensuring a consistent look and feel.

> **Developer Takeaway:** **Do not build CRUD pages from scratch.** Always use the `ResourceDataTable` as the foundation for list views and the `FormWrapper` for creation/editing interfaces.

---

## 3. Getting Started: Local Development

### Prerequisites
- Node.js (v18.17+)
- `pnpm` (recommended)

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/dashboard-template.git
cd dashboard-template
pnpm install
```

### 2. Configure Environment
Create a `.env` file by copying the example:
```bash
cp .env.example .env
```
Open `.env` and configure it. **For local development, ensure `NEXT_PUBLIC_DATA_SOURCE` is set to `local`**. This activates the mock API server. The remote API URLs are only needed when switching to `remote` mode.

### 3. Run the App
```bash
pnpm dev
```
The application will be available at `http://localhost:3000`.

---

## 4. How to Add a New Feature (A Step-by-Step Guide)

Let's walk through adding a new management page for **"Warehouses"** to an organization. This process demonstrates the core development pattern to follow.

**Step 1: Define the Types (`/types`)**
-   Open `types/resource-management.ts` (or the relevant domain file).
-   Add the new DTOs and Request types based on the API documentation.
    ```typescript
    export interface CreateWarehouseRequest { name: string; location: string; }
    export interface WarehouseDto extends Auditable { id: string; name: string; location: string; }
    ```

**Step 2: Update the API Client (`/lib/apiClient.ts`)**
-   Add functions for the new "Warehouses" endpoints to the relevant API client object (e.g., `yowyobOrganizationApi`).
    ```typescript
    // In yowyobOrganizationApi
    getWarehouses: (orgId: string) => yowyobApiRequest<WarehouseDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${orgId}/warehouses`),
    createWarehouse: (orgId: string, data: CreateWarehouseRequest) => yowyobApiRequest<WarehouseDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${orgId}/warehouses`, { method: 'POST', body: JSON.stringify(data) }),
    ```

**Step 3: Update the Repository Layer (`/lib/data-repo`)**
1.  Add the new methods to the interface (`organization-repository-interface.ts`).
2.  Implement the methods in the remote repository (`organization-remote-repository.ts`), calling the `apiClient` functions.
3.  Implement the methods in the local repository (`organization-local-repository.ts`), calling your new mock API endpoints.

**Step 4: Create the UI Components (`/components/organization`)**
-   Create a new folder: `components/organization/warehouses/`.
-   Inside, create the standard set of files:
    -   `warehouse-form.tsx`: A form component wrapped with `FormWrapper`.
    -   `columns.tsx`: Defines the `ColumnDef[]` for the data table.
    -   `warehouse-card.tsx`: Defines the component for the grid view.

**Step 5: Create the Page (`/app/(dashboard)`)**
-   Create a new route: `app/(dashboard)/business-actor/org/warehouses/`.
-   Inside, create two files:
    -   `page.tsx`: The server component for metadata.
    -   `warehouses-client.tsx`: The client component that uses `ResourceDataTable`, imports the components from Step 4, and contains all data-fetching and state logic.

**Step 6: Add to Navigation (`/components/sidebar.tsx`)**
-   Open `sidebar.tsx` and add the new link to the appropriate navigation array (e.g., `baGlobalNavigation`).

---

## 5. Important Notes & Caveats

-   **Mock API Limitations:** The local mock API (`NEXT_PUBLIC_DATA_SOURCE=local`) is excellent for UI development but is **not a perfect replica of the backend**. It does not enforce all database constraints or complex business logic. Always test against a staging `remote` environment before merging major features.
-   **API Inconsistencies:** You may encounter minor inconsistencies between the different microservice APIs (e.g., naming conventions, response structures). The repository layer is the correct place to normalize this data before it reaches the UI.
-   **Future Improvements:** A potential next step is to integrate a dedicated data-fetching library like **TanStack Query (React Query)**. This would centralize caching and state management (`isLoading`, `error`), further reducing boilerplate in the `*-client.tsx` files.

This document should provide a comprehensive foundation for any developer to understand, maintain, and extend the YowYob Dashboard application.
