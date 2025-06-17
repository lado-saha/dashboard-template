// lib/data-repo/organization/index.ts
import { IOrganizationRepository } from './organization-repository-interface';
import { OrganizationLocalRepository } from './organization-local-repository';
import { OrganizationRemoteRepository } from './organization-remote-repository';

let organizationRepositoryInstance: IOrganizationRepository;

const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;

if (dataSource === 'local') {
  console.log("INFO: Using Local Organization Repository (via Next.js Mock API Routes)");
  organizationRepositoryInstance = new OrganizationLocalRepository();
} else {
  console.log("INFO: Using Remote Organization Repository (Yowyob Org API)");
  organizationRepositoryInstance = new OrganizationRemoteRepository();
}

export const organizationRepository = organizationRepositoryInstance;