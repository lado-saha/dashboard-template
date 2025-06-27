import { IAuthRepository } from './auth-repository-interface';
import { AuthLocalRepository } from './auth-local-repository';
import { AuthRemoteRepository } from './auth-remote-repository';

let authRepositoryInstance: IAuthRepository;

const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;

if (dataSource === 'local') {
  console.log("INFO: Using Local Auth Repository (fetches from /api/mock/*)");
  authRepositoryInstance = new AuthLocalRepository();
} else {
  console.log("INFO: Using Remote Auth Repository (Yowyob Auth API via Proxy)");
  authRepositoryInstance = new AuthRemoteRepository();
}

export const authRepository = authRepositoryInstance;