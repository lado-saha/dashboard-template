// lib/data-repositories/local-store/json-db-manager.ts
import fs from "fs";
import path from "path";
import {
  UserDto,
  RoleDto,
  PermissionDto,
  RolePermissionDto,
  RbacResource,
} from "@/types/auth";
import {
  OrganizationDto,
  OrganizationTableRow,
  ContactDto,
  AddressDto,
  AgencyDto,
  EmployeeDto,
  BusinessDomainDto,
  ImageDto,
  ThirdPartyDto,
  ProposedActivityDto,
  SalesPersonDto,
  CustomerOrgDto,
  ProviderDto,
  ProspectDto,
  PracticalInformationDto,
  CertificationDto,
  ApplicationDto,
  ApplicationKeyDto,
  BusinessActorDto,
} from "@/types/organization";
import { ResourceDto, ServiceDto } from "@/types/resourceManagement";

export type CollectionName =
  | "authUsers"
  | "authRoles"
  | "authPermissions"
  | "authRolePermissions"
  | "authRbacResources"
  | "organizationsTableRows"
  | "organizationsDetails"
  | "contacts"
  | "addresses"
  | "agencies"
  | "employees"
  | "salesPersons"
  | "orgCustomers"
  | "providers"
  | "prospects"
  | "practicalInformation"
  | "certifications"
  | "businessDomains"
  | "organizationImages"
  | "thirdParties"
  | "proposedActivities"
  | "businessActors"
  | "applicationsData"
  | "applicationKeysData"
  | "resources"
  | "services";

export interface LocalJsonDBCollections {
  authUsers: UserDto[];
  authRoles: RoleDto[];
  authPermissions: PermissionDto[];
  authRolePermissions: RolePermissionDto[];
  authRbacResources: RbacResource[];
  organizationsTableRows: OrganizationTableRow[];
  organizationsDetails: OrganizationDto[];
  contacts: ContactDto[];
  addresses: AddressDto[];
  agencies: AgencyDto[];
  employees: EmployeeDto[];
  salesPersons: SalesPersonDto[];
  orgCustomers: CustomerOrgDto[];
  providers: ProviderDto[];
  prospects: ProspectDto[];
  practicalInformation: PracticalInformationDto[];
  certifications: CertificationDto[];
  businessDomains: BusinessDomainDto[];
  organizationImages: ImageDto[];
  thirdParties: ThirdPartyDto[];
  proposedActivities: ProposedActivityDto[];
  businessActors: BusinessActorDto[];
  applicationsData: ApplicationDto[];
  applicationKeysData: ApplicationKeyDto[];
  resources: ResourceDto[];
  services: ServiceDto[];
}

const collectionFileMap: Record<CollectionName, string> = {
  authUsers: "auth-users.json",
  authRoles: "auth-roles.json",
  authPermissions: "auth-permissions.json",
  authRolePermissions: "auth-role-permissions.json",
  authRbacResources: "auth-rbac-resources.json",
  organizationsTableRows: "organizations-table-rows.json",
  organizationsDetails: "organizations-details.json",
  contacts: "contacts.json",
  addresses: "addresses.json",
  agencies: "agencies.json",
  employees: "employees.json",
  salesPersons: "sales-persons.json",
  orgCustomers: "org-customers.json",
  providers: "providers.json",
  prospects: "prospects.json",
  practicalInformation: "practical-information.json",
  certifications: "certifications.json",
  businessDomains: "business-domains.json",
  organizationImages: "organization-images.json",
  thirdParties: "third-parties.json",
  proposedActivities: "proposed-activities.json",
  businessActors: "business-actors.json",
  applicationsData: "applications-data.json",
  applicationKeysData: "application-keys.json",
  resources: "resources.json",
  services: "services.json",
};

const dataDir = path.resolve(
  process.cwd(),
  "lib/data-repo/local-store/json-data"
);

// Standalone helper to get the file path for a collection
function getCollectionFilePath(collectionName: CollectionName): string {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const filename = collectionFileMap[collectionName];
  if (!filename) {
    throw new Error(`No filename mapping for collection: ${collectionName}`);
  }
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]), "utf-8"); // Initialize with empty array
  }
  return filePath;
}

function readCollectionData<T>(collectionName: CollectionName): T[] {
  const filePath = getCollectionFilePath(collectionName); // Use the helper
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return fileContent.trim() === "" ? [] : (JSON.parse(fileContent) as T[]);
  } catch (error) {
    console.error(
      `Error reading or parsing ${collectionFileMap[collectionName]}:`,
      error
    );
    try {
      fs.writeFileSync(filePath, JSON.stringify([]), "utf-8");
    } catch (writeError) {
      console.error(
        `CRITICAL: Could not write default empty array to ${collectionName}.json:`,
        writeError
      );
    }
    return [];
  }
}

function writeCollectionData<T>(
  collectionName: CollectionName,
  data: T[]
): void {
  const filePath = getCollectionFilePath(collectionName); // Use the helper
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(
      `Error writing to ${collectionFileMap[collectionName]}:`,
      error
    );
  }
}

// Define Identifiable type
type Identifiable = { id?: string;[key: string]: any };

