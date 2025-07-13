// lib/data-repo/map/index.ts
import { IMapRepository } from './map-repository-interface';
import { MapLocalRepository } from './map-local-repository';
import { MapRemoteRepository } from './map-remote-repository';

// let mapRepositoryInstance: IMapRepository;

// We use the same global data source flag
const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;

// if (dataSource == 'local') {
//   console.log("INFO: Using Local Map Repository (via Mock Geo API)");
//   mapRepositoryInstance = new MapLocalRepository();
// } else {
console.log("INFO: Using Remote Map Repository (Nominatim API)");
const mapRepositoryInstance = new MapRemoteRepository();
// }

export const mapRepository = mapRepositoryInstance;