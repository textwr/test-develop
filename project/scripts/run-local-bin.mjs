import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function resolveFromRoot(...segments) {
  return path.resolve(projectRoot, ...segments);
}

function runNodeScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: projectRoot,
      stdio: "inherit",
      shell: false,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`명령 실행에 실패했습니다. 종료 코드: ${code ?? "알 수 없음"}`));
    });
  });
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case "dev":
      await runNodeScript(resolveFromRoot("node_modules", "vite", "bin", "vite.js"));
      break;
    case "build":
      await runNodeScript(resolveFromRoot("node_modules", "typescript", "bin", "tsc"), ["-b"]);
      await runNodeScript(resolveFromRoot("node_modules", "vite", "bin", "vite.js"), ["build"]);
      break;
    case "lint":
      await runNodeScript(resolveFromRoot("node_modules", "eslint", "bin", "eslint.js"), ["."]);
      break;
    case "preview":
      await runNodeScript(resolveFromRoot("node_modules", "vite", "bin", "vite.js"), ["preview"]);
      break;
    default:
      throw new Error(`지원하지 않는 명령입니다: ${command ?? "없음"}`);
  }
}

await main();
