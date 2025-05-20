import { resolve } from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

// Function to find all subdirectories in src that have an index.html file
function findHtmlEntries() {
  const srcDir = path.resolve(__dirname, 'src');
  const entries = {
    main: resolve(__dirname, 'index.html'), // Always include the main index.html
  };
  
  // Check if src directory exists
  if (!fs.existsSync(srcDir)) {
    return entries;
  }
  
  // Get all subdirectories in src
  const subdirs = fs.readdirSync(srcDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  // Add entries for each subdirectory that has an index.html file
  for (const dir of subdirs) {
    const indexPath = path.join(srcDir, dir, 'index.html');
    if (fs.existsSync(indexPath)) {
      // Convert directory name to camelCase for the entry key
      const entryKey = dir.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      entries[entryKey] = resolve(srcDir, dir, 'index.html');
      
      // Also add a proxy for this directory
      console.log(`Found HTML entry: ${dir}`);
    }
  }
  
  return entries;
}

export default defineConfig({
  server: {
    proxy: (() => {
      const proxies = {};
      // Get all subdirectories in src
      const srcDir = path.resolve(__dirname, 'src');
      if (fs.existsSync(srcDir)) {
        const subdirs = fs.readdirSync(srcDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);
        
        // Add proxy for each subdirectory
        for (const dir of subdirs) {
          const indexPath = path.join(srcDir, dir, 'index.html');
          if (fs.existsSync(indexPath)) {
            // Handle paths with trailing slash
            proxies[`/${dir}/`] = {
              target: 'http://localhost:5173',
              rewrite: (path) => path.replace(new RegExp(`^\\/${dir}/`), `/src/${dir}/`)
            };
            
            // Handle paths without trailing slash (redirect to the version with slash)
            proxies[`/${dir}`] = {
              target: 'http://localhost:5173',
              rewrite: (path) => {
                // If it's an exact match without any additional path segments, redirect to add the trailing slash
                if (path === `/${dir}`) {
                  return `/src/${dir}/`;
                }
                // Otherwise handle normally
                return path.replace(new RegExp(`^\\/${dir}`), `/src/${dir}`);
              }
            };
          }
        }
      }
      return proxies;
    })()
  },
  
  build: {
    rollupOptions: {
      input: findHtmlEntries(),
    },
  },
});