// Define getPrimaryKeyField function
function getPrimaryKeyField(
  item: Identifiable | undefined | null,
  collectionName: CollectionName
): string {
  if (!item) return "id"; // Default if item is undefined

  const specificKeys: Partial<Record<CollectionName, string>> = {
    organizationsTableRows: "organization_id",
    organizationsDetails: "organization_id",
    contacts: "contact_id",
    addresses: "address_id",
    agencies: "agency_id",
    employees: "employee_id",
    salesPersons: "sales_person_id",
    orgCustomers: "customer_id",
    providers: "provider_id",
    prospects: "prospect_id",
    practicalInformation: "information_id",
    certifications: "certification_id",
    proposedActivities: "activity_id",
    businessActors: "business_actor_id",
    applicationKeysData: "public_key", // Example, might be 'id' or composite
    resources: "resource_id",
    services: "service_id",
    // authUsers, authRoles, authPermissions, businessDomains, organizationImages, applicationsData, thirdParties typically use 'id'
  };
  if (specificKeys[collectionName] && specificKeys[collectionName]! in item) {
    return specificKeys[collectionName]!;
  }
  if ("id" in item && typeof item.id === "string") return "id"; // Prioritize 'id' if it exists
  // Fallback to first *Id field if no specific key or 'id' found
  return Object.keys(item).find((k) => k.endsWith("_id")) || "id";
}

export const dbManager = {
  getCollection: <C extends CollectionName>(
    collectionName: C
  ): LocalJsonDBCollections[C] => {
    return readCollectionData<LocalJsonDBCollections[C][number]>(
      collectionName
    ) as LocalJsonDBCollections[C];
  },
  saveCollection: <C extends CollectionName>(
    collectionName: C,
    data: LocalJsonDBCollections[C]
  ): void => {
    writeCollectionData<LocalJsonDBCollections[C][number]>(
      collectionName,
      data
    );
  },
  addItem: <C extends CollectionName>(
    collectionName: C,
    itemData: Omit<
      LocalJsonDBCollections[C][number],
      "id" | "created_at" | "updated_at" | (string & { endsWith: "_id" })
    > & { id?: string;[key: string]: any }
  ): LocalJsonDBCollections[C][number] => {
    const collection = dbManager.getCollection(collectionName);
    const idKey = getPrimaryKeyField(itemData as Identifiable, collectionName);
    const idPrefix = collectionName
      .toString()
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()
      .split("-")[0]
      .substring(0, 4);

    let generatedId = (itemData as Identifiable)[idKey] || itemData.id;
    if (!generatedId && idKey === "user_id" && itemData.user_id) {
      // Specific for userPreferences if key is user_id
      generatedId = itemData.user_id;
    } else if (!generatedId) {
      generatedId = `mock-${idPrefix}-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;
    }

    const newItem = {
      ...itemData,
      [idKey]: generatedId,
      ...(idKey !== "id" && !itemData.id && { id: generatedId }), // Ensure 'id' field is also present if primary key is different and id not provided
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as LocalJsonDBCollections[C][number];

    (collection as any[]).push(newItem);
    dbManager.saveCollection(collectionName, collection);
    return newItem;
  },
  updateItem: <C extends CollectionName>(
    collectionName: C,
    id: string,
    updates: Partial<
      Omit<
        LocalJsonDBCollections[C][number],
        "created_at" | "id" | (string & { endsWith: "_id" })
      >
    >
  ): LocalJsonDBCollections[C][number] | null => {
    const collection = dbManager.getCollection(collectionName);
    const idKey = getPrimaryKeyField((collection as any)[0], collectionName);
    const itemIndex = (collection as Identifiable[]).findIndex(
      (item) => (item as any)[idKey] === id
    );

    if (itemIndex > -1) {
      (collection as Identifiable[])[itemIndex] = {
        ...(collection as Identifiable[])[itemIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      dbManager.saveCollection(collectionName, collection);
      return (collection as Identifiable[])[
        itemIndex
      ] as LocalJsonDBCollections[C][number];
    }
    return null;
  },
  getItemById: <C extends CollectionName>(
    collectionName: C,
    id: string
  ): LocalJsonDBCollections[C][number] | null => {
    const collection = dbManager.getCollection(collectionName);
    // To get the idKey, we need a sample item or a more robust way if collection can be empty
    const sampleItem = (collection as any)[0];
    const idKey = getPrimaryKeyField(sampleItem, collectionName);
    return (
      ((collection as Identifiable[]).find(
        (item) => (item as any)[idKey] === id
      ) as LocalJsonDBCollections[C][number]) || null
    );
  },
  deleteItem: <C extends CollectionName>(
    collectionName: C,
    id: string
  ): boolean => {
    let collection = dbManager.getCollection(collectionName);
    const initialLength = collection.length;
    const sampleItem = (collection as any)[0];
    const idKey = getPrimaryKeyField(sampleItem, collectionName);
    const newCollection = (collection as Identifiable[]).filter(
      (item) => (item as any)[idKey] !== id
    );
    if (newCollection.length < initialLength) {
      dbManager.saveCollection(
        collectionName,
        newCollection as LocalJsonDBCollections[C]
      );
      return true;
    }
    return false;
  },
};
