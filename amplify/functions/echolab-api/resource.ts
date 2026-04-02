import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { defineFunction } from "@aws-amplify/backend";
import { DockerImage, Duration } from "aws-cdk-lib";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";

const functionDir = path.dirname(fileURLToPath(import.meta.url));

function removePythonBytecodeCaches(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "__pycache__") {
        fs.rmSync(fullPath, { recursive: true, force: true });
        continue;
      }

      removePythonBytecodeCaches(fullPath);
      continue;
    }

    if (entry.isFile()) {
      if (entry.name.endsWith(".pyc") || entry.name.endsWith(".pyo")) {
        fs.rmSync(fullPath, { force: true });
      }
    }
  }
}

export const echolabApi = defineFunction((scope) =>
  new Function(scope, "echolab-api", {
    runtime: Runtime.PYTHON_3_11,
    handler: "index.handler",
    timeout: Duration.seconds(30),
    memorySize: 1024,
    code: Code.fromAsset(functionDir, {
      bundling: {
        // `image` is required by the CDK, but we'll bundle locally (no Docker).
        image: DockerImage.fromRegistry("dummy"),
        local: {
          tryBundle(outputDir: string) {
            const requirementsPath = path.join(functionDir, "requirements.txt");
            execSync(
              `python3 -m pip install -r "${requirementsPath}" -t "${outputDir}" --platform manylinux2014_x86_64 --python-version 311 --only-binary=:all:`
            );

            // Copy only the runtime sources (avoid copying infra TS files).
            for (const name of ["index.py", "echolab", "requirements.txt"]) {
              const src = path.join(functionDir, name);
              const dest = path.join(outputDir, name);
              fs.cpSync(src, dest, { recursive: true, force: true });
            }

            // Ensure build artifacts never ship in the Lambda asset.
            removePythonBytecodeCaches(outputDir);
            return true;
          },
        },
      },
    }),
  })
, {
  resourceGroupName: "echolabApiStack",
});
