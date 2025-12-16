#!/usr/bin/env node

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as readline from 'readline';

// Configuration
const APP_NAME = 'Fabrique';
const LOG_DIR = path.join(process.cwd(), 'logs');
const PID_FILE = path.join(process.cwd(), '.pid');
const MONITOR_PID_FILE = path.join(process.cwd(), '.monitor.pid');

// Ensure log directory exists
fs.ensureDirSync(LOG_DIR);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper functions
const log = (message: string) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

const error = (message: string) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${message}`);
};

const runCommand = (command: string, args: string[], options: any = {}) => {
  return new Promise<number>((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
};

const startApp = async () => {
  log(`Starting ${APP_NAME} application...`);
  
  try {
    // Start the main application
    const appProcess = spawn('npm', ['run', 'start:prod'], {
      stdio: 'pipe',
      shell: true,
      detached: true
    });

    // Save PID to file
    fs.writeFileSync(PID_FILE, appProcess.pid!.toString());
    log(`Application started with PID: ${appProcess.pid}`);

    // Log output to file
    const logStream = fs.createWriteStream(
      path.join(LOG_DIR, `app-${new Date().toISOString().replace(/[:.]/g, '-')}.log`),
      { flags: 'a' }
    );

    appProcess.stdout?.on('data', (data) => {
      logStream.write(`[STDOUT] ${data}`);
    });

    appProcess.stderr?.on('data', (data) => {
      logStream.write(`[STDERR] ${data}`);
    });

    // Start monitoring in development mode
    if (process.env.NODE_ENV !== 'production') {
      startMonitoring();
    }

    return appProcess;
  } catch (err) {
    error(`Failed to start application: ${err}`);
    throw err;
  }
};

const startMonitoring = async () => {
  log('Starting monitoring service...');
  
  try {
    const monitorProcess = spawn('npm', ['run', 'monitor'], {
      stdio: 'pipe',
      shell: true,
      detached: true
    });

    // Save monitor PID to file
    fs.writeFileSync(MONITOR_PID_FILE, monitorProcess.pid!.toString());
    log(`Monitoring service started with PID: ${monitorProcess.pid}`);

    // Log monitor output to file
    const monitorLogStream = fs.createWriteStream(
      path.join(LOG_DIR, `monitor-${new Date().toISOString().replace(/[:.]/g, '-')}.log`),
      { flags: 'a' }
    );

    monitorProcess.stdout?.on('data', (data) => {
      monitorLogStream.write(`[MONITOR] ${data}`);
    });

    monitorProcess.stderr?.on('data', (data) => {
      monitorLogStream.write(`[MONITOR-ERROR] ${data}`);
    });

    return monitorProcess;
  } catch (err) {
    error(`Failed to start monitoring service: ${err}`);
    throw err;
  }
};

const stopProcess = async (pidFile: string, processName: string) => {
  if (fs.existsSync(pidFile)) {
    const pid = parseInt(fs.readFileSync(pidFile, 'utf-8').trim(), 10);
    
    if (pid) {
      try {
        process.kill(pid);
        log(`Stopped ${processName} (PID: ${pid})`);
      } catch (err) {
        if ((err as any).code === 'ESRCH') {
          log(`${processName} with PID ${pid} not found`);
        } else {
          error(`Failed to stop ${processName}: ${err}`);
          throw err;
        }
      }
      
      fs.unlinkSync(pidFile);
    } else {
      log(`No valid PID found in ${pidFile}`);
    }
  } else {
    log(`No ${processName} process is currently running`);
  }
};

const stopApp = async () => {
  log(`Stopping ${APP_NAME} application...`);
  await stopProcess(PID_FILE, 'application');
  
  // Also stop monitoring when stopping the app
  if (fs.existsSync(MONITOR_PID_FILE)) {
    await stopProcess(MONITOR_PID_FILE, 'monitoring service');
  }
};

const restartApp = async () => {
  await stopApp();
  await startApp();
};

const showStatus = () => {
  log(`=== ${APP_NAME} Status ===`);
  
  // Check main application status
  if (fs.existsSync(PID_FILE)) {
    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim(), 10);
    log(`Application: RUNNING (PID: ${pid})`);
  } else {
    log('Application: NOT RUNNING');
  }
  
  // Check monitoring service status
  if (fs.existsSync(MONITOR_PID_FILE)) {
    const monitorPid = parseInt(fs.readFileSync(MONITOR_PID_FILE, 'utf-8').trim(), 10);
    log(`Monitoring: RUNNING (PID: ${monitorPid})`);
  } else {
    log('Monitoring: NOT RUNNING');
  }
  
  // Show recent logs
  log('\nRecent logs:');
  try {
    const logFiles = fs.readdirSync(LOG_DIR)
      .filter(file => file.endsWith('.log'))
      .sort()
      .reverse()
      .slice(0, 3);
      
    logFiles.forEach(file => {
      log(`- ${file}`);
    });
  } catch (err) {
    error(`Failed to read log directory: ${err}`);
  }
};

const showHelp = () => {
  console.log(`
${APP_NAME} Management Script

Usage:
  node scripts/manage.js <command>

Commands:
  start     Start the application
  stop      Stop the application
  restart   Restart the application
  status    Show application status
  monitor   Start monitoring service
  help      Show this help message
`);
};

// Main function
const main = async () => {
  const command = process.argv[2] || 'help';
  
  try {
    switch (command.toLowerCase()) {
      case 'start':
        await startApp();
        break;
        
      case 'stop':
        await stopApp();
        break;
        
      case 'restart':
        await restartApp();
        break;
        
      case 'status':
        showStatus();
        break;
        
      case 'monitor':
        await startMonitoring();
        break;
        
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (err) {
    error(`Error: ${err}`);
    process.exit(1);
  } finally {
    rl.close();
  }
};

// Run the main function
main();
