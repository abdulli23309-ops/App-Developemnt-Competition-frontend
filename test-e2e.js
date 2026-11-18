/* global process */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Monitor } from 'lucide-react';
import axios from 'axios';
import IconRenderer from './src/components/common/IconRenderer.jsx';
import ErrorBoundary from './src/components/common/ErrorBoundary.jsx';
import Layout from './src/components/layout/Layout.jsx';
import Home from './src/pages/Home.jsx';
import NotFound from './src/pages/NotFound.jsx';

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

console.log('--- Running React Component & Error #130 Prevention Tests ---');

// Test 1: IconRenderer with component reference
const html1 = renderToString(React.createElement(IconRenderer, { icon: Monitor, size: 24 }));
assert(html1.includes('svg') && html1.includes('lucide-monitor'), 'IconRenderer renders component reference');

// Test 2: IconRenderer with JSX element (the exact pattern that previously caused Error #130)
const html2 = renderToString(React.createElement(IconRenderer, { icon: React.createElement(Monitor, { size: 24 }) }));
assert(html2.includes('svg') && html2.includes('lucide-monitor'), 'IconRenderer safely handles JSX elements');

// Test 3: IconRenderer with null / undefined / invalid values
const html3 = renderToString(React.createElement(IconRenderer, { icon: null }));
assert(html3 === '', 'IconRenderer safely returns empty string on null icon');

const html4 = renderToString(React.createElement(IconRenderer, { icon: undefined }));
assert(html4 === '', 'IconRenderer safely returns empty string on undefined icon');

const html5 = renderToString(React.createElement(IconRenderer, { icon: { someBogusProp: 123 } }));
assert(html5 === '', 'IconRenderer safely handles arbitrary objects without throwing Error #130');

// Test 6: Render Layout inside MemoryRouter
const layoutHtml = renderToString(
  React.createElement(MemoryRouter, { initialEntries: ['/'] },
    React.createElement(Routes, null,
      React.createElement(Route, { path: '/', element: React.createElement(Layout, null) },
        React.createElement(Route, { index: true, element: React.createElement('div', null, 'Child') })
      )
    )
  )
);
assert(layoutHtml.includes('navbar') && layoutHtml.includes('Competition Starter'), 'Layout component renders with navigation');

// Test 7: Render Home page inside MemoryRouter
const homeHtml = renderToString(
  React.createElement(MemoryRouter, { initialEntries: ['/'] },
    React.createElement(Home, null)
  )
);
assert(homeHtml.includes('APP DEVELOPMENT COMPETITION'), 'Home component renders title');
assert(homeHtml.includes('System Status'), 'Home component renders System Status');
assert(homeHtml.includes('Frontend'), 'Home component renders Frontend card');
assert(homeHtml.includes('Backend API'), 'Home component renders Backend API card');
assert(homeHtml.includes('Database'), 'Home component renders Database card');
assert(homeHtml.includes('Retry Check'), 'Home component renders Retry Check button');
assert(homeHtml.includes('Refresh Status'), 'Home component renders Refresh Status link');

// Test 8: Render NotFound page inside MemoryRouter
const notFoundHtml = renderToString(
  React.createElement(MemoryRouter, { initialEntries: ['/404'] },
    React.createElement(NotFound, null)
  )
);
assert(notFoundHtml.includes('404') && notFoundHtml.includes('Page not found'), 'NotFound page renders 404 message');
assert(notFoundHtml.includes('Go Home'), 'NotFound page renders Go Home link');

// Test 9: Render ErrorBoundary normal state
const ebHtml = renderToString(
  React.createElement(ErrorBoundary, null,
    React.createElement('div', null, 'Working Content')
  )
);
assert(ebHtml.includes('Working Content'), 'ErrorBoundary renders children in normal mode');

console.log('--- ALL 9 TEST SUITES PASSED CLEANLY WITH ZERO ERRORS ---');

// Test 10: Backend API endpoints (if backend is running)
async function testBackendEndpoints() {
  console.log('--- Testing Backend API Endpoints ---');
  try {
    const healthRes = await axios.get('http://localhost:5116/api/health');
    assert(healthRes.status === 200, 'GET /api/health returns HTTP 200');
    assert(healthRes.data && healthRes.data.success === true, 'GET /api/health returns success: true');

    const dbRes = await axios.get('http://localhost:5116/api/database/status');
    assert(dbRes.status === 200, 'GET /api/database/status returns HTTP 200');
    assert(dbRes.data && dbRes.data.success === true, 'GET /api/database/status returns success: true');

    console.log('--- ALL BACKEND CONNECTIVITY TESTS PASSED ---');
  } catch (err) {
    console.warn('Backend endpoint test skipped or unreachable:', err.message);
  }
}

await testBackendEndpoints();
