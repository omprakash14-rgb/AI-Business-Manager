import { spawn } from 'node:child_process';

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('\x1b[36m%s\x1b[0m', '🚀 Launching AI Business Manager (Fastify API + Vite Web)...');

const api = spawn(npmCmd, ['run', 'dev:api'], {
  stdio: 'inherit',
  shell: true
});

const web = spawn(npmCmd, ['run', 'dev:web'], {
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down development servers...');
  if (isWin) {
    if (api.pid) spawn('taskkill', ['/pid', api.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
    if (web.pid) spawn('taskkill', ['/pid', web.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
  } else {
    api.kill('SIGTERM');
    web.kill('SIGTERM');
  }
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
