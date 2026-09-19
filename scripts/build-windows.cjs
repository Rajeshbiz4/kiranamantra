const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const projectDirectory = path.resolve(__dirname, '..');
const cacheDirectory = path.join(projectDirectory, '.electron-builder-cache');
const viteCli = path.join(projectDirectory, 'node_modules', 'vite', 'bin', 'vite.js');
const builderCli = path.join(projectDirectory, 'node_modules', 'electron-builder', 'out', 'cli', 'cli.js');
const environment = {
  ...process.env,
  ELECTRON_BUILDER_CACHE: cacheDirectory,
  CSC_IDENTITY_AUTO_DISCOVERY: 'false'
};

const buildStamp = new Date().toISOString().replace(/[:.]/g, '-');

function outputDirectory(attempt) {
  return path.join(os.tmpdir(), 'KiranaMitra-builds', `build-${buildStamp}-${process.pid}-${attempt}`);
}

function wait(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function findInstaller(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'win-unpacked') continue;
      const found = findInstaller(candidate);
      if (found) return found;
    } else if (/KiranaMitra-Setup-.*\.exe$/i.test(entry.name)) {
      return candidate;
    }
  }
  return null;
}

function publishInstaller(buildDirectory) {
  const installer = findInstaller(buildDirectory);
  if (!installer) throw new Error('The build completed but the installer EXE was not found.');
  const destinationDirectory = path.join(projectDirectory, 'release-installers');
  fs.mkdirSync(destinationDirectory, { recursive: true });
  const destination = path.join(
    destinationDirectory,
    `KiranaMitra-Setup-${buildStamp}.exe`
  );
  fs.copyFileSync(installer, destination);
  return destination;
}

function run(command, args) {
  return spawnSync(command, args, {
    cwd: projectDirectory,
    env: environment,
    stdio: 'inherit',
    shell: false
  }).status ?? 1;
}

if (run(process.execPath, [viteCli, 'build']) !== 0) {
  process.exit(1);
}

function buildInstaller(attempt) {
  const output = outputDirectory(attempt);
  fs.mkdirSync(output, { recursive: true });
  console.log(`\nBuilding Windows installer in temporary folder: ${output}\n`);
  return {
    output,
    status: run(process.execPath, [
      builderCli,
      '--win',
      'nsis',
      '--publish',
      'never',
      `--config.directories.output=${output}`
    ])
  };
}

let result;
let status = 1;
for (let attempt = 1; attempt <= 5 && status !== 0; attempt += 1) {
  result = buildInstaller(attempt);
  status = result.status;
  if (status !== 0 && attempt < 5) {
    console.log(`\nBuild attempt ${attempt} failed. Waiting for Windows Security to release files before retrying...\n`);
    if (attempt === 1) {
      fs.rmSync(cacheDirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 });
    }
    wait(attempt * 4000);
  }
}

if (status === 0) {
  try {
    const installer = publishInstaller(result.output);
    console.log(`\nInstaller created successfully:\n${installer}\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    status = 1;
  }
}
if (status !== 0) {
  console.error('\nThe installer could not be created after 5 attempts. Close any running KiranaMitra window and temporarily allow the project and Windows TEMP folders in antivirus, then run BUILD_WINDOWS_INSTALLER.bat again.\n');
}
process.exit(status);
