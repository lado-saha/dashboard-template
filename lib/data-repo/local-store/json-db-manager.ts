// lib/data-repo/local-store/json-db-manager.ts
import fs from "fs";
import path from "path";
import {
  UserDto, RoleDto, PermissionDto, RolePermissionDto, RbacResource,
} from "@/types/auth";
import {
  OrganizationDto, OrganizationTableRow, ContactDto, AddressDto, AgencyDto, EmployeeDto, BusinessDomainDto,
  ImageDto, ThirdPartyDto, ProposedActivityDto, SalesPersonDto, CustomerOrgDto, ProviderDto, ProspectDto,
  PracticalInformationDto, CertificationDto, ApplicationDto, ApplicationKeyDto, BusinessActorDto,
} from "@/types/organization";
// import { ResourceDto, ServiceDto } from "@/types/resourceManagement";
import { UserPreferencesDto } from "@/types/user-preferences";

export type CollectionName =
  | "authUsers"
  | "authRoles" | "authPermissions" | "authRolePermissions" | "authRbacResources"
  | "organizationsTableRows" | "organizationsDetails" | "contacts" | "addresses"
  | "agencies" | "employees" | "salesPersons" | "orgCustomers" | "providers" | "userPreferences"
  | "prospects" | "practicalInformation" | "certifications" | "businessDomains"
  | "organizationImages" | "thirdParties" | "proposedActivities" | "businessActors"
  | "applicationsData" | "applicationKeysData"
// | "resources" 
// | "services";

export interface LocalJsonDBCollections {
  authUsers: UserDto[]; authRoles: RoleDto[]; authPermissions: PermissionDto[]; authRolePermissions: RolePermissionDto[]; authRbacResources: RbacResource[];
  organizationsTableRows: OrganizationTableRow[]; organizationsDetails: OrganizationDto[]; contacts: ContactDto[]; addresses: AddressDto[];
  userPreferences: UserPreferencesDto[]; agencies: AgencyDto[]; employees: EmployeeDto[]; salesPersons: SalesPersonDto[];
  orgCustomers: CustomerOrgDto[]; providers: ProviderDto[]; prospects: ProspectDto[]; practicalInformation: PracticalInformationDto[];
  certifications: CertificationDto[]; businessDomains: BusinessDomainDto[]; organizationImages: ImageDto[]; thirdParties: ThirdPartyDto[];
  proposedActivities: ProposedActivityDto[]; businessActors: BusinessActorDto[]; applicationsData: ApplicationDto[];
  applicationKeysData: ApplicationKeyDto[];
  // resources: ResourceDto[];
  //  services: ServiceDto[];
}

const collectionFileMap: Record<CollectionName, string> = {
  authUsers: "auth-users.json", authRoles: "auth-roles.json", authPermissions: "auth-permissions.json",
  authRolePermissions: "auth-role-permissions.json", authRbacResources: "auth-rbac-resources.json",
  organizationsTableRows: "organizations-table-rows.json", organizationsDetails: "organizations-details.json",
  contacts: "contacts.json", addresses: "addresses.json", agencies: "agencies.json", employees: "employees.json",
  salesPersons: "sales-persons.json", orgCustomers: "org-customers.json", providers: "providers.json",
  userPreferences: "user-preferences.json", prospects: "prospects.json", practicalInformation: "practical-information.json",
  certifications: "certifications.json", businessDomains: "business-domains.json", organizationImages: "organization-images.json",
  thirdParties: "third-parties.json", proposedActivities: "proposed-activities.json", businessActors: "business-actors.json",
  applicationsData: "applications-data.json", applicationKeysData: "application-keys.json",
  // resources: "resources.json",
  // services: "services.json",
};

// NEW: Explicit mapping of collection name to its primary ID field.
const collectionIdMap: Record<CollectionName, string> = {
  authUsers: "id",
  authRoles: "id",
  authPermissions: "id",
  authRolePermissions: "id", // Composite key, but we need one for the manager. 'id' will be auto-generated.
  authRbacResources: "id", // Auto-generated
  organizationsTableRows: "organization_id",
  organizationsDetails: "organization_id",
  contacts: "contact_id",
  addresses: "address_id",
  agencies: "agency_id",
  employees: "employee_id",
  salesPersons: "sales_person_id",
  orgCustomers: "customer_id",
  providers: "provider_id",
  userPreferences: "user_id", // Specific key for this collection
  prospects: "prospect_id",
  practicalInformation: "information_id",
  certifications: "certification_id",
  businessDomains: "id",
  organizationImages: "id",
  thirdParties: "id",
  proposedActivities: "activity_id",
  businessActors: "business_actor_id",
  applicationsData: "id",
  applicationKeysData: "public_key",
  // resources: "resource_id",
  // services: "service_id",
};


