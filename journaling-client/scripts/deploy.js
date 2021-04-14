const path = require("path");
const childProcess = require("child_process");
const env = require("../src/env.json");
const deployOut = require("../../cdk/deploy-output.json");

const stack = deployOut[`JournalingStack-${env.envName}`];

const { uiBucket: bucket, uiDistribution: cfDistribution } = stack;
console.assert(
  bucket,
  "Expected Bucket to exist in JSON: " + JSON.stringify(deployOut)
);

console.log(`Syncing with ${bucket}...`);

childProcess.execSync(
  `aws s3 sync ${path.join(__dirname, "..", "build")} ${bucket} --delete`,
  {
    stdio: "inherit",
  }
);

console.log("UI is deployed!");

console.log("Invalidating distribution cache...");
childProcess.execSync(
  `aws cloudfront create-invalidation --distribution-id ${cfDistribution} --paths "/*" --output text`,
  {
    stdio: "inherit",
  }
);

console.log("Done!");
