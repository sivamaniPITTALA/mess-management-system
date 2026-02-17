const { exec, spawn } = require('child_process');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';

function runCommand(command, cwd, callback) {
  console.log(`Running: ${command} in ${cwd}`);
  const child = exec(command, { cwd }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return callback(error);
    }
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    callback(null);
  });
}

function installDependencies() {
  console.log('\n=== Installing Backend Dependencies ===');
  runCommand('npm install', path.join(__dirname, 'backend'), (err) => {
    if (err) {
      console.error('Failed to install backend dependencies');
      process.exit(1);
    }
    
    console.log('\n=== Installing Frontend Dependencies ===');
    runCommand('npm install', path.join(__dirname, 'frontend'), (err) => {
      if (err) {
        console.error('Failed to install frontend dependencies');
        process.exit(1);
      }
      
      console.log('\n=== All dependencies installed! ===\n');
      startServers();
    });
  });
}

function startServers() {
  console.log('=== Starting Backend Server (Port 5000) ===');
  
  const backendDir = path.join(__dirname, 'backend');
  const backendProcess = spawn('npm', ['start'], { 
    cwd: backendDir, 
    detached: true, 
    stdio: 'ignore',
    shell: true 
  });
  
  backendProcess.unref();
  
  setTimeout(() => {
    console.log('=== Starting Frontend Dev Server (Port 5173) ===');
    
    const frontendDir = path.join(__dirname, 'frontend');
    const frontendProcess = spawn('npm', ['run', 'dev'], { 
      cwd: frontendDir, 
      detached: true, 
      stdio: 'ignore',
      shell: true 
    });
    
    frontendProcess.unref();
    
    console.log('\n========================================');
    console.log('Application is running!');
    console.log('Backend: http://localhost:5000');
    console.log('Frontend: http://localhost:5173');
    console.log('========================================\n');
  }, 3000);
}

const args = process.argv.slice(2);

if (args.includes('--install-only')) {
  installDependencies();
} else {
  installDependencies();
}