const dataDir = path.resolve(process.cwd(), "lib/data-repo/local-store/json-data");

function getCollectionFilePath(collectionName: CollectionName): string {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const filename = collectionFileMap[collectionName];
  if (!filename) throw new Error(`No filename mapping for collection: ${collectionName}`);
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]), "utf-8");
  return filePath;
}

function readCollectionData<T>(collectionName: CollectionName): T[] {
  const filePath = getCollectionFilePath(collectionName);
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return fileContent.trim() === "" ? [] : JSON.parse(fileContent) as T[];
  } catch (error: any) {
    console.error(`Error reading or parsing ${collectionFileMap[collectionName]}:`, error);
    try {
      fs.writeFileSync(filePath, JSON.stringify([]), "utf-8");
    } catch (writeError) {
      console.error(`CRITICAL: Could not write default empty array to ${collectionName}.json:`, writeError);
    }
    return [];
  }
}

function writeCollectionData<T>(collectionName: CollectionName, data: T[]): void {
  const filePath = getCollectionFilePath(collectionName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error: any) {
    console.error(`Error writing to ${collectionFileMap[collectionName]}:`, error);
  }
}

type Identifiable = { id?: string;[key: string]: any };

// REFACTORED: Use the collectionIdMap for a direct lookup.
function getPrimaryKeyField(collectionName: CollectionName): string {
  return collectionIdMap[collectionName] || "id"; // Fallback to 'id' if not in map
}

export const dbManager = {
  getCollection: <C extends CollectionName>(collectionName: C): LocalJsonDBCollections[C] => {
    return readCollectionData<LocalJsonDBCollections[C][number]>(collectionName) as LocalJsonDBCollections[C];
  },
  saveCollection: <C extends CollectionName>(collectionName: C, data: LocalJsonDBCollections[C]): void => {
    writeCollectionData<LocalJsonDBCollections[C][number]>(collectionName, data);
  },
  addItem: <C extends CollectionName>(
    collectionName: C,
    itemData: Omit<LocalJsonDBCollections[C][number], "created_at" | "updated_at">
  ): LocalJsonDBCollections[C][number] => {
    const collection = dbManager.getCollection(collectionName);
    const idKey = getPrimaryKeyField(collectionName);
    const idPrefix = collectionName.toString().replace(/([A-Z])/g, "-$1").toLowerCase().split("-")[0].substring(0, 4);

    let generatedId = (itemData as Identifiable)[idKey];
    if (!generatedId) {
      generatedId = `mock-${idPrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    const newItem = {
      ...itemData,
      [idKey]: generatedId,
      ...(idKey !== "id" && !("id" in itemData) && { id: generatedId }),
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
    updates: Partial<Omit<LocalJsonDBCollections[C][number], "created_at">>
  ): LocalJsonDBCollections[C][number] | null => {
    const collection = dbManager.getCollection(collectionName);
    const idKey = getPrimaryKeyField(collectionName);
    const itemIndex = (collection as Identifiable[]).findIndex(item => (item as any)[idKey] === id);

    if (itemIndex > -1) {
      (collection as Identifiable[])[itemIndex] = {
        ...(collection as Identifiable[])[itemIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      dbManager.saveCollection(collectionName, collection);
      return (collection as Identifiable[])[itemIndex] as LocalJsonDBCollections[C][number];
    }
    return null;
  },
  getItemById: <C extends CollectionName>(collectionName: C, id: string): LocalJsonDBCollections[C][number] | null => {
    const collection = dbManager.getCollection(collectionName);
    const idKey = getPrimaryKeyField(collectionName);
    return (collection as Identifiable[]).find(item => (item as any)[idKey] === id) as LocalJsonDBCollections[C][number] | null;
  },
  deleteItem: <C extends CollectionName>(collectionName: C, id: string): boolean => {
    let collection = dbManager.getCollection(collectionName);
    const initialLength = collection.length;
    const idKey = getPrimaryKeyField(collectionName);
    const newCollection = (collection as Identifiable[]).filter(item => (item as any)[idKey] !== id);
    if (newCollection.length < initialLength) {
      dbManager.saveCollection(collectionName, newCollection as LocalJsonDBCollections[C]);
      return true;
    }
    return false;
  },
};
