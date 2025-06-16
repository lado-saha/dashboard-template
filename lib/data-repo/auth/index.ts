// lib/data-repositories/auth/index.ts
import { IAuthRepository } from '@/lib/data-repo/auth/auth-repository-interface';
import { AuthLocalRepository } from '@/lib/data-repo/auth/auth-local-repository';
import { AuthRemoteRepository } from '@/lib/data-repo/auth/auth-remote-repository';

let authRepositoryInstance: IAuthRepository;

const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;

if (dataSource === 'local') {
  console.log("INFO: Using Local Auth Repository (fetches /data/*.json)");
  authRepositoryInstance = new AuthLocalRepository();
} else {
  console.log("INFO: Using Remote Auth Repository (Yowyob API)");
  authRepositoryInstance = new AuthRemoteRepository();
}

export const authRepository = authRepositoryInstance;