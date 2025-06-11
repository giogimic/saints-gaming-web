import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_SITE_NAME',
  'NEXT_PUBLIC_SITE_DESCRIPTION'
];

const requiredShadcnComponents = [
  'button',
  'input',
  'card',
  'tabs',
  'avatar',
  'dropdown-menu',
  'toast',
  'alert-dialog',
  'select',
  'hover-card',
  'command',
  'tooltip',
  'scroll-area',
  'separator',
  'slider',
  'switch'
];

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...');
  
  // Check Bun version
  try {
    const bunVersion = execSync('bun --version').toString().trim();
    console.log(`✅ Bun version: ${bunVersion}`);
  } catch (error) {
    throw new Error('Bun is not installed. Please install Bun first: https://bun.sh');
  }

  // Check Node.js version (for compatibility)
  const nodeVersion = execSync('node --version').toString().trim();
  const nodeVersionNum = parseInt(nodeVersion.replace('v', '').split('.')[0]);
  if (nodeVersionNum < 18) {
    throw new Error(`Node.js version must be 18 or higher. Current version: ${nodeVersion}`);
  }

  console.log('✅ Prerequisites check passed');
}

function setupEnvironment() {
  console.log('🔧 Setting up environment...');
  
  if (!existsSync('.env')) {
    const envContent = `# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${Math.random().toString(36).substring(2)}"

# Site Settings
NEXT_PUBLIC_SITE_NAME="Saints Gaming"
NEXT_PUBLIC_SITE_DESCRIPTION="Your Premier Modded Gaming Community"
`;
    writeFileSync('.env', envContent);
    console.log('✅ Created .env file');
  } else {
    console.log('ℹ️ .env file already exists');
  }

  // Ensure bunfig.toml exists
  if (!existsSync('bunfig.toml')) {
    const bunfigContent = `[install]
# Use exact versions for all dependencies
exact = true

[install.cache]
# Enable the global module cache
dir = ".bun/cache"

[install.scopes]
# Configure scoped package registries
"@saintsgaming" = "https://registry.npmjs.org/"

[test]
# Configure test environment
coverage = true
`;
    writeFileSync('bunfig.toml', bunfigContent);
    console.log('✅ Created bunfig.toml');
  }
}

async function installDependencies() {
  console.log('📦 Installing dependencies...');
  
  try {
    // Clean install with Bun
    execSync('bun install --frozen-lockfile', { stdio: 'inherit' });
    
    // Install shadcn/ui components using Bun
    for (const component of requiredShadcnComponents) {
      console.log(`Installing shadcn/ui component: ${component}`);
      execSync(`bunx shadcn-ui@latest add ${component}`, { stdio: 'inherit' });
    }
    
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Error installing dependencies:', error);
    throw error;
  }
}

function setupDatabase() {
  console.log('🗄️ Setting up database...');
  
  try {
    // Generate Prisma client using Bun
    execSync('bun run prisma generate', { stdio: 'inherit' });
    
    // Run migrations using Bun
    execSync('bun run prisma migrate dev', { stdio: 'inherit' });
    
    // Seed the database using Bun
    execSync('bun run prisma db seed', { stdio: 'inherit' });
    
    console.log('✅ Database setup completed');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  }
}

function optimizeBun() {
  console.log('⚡ Optimizing Bun configuration...');
  
  try {
    // Create .bun-version file if it doesn't exist
    if (!existsSync('.bun-version')) {
      const bunVersion = execSync('bun --version').toString().trim();
      writeFileSync('.bun-version', bunVersion);
      console.log('✅ Created .bun-version file');
    }

    // Update next.config.js for Bun optimization
    const nextConfigPath = 'next.config.js';
    if (existsSync(nextConfigPath)) {
      const nextConfig = require('../next.config.js');
      const updatedConfig = {
        ...nextConfig,
        experimental: {
          ...nextConfig.experimental,
          optimizeCss: true,
          optimizePackageImports: ['@radix-ui/react-*', 'lucide-react'],
        },
      };
      writeFileSync(
        nextConfigPath,
        `module.exports = ${JSON.stringify(updatedConfig, null, 2)}`
      );
      console.log('✅ Updated next.config.js for Bun optimization');
    }
  } catch (error) {
    console.error('❌ Error optimizing Bun configuration:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting setup process with Bun...');
    
    checkPrerequisites();
    setupEnvironment();
    await installDependencies();
    setupDatabase();
    optimizeBun();
    
    console.log('✨ Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Review and update the .env file with your configuration');
    console.log('2. Run "bun dev" to start the development server');
    console.log('3. Run "bun run create-admin" to create an admin user');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

main(); 