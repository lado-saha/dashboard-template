import { IUserPreferencesRepository } from './user-preferences-repository-interface';
import { UserPreferencesLocalRepository } from './user-preferences-local-repository';
import { UserPreferencesRemoteRepository } from './user-preferences-remote-repository';

let userPreferencesRepository: IUserPreferencesRepository;

const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;

if (dataSource === 'local') {
  console.log("INFO: Using Local UserPreferences Repository (fetches from /api/mock/*)");
  userPreferencesRepository = new UserPreferencesLocalRepository();
} else {
  console.log("INFO: Using Remote UserPreferences Repository (via Proxy)");
  userPreferencesRepository = new UserPreferencesRemoteRepository();
}

export { userPreferencesRepository };