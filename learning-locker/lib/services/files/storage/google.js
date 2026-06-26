// NOTE: `@google-cloud/storage` was removed from this build because it pulls in
// a native `grpc` addon that no longer ships prebuilt binaries and no longer
// compiles on a modern toolchain. Google Cloud Storage is therefore disabled;
// use FS_REPO=local (default) or FS_REPO=azure. The functions below preserve
// the module's export shape (so the storage factory still resolves) and only
// throw if Google storage is actually selected and used.
const disabled = () => {
  throw new Error(
    'Google Cloud Storage (FS_REPO=google) is disabled in this build. ' +
    'Use FS_REPO=local (default) or FS_REPO=azure.'
  );
};

export const uploadFromStream = () => () => disabled();
export const uploadFromPath = () => () => disabled();
export const downloadToStream = () => () => disabled();
