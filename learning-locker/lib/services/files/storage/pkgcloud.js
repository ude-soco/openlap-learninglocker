// NOTE: The `pkgcloud` npm package was removed from this build because it pulls
// in a native `grpc` addon whose prebuilt binaries are no longer hosted and
// which no longer compiles on a modern toolchain. The pkgcloud-backed storage
// providers (amazon / rackspace) are therefore disabled. Use FS_REPO=local
// (default) or FS_REPO=azure instead. createClient() throws only if one of the
// disabled providers is actually selected; the rest of the helpers are pure
// stream utilities and remain functional.
import fs from 'fs';
import Promise from 'bluebird';
import logger from 'lib/logger';
import defaultTo from 'lodash/defaultTo';
import { join } from 'path';

const subfolder = defaultTo(process.env.FS_SUBFOLDER, 'storage');

const getPrefixedPath = path => join(subfolder, path);

const uploadToClient = client => config => path => client.upload({
  ...config,
  remote: getPrefixedPath(path),
});

const downloadFromClient = client => config => path => client.download({
  ...config,
  remote: getPrefixedPath(path),
});

// Returns an inert client. amazon.js / rackspace.js call createClient() at
// module-load time, so this must not throw on construction; the error is
// deferred to an actual upload/download (which only happens if FS_REPO selects
// one of these disabled providers).
export const createClient = () => {
  const disabled = () => {
    throw new Error(
      'pkgcloud-backed storage (FS_REPO=amazon|rackspace) is disabled in this ' +
      'build. Use FS_REPO=local (default) or FS_REPO=azure.'
    );
  };
  return { upload: disabled, download: disabled };
};
export const createStreamUploader = client => config => toPath => fromStream =>
  new Promise((resolve, reject) => {
    const writeStream = uploadToClient(client)(config)(toPath);
    logger.debug('UPLOADING TO', toPath);
    writeStream.on('error', reject);
    writeStream.on('finish', resolve);
    fromStream.pipe(writeStream);
  });
export const createPathUploader = streamUploader => toPath => (fromPath) => {
  const fromStream = fs.createReadStream(fromPath);
  return streamUploader(toPath)(fromStream);
};
export const createStreamDownloader = client => config => fromPath => toStream =>
  new Promise((resolve, reject) => {
    const readStream = downloadFromClient(client)(config)(fromPath);
    logger.debug('DOWNLOADING FROM', fromPath);
    toStream.on('error', reject);
    toStream.on('finish', resolve);
    readStream.pipe(toStream);
  });

export default {
  createClient,
  createStreamUploader,
  createPathUploader,
  createStreamDownloader,
};
