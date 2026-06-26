// NOTE: `@google-cloud/pubsub` was removed from this build because it pulls in a
// native `grpc` addon that no longer ships prebuilt binaries and no longer
// compiles on a modern toolchain. The Google Pub/Sub queue provider is
// therefore disabled; use QUEUE_PROVIDER=REDIS (default here) instead. The
// exports below preserve the provider interface (so the queue factory still
// resolves) and only throw if PUBSUB is actually selected and used.
const disabled = () => {
  throw new Error(
    'Google Pub/Sub queue provider (QUEUE_PROVIDER=PUBSUB) is disabled in ' +
    'this build. Use QUEUE_PROVIDER=REDIS.'
  );
};

export const publish = () => disabled();
export const subscribe = () => disabled();
export const unsubscribeAll = () => disabled();
