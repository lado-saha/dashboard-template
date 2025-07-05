# Temporary Workarounds for Backend Limitations

This document outlines temporary workarounds implemented in the frontend due to current backend API limitations. These should be removed once the backend services are updated.

## 1. User-to-BusinessActor Link

- **Issue:** The `/auth-service/api/login` endpoint does not directly return the `business_actor_id` associated with a user. There is no direct way to get a `BusinessActor` by their `user_id`.
- **Workaround:**
  - **On Create:** The `user_id` is embedded as a hidden tag (`[yowyob_id:user_id=...]`) within the `biography` field of the `BusinessActor` profile.
  - **On Login:** The `authorize` function fetches all business actors and filters them by parsing the `biography` field to find a match for the current `user_id`. This is highly inefficient but necessary.
- **Required Backend Fix:**
  1.  The `GET /business-actors` endpoint should accept a `userId` query parameter (`/business-actors?userId=...`).
  2.  Alternatively, the `/auth-service/api/login` response should include the `business_actor_id` if it exists.

## 2. Organization-to-BusinessActor Link

- **Issue:** The `OrganizationDto` does not contain the `business_actor_id` of its owner. The `getMyOrganizations` endpoint is not yet available.
- **Workaround:**
  - **On Create:** The `business_actor_id` is embedded as a hidden tag (`[yowyob_id:ba_id=...]`) within the `description` field of the `Organization`.
  - **On Fetch:** The `ActiveOrganizationContext` fetches all organizations and filters them on the client-side by parsing the `description` field to find the ones belonging to the current BA.
- **Required Backend Fix:**
  1.  The `OrganizationDto` must include a `business_actor_id` field.
  2.  A dedicated `/organizations/my-organizations` or `/business-actors/{baId}/organizations` endpoint is needed to avoid fetching all organizations.

These workarounds are implemented in `lib/id-parser.ts`, `app/api/auth/[...nextauth]/route.ts`, and the respective `onSubmit` functions in the `BusinessActorForm` and `OrganizationForm` components.
