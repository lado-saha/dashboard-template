import fs from 'fs';
import path from 'path';
import { UserDto, RoleDto, PermissionDto, RolePermissionDto, RbacResource } from '@/types/auth'; // Import all necessary auth types
import { OrganizationDto, OrganizationTableRow, ContactDto, AddressDto, AgencyDto, EmployeeDto, BusinessDomainDto } from '@/types/organization';
import { ResourceDto, ServiceDto } from '@/types/resourceManagement';

// Define the collections (filenames without .json)
export type CollectionName =
  | 'authUsers'
  | 'authRoles' // New
  | 'authPermissions' // New
  | 'authRolePermissions' // New for the join table concept
  | 'authRbacResources' // New
  | 'organizationsTable'
  | 'organizationsDetails'
  | 'contacts'
  | 'addresses'
  | 'agencies'
  | 'employees'
  | 'businessDomains'
  | 'resources'
  | 'services';

// Map collection names to their expected data types for type safety
export interface LocalJsonDBCollections {
  authUsers: UserDto[];
  authRoles: RoleDto[];
  authPermissions: PermissionDto[];
  authRolePermissions: RolePermissionDto[];
  authRbacResources: RbacResource[];
  organizationsTable: OrganizationTableRow[];
  organizationsDetails: OrganizationDto[];
  contacts: ContactDto[];
  addresses: AddressDto[];
  agencies: AgencyDto[];
  employees: EmployeeDto[];
  businessDomains: BusinessDomainDto[];
  resources: ResourceDto[];
  services: ServiceDto[];
}

const collectionFileMap: Record<CollectionName, string> = {
  authUsers: 'auth-users.json',
  authRoles: 'auth-roles.json',
  authPermissions: 'auth-permissions.json',
  authRolePermissions: 'auth-role-permissions.json',
  authRbacResources: 'auth-rbac-resources.json',
  organizationsTable: 'organizations-table.json',
  organizationsDetails: 'organizations-details.json',
  contacts: 'contacts.json',
  addresses: 'addresses.json',
  agencies: 'agencies.json',
  employees: 'employees.json',
  businessDomains: 'business-domains.json',
  resources: 'resources.json',
  services: 'services.json',
};

const dataDir = path.resolve(process.cwd(), 'lib/data-repo/local-store/json-data');

function ensureDataFileExists(collectionName: CollectionName): string {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const filename = collectionFileMap[collectionName];
  if (!filename) {
    throw new Error(`No filename mapping for collection: ${collectionName}`);
  }
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]), 'utf-8');
  }
  return filePath;
}

function readCollectionData<T>(collectionName: CollectionName): T[] {
  const filePath = ensureDataFileExists(collectionName);
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return fileContent.trim() === "" ? [] : JSON.parse(fileContent) as T[];
  } catch (error) {
    console.error(`Error reading or parsing ${collectionFileMap[collectionName]}:`, error);
    fs.writeFileSync(filePath, JSON.stringify([]), 'utf-8');
    return [];
  }
}

function writeCollectionData<T>(collectionName: CollectionName, data: T[]): void {
  const filePath = collectionFileMap[collectionName];
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing to ${collectionFileMap[collectionName]}:`, error);
  }
}

type Identifiable = { id?: string;[key: string]: any };

function getItemId<T extends Identifiable>(item: T): string | undefined {
  if (typeof item !== 'object' || item === null) return undefined;
  if (typeof item.id === 'string') return item.id;
  const potentialIdKeys = ['role_id', 'permission_id', 'user_id', 'organization_id', 'contact_id', 'address_id', 'agency_id', 'employee_id', 'resource_id', 'service_id'];
  for (const key of potentialIdKeys) {
    if (key in item && typeof item[key] === 'string') {
      return item[key] as string;
    }
  }
  return undefined;
}

export const dbManager = {
  getCollection: <T>(collectionName: CollectionName): T[] => {
    return readCollectionData<T>(collectionName);
  },
  saveCollection: <T>(collectionName: CollectionName, data: T[]): void => {
    writeCollectionData<T>(collectionName, data);
  },
  // Updated addItem to correctly use a generic type parameter matching CollectionName
  addItem: <C extends CollectionName>(collectionName: C, itemData: Omit<LocalJsonDBCollections[C][number], 'id' | 'created_at' | 'updated_at'> & { id?: string }): LocalJsonDBCollections[C][number] => {
    const collection = dbManager.getCollection<LocalJsonDBCollections[C][number]>(collectionName);
    const idKey = Object.keys(itemData).find(k => k.endsWith('_id')) || 'id'; // Prefer specific _id or default to 'id'

    const generatedId = (itemData as any)[idKey] || itemData.id || `mock-${collectionName.toString().slice(0, 4)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newItem = {
      ...itemData,
      [idKey]: generatedId, // Set the determined ID key
      id: generatedId, // Also ensure 'id' field exists if idKey was something else
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as LocalJsonDBCollections[C][number];

    (collection as any[]).push(newItem);
    dbManager.saveCollection(collectionName, collection as LocalJsonDBCollections[C][number][]);
    return newItem;
  },
  updateItem: <C extends CollectionName>(collectionName: C, id: string, updates: Partial<Omit<LocalJsonDBCollections[C][number], 'created_at' | 'id'>>): LocalJsonDBCollections[C][number] | null => {
    const collection = dbManager.getCollection<LocalJsonDBCollections[C][number]>(collectionName);
    const idKey = Object.keys((collection[0] || {}) as object).find(k => k.endsWith('_id') && (collection[0] as any)[k] === id) || 'id';

    const itemIndex = (collection as Identifiable[]).findIndex(item => getItemId(item) === id || item[idKey] === id);

    if (itemIndex > -1) {
      (collection as Identifiable[])[itemIndex] = {
        ...(collection as Identifiable[])[itemIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      dbManager.saveCollection(collectionName, collection as LocalJsonDBCollections[C][number][]);
      return (collection as Identifiable[])[itemIndex] as LocalJsonDBCollections[C][number];
    }
    console.warn(`[dbManager] Item with id ${id} not found in ${String(collectionName)} for update.`);
    return null;
  },
  getItemById: <C extends CollectionName>(collectionName: C, id: string): LocalJsonDBCollections[C][number] | null => {
    const collection = dbManager.getCollection<LocalJsonDBCollections[C][number]>(collectionName);
    const idKey = Object.keys((collection[0] || {}) as object).find(k => k.endsWith('_id') && (collection[0] as any)[k] === id) || 'id';
    return (collection as Identifiable[]).find(item => getItemId(item) === id || item[idKey] === id) as LocalJsonDBCollections[C][number] || null;
  },

  deleteItem: <C extends CollectionName>(collectionName: C, id: string): boolean => {
    let collection = dbManager.getCollection<LocalJsonDBCollections[C][number]>(collectionName);
    const initialLength = collection.length;
    const idKey = Object.keys((collection[0] || {}) as object).find(k => k.endsWith('_id') && (collection[0] as any)[k] === id) || 'id';

    const newCollection = (collection as Identifiable[]).filter(item => getItemId(item) !== id && item[idKey] !== id);
    if (newCollection.length < initialLength) {
      dbManager.saveCollection(collectionName, newCollection as LocalJsonDBCollections[C][number][]);
      return true;
    }
    return false;
  },
};