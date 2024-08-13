// node:process event handlers for testing

const unhandledRejections = new Map();

process.on('unhandledRejection', (reason, promise) => {
  unhandledRejections.set(promise, reason);
});
process.on('rejectionHandled', (promise) => {
  unhandledRejections.delete(promise);
});

/*
// deprecated in node.js 17.6.0
process.on('multipleResolves', (type, promise, reason) => {
  console.error("multipleResolves ", type, reason ? reason.message : "");
  //console.error(type, promise, reason);
  //setImmediate(() => process.exit(1));
});
*/

process.on('warning', (warning) => {
  console.warn("process: " + warning.name);
  console.warn("process: " + warning.message);
  console.warn("process: " + warning.stack);
});

process.on('beforeExit', (code) => {
  console.log('Process beforeExit event with code: ', code);
});

process.on('exit', (code) => {
  console.log('Process exit event with code: ', code);
  for (let [ promise, reason ] of unhandledRejections) {
    let prom = JSON.stringify(promise);
    console.log(`unhandledPromise ${prom}: ${reason}`);
  }
  if (unhandledRejections.size > 0)
    process.exitCode = 1;
});
