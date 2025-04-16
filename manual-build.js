const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Generate a random build ID
const buildId = crypto.randomBytes(8).toString('hex');

console.log('Creating minimal Next.js build structure...');

// Create .next directory if it doesn't exist
if (!fs.existsSync('.next')) {
  fs.mkdirSync('.next');
}

// Create required directories
const directories = [
  '.next/server',
  '.next/static',
  '.next/static/chunks',
  '.next/static/css',
  '.next/static/media',
  '.next/static/development',
  '.next/cache'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Write BUILD_ID file
fs.writeFileSync('.next/BUILD_ID', buildId);

// Create a minimal required-server-files.json
const requiredServerFiles = {
  version: 1,
  config: {
    env: {},
    webpack: null,
    webpackDevMiddleware: null,
    configOrigin: "next.config.js",
    target: "server",
    reactProductionProfiling: false,
    concurrentFeatures: false,
    optimizeFonts: true,
    headers: [],
    rewrites: { beforeFiles: [], afterFiles: [], fallback: [] },
    redirects: [],
    trailingSlash: false,
    i18n: null,
    productionBrowserSourceMaps: false,
    swcMinify: true,
    reactStrictMode: true
  },
  appDir: path.resolve(__dirname),
  files: [
    'next.config.js',
    'package.json'
  ],
  ignore: ['node_modules']
};

// Write server files
fs.writeFileSync('.next/required-server-files.json', JSON.stringify(requiredServerFiles, null, 2));

// Create a minimal prerender-manifest.json
const prerenderManifest = {
  version: 4,
  routes: {},
  dynamicRoutes: {},
  notFoundRoutes: [],
  preview: {
    previewModeId: crypto.randomBytes(16).toString('hex'),
    previewModeSigningKey: crypto.randomBytes(32).toString('hex'),
    previewModeEncryptionKey: crypto.randomBytes(32).toString('hex')
  }
};

fs.writeFileSync('.next/prerender-manifest.json', JSON.stringify(prerenderManifest, null, 2));

// Create minimal middleware-manifest.json
const middlewareManifest = {
  version: 2,
  sortedMiddleware: [],
  middleware: {},
  functions: {},
  instrumentation: {
    files: []
  }
};

fs.writeFileSync('.next/middleware-manifest.json', JSON.stringify(middlewareManifest, null, 2));

// Create a minimal server directory structure
fs.writeFileSync('.next/server/pages-manifest.json', '{}');
fs.writeFileSync('.next/server/middleware-build-manifest.js', 'self.__BUILD_MANIFEST={}');
fs.writeFileSync('.next/server/middleware-react-loadable-manifest.js', 'self.__REACT_LOADABLE_MANIFEST={}');

// Create the missing routes-manifest.json
const routesManifest = {
  version: 3,
  pages404: true,
  basePath: "",
  redirects: [],
  headers: [],
  dynamicRoutes: [
    {
      page: "/api/bills/[id]",
      regex: "^/api/bills/([^/]+?)(?:/)?$",
      routeKeys: {
        "id": "id"
      },
      namedRegex: "^/api/bills/(?<id>[^/]+?)(?:/)?$"
    }
  ],
  staticRoutes: [
    {
      page: "/",
      regex: "^/(?:/)?$",
      routeKeys: {},
      namedRegex: "^/(?:/)?$"
    },
    {
      page: "/api/bills",
      regex: "^/api/bills(?:/)?$",
      routeKeys: {},
      namedRegex: "^/api/bills(?:/)?$"
    },
    {
      page: "/api/chat",
      regex: "^/api/chat(?:/)?$",
      routeKeys: {},
      namedRegex: "^/api/chat(?:/)?$"
    },
    {
      page: "/api/chat/history",
      regex: "^/api/chat/history(?:/)?$",
      routeKeys: {},
      namedRegex: "^/api/chat/history(?:/)?$"
    },
    {
      page: "/api/chat/save",
      regex: "^/api/chat/save(?:/)?$",
      routeKeys: {},
      namedRegex: "^/api/chat/save(?:/)?$"
    },
    {
      page: "/api/chat/stream",
      regex: "^/api/chat/stream(?:/)?$",
      routeKeys: {},
      namedRegex: "^/api/chat/stream(?:/)?$"
    }
  ],
  dataRoutes: [],
  rsc: {
    header: "RSC",
    varyHeader: "RSC, Next-Router-State-Tree, Next-Router-Prefetch"
  }
};

fs.writeFileSync('.next/routes-manifest.json', JSON.stringify(routesManifest, null, 2));

console.log('Minimal build structure created with routes-manifest.json. Run "next start" to start the server.'); 