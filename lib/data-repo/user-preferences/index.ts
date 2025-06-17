// lib/data-repo/user-preferences/index.ts
import { IUserPreferencesRepository } from './user-preferences-repository-interface';
import { UserPreferencesLocalRepository } from './user-preferences-local-repository';
import { UserPreferencesRemoteRepository } from './user-preferences-remote-repository';

let userPreferencesRepository: IUserPreferencesRepository;

const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;

if (dataSource === 'local') {
  console.log("INFO: Using Local UserPreferences Repository (via Next.js Mock API Routes)");
  userPreferencesRepository = new UserPreferencesLocalRepository();
} else {
  console.log("INFO: Using Remote UserPreferences Repository");
  userPreferencesRepository = new UserPreferencesRemoteRepository();
}

export { userPreferencesRepository };