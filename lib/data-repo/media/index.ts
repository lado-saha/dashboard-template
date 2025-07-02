import { IMediaRepository } from './media-repository-interface';
import { MediaLocalRepository } from './media-local-repository';
import { MediaRemoteRepository } from './media-remote-repository';

let mediaRepository: IMediaRepository;

const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;

if (dataSource === 'local') {
  console.log("INFO: Using Local Media Repository");
  mediaRepository = new MediaLocalRepository();
} else {
  console.log("INFO: Using Remote Media Repository");
  mediaRepository = new MediaRemoteRepository();
}

export { mediaRepository };