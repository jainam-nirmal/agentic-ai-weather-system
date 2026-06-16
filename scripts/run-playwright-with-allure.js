import { spawn, spawnSync } from 'child_process';

const testTarget = process.argv[2] || '';

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: true,
  });

  return typeof result.status === 'number' ? result.status : 1;
}

const cleanExitCode = runCommand('npm', ['run', 'clean:allure']);
if (cleanExitCode !== 0) {
  process.exit(cleanExitCode);
}

const testArgs = ['playwright', 'test'];
if (testTarget) {
  testArgs.push(testTarget);
}

const testExitCode = runCommand('npx', testArgs);

const generateExitCode = runCommand('npm', ['run', 'allure:generate']);
if (generateExitCode !== 0) {
  process.exit(generateExitCode);
}

const openProcess = spawn('npm', ['run', 'allure:open'], {
  stdio: 'ignore',
  shell: true,
  detached: true,
});
openProcess.unref();

process.exit(testExitCode);
