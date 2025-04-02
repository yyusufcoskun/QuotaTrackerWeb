// Custom build script to work around path resolution issues
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Find react-scripts in node_modules
const nodeModulesPath = path.join(__dirname, 'node_modules');
const reactScriptsPath = path.join(nodeModulesPath, '.bin', 'react-scripts');

console.log('Looking for react-scripts at:', reactScriptsPath);

// Check if the file exists
if (fs.existsSync(reactScriptsPath)) {
  console.log('Found react-scripts, attempting to build...');
  
  try {
    // Use execSync for simpler execution with quoted paths to handle spaces
    execSync('node "' + path.join(nodeModulesPath, 'react-scripts', 'scripts', 'build.js') + '"', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } catch (error) {
    console.error('Error running react-scripts build:', error.message);
    process.exit(1);
  }
} else {
  console.error('Could not find react-scripts. Make sure it is installed correctly.');
  console.log('Trying direct import as a fallback...');
  
  try {
    // Alternative: Try importing and running build script directly
    require(path.join(nodeModulesPath, 'react-scripts', 'scripts', 'build.js'));
  } catch (error) {
    console.error('Failed with direct import too:', error.message);
    process.exit(1);
  }
} 