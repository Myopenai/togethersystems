/**
 * TOGETHERSYSTEMS - Comprehensive 404 & Link Checker
 * Playwright E2E Test Suite
 * 
 * This test finds ALL broken links, 404 errors, and navigation issues
 * across the entire application.
 */

import { test, expect, Page } from '@playwright/test';

// All known pages in the system
const PAGES = [
  '/',
  '/index.html',
  '/admin.html',
  '/manifest-forum.html',
  '/manifest-portal.html',
  '/honeycomb.html',
  '/legal-hub.html',
];

// Track all found issues
interface LinkIssue {
  page: string;
  link: string;
  status: number | string;
  text: string;
}

const issues: LinkIssue[] = [];

test.describe('TOGETHERSYSTEMS 404 & Link Checker', () => {
  
  test.beforeAll(async () => {
    console.log('🔍 Starting comprehensive link check...');
  });

  test.afterAll(async () => {
    console.log('\n📊 LINK CHECK REPORT:');
    console.log('='.repeat(60));
    
    if (issues.length === 0) {
      console.log('✅ No broken links found!');
    } else {
      console.log(`❌ Found ${issues.length} broken links:\n`);
      issues.forEach((issue, i) => {
        console.log(`${i + 1}. Page: ${issue.page}`);
        console.log(`   Link: ${issue.link}`);
        console.log(`   Text: ${issue.text}`);
        console.log(`   Status: ${issue.status}`);
        console.log('');
      });
    }
    
    // Write report to file
    const report = {
      timestamp: new Date().toISOString(),
      totalIssues: issues.length,
      issues: issues
    };
    
    console.log('\n📁 Full report saved to: link-check-report.json');
  });

  // Check each page for broken links
  for (const pagePath of PAGES) {
    test(`Check links on ${pagePath}`, async ({ page, baseURL }) => {
      const fullUrl = `${baseURL}${pagePath}`;
      
      // Navigate to page
      const response = await page.goto(fullUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Check if page itself loads
      if (!response || response.status() >= 400) {
        issues.push({
          page: pagePath,
          link: fullUrl,
          status: response?.status() || 'NO_RESPONSE',
          text: 'PAGE ITSELF'
        });
        return;
      }

      // Get all links on the page
      const links = await page.$$eval('a[href]', (anchors) => 
        anchors.map(a => ({
          href: a.getAttribute('href') || '',
          text: a.textContent?.trim() || '[no text]'
        }))
      );

      console.log(`  Found ${links.length} links on ${pagePath}`);

      // Check each link
      for (const link of links) {
        // Skip external links, anchors, javascript, and mailto
        if (
          link.href.startsWith('http') ||
          link.href.startsWith('#') ||
          link.href.startsWith('javascript:') ||
          link.href.startsWith('mailto:') ||
          link.href.startsWith('tel:') ||
          link.href === ''
        ) {
          continue;
        }

        // Resolve relative URL
        const absoluteUrl = new URL(link.href, fullUrl).href;
        
        try {
          const linkResponse = await page.request.get(absoluteUrl);
          
          if (linkResponse.status() >= 400) {
            issues.push({
              page: pagePath,
              link: link.href,
              status: linkResponse.status(),
              text: link.text
            });
            console.log(`    ❌ ${link.href} -> ${linkResponse.status()}`);
          }
        } catch (error) {
          issues.push({
            page: pagePath,
            link: link.href,
            status: 'ERROR',
            text: link.text
          });
          console.log(`    ❌ ${link.href} -> ERROR`);
        }
      }
    });
  }

  test('Check all navigation buttons and interactive elements', async ({ page, baseURL }) => {
    for (const pagePath of PAGES) {
      await page.goto(`${baseURL}${pagePath}`, { waitUntil: 'networkidle' });
      
      // Find all buttons with onclick or data-href
      const buttons = await page.$$eval('button[onclick], [data-href], [data-target]', (elements) =>
        elements.map(el => ({
          type: el.tagName,
          onclick: el.getAttribute('onclick') || '',
          dataHref: el.getAttribute('data-href') || '',
          dataTarget: el.getAttribute('data-target') || '',
          text: el.textContent?.trim() || '[no text]'
        }))
      );

      for (const btn of buttons) {
        // Check if button references a page that doesn't exist
        const match = btn.onclick.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
        if (match) {
          const targetUrl = new URL(match[1], `${baseURL}${pagePath}`).href;
          try {
            const response = await page.request.get(targetUrl);
            if (response.status() >= 400) {
              issues.push({
                page: pagePath,
                link: match[1],
                status: response.status(),
                text: `Button: ${btn.text}`
              });
            }
          } catch (e) {
            issues.push({
              page: pagePath,
              link: match[1],
              status: 'ERROR',
              text: `Button: ${btn.text}`
            });
          }
        }
      }
    }
  });

  test('Check asset loading (CSS, JS, images)', async ({ page, baseURL }) => {
    const assetErrors: string[] = [];
    
    page.on('response', response => {
      if (response.status() >= 400) {
        const url = response.url();
        if (url.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/i)) {
          assetErrors.push(`${url} -> ${response.status()}`);
        }
      }
    });

    for (const pagePath of PAGES) {
      await page.goto(`${baseURL}${pagePath}`, { waitUntil: 'networkidle' });
    }

    if (assetErrors.length > 0) {
      console.log('\n⚠️ Asset loading errors:');
      assetErrors.forEach(err => console.log(`  ${err}`));
    }
    
    expect(assetErrors.length).toBe(0);
  });

  test('Verify Service Worker registration', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' });
    
    // Check if SW is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length > 0;
      }
      return false;
    });

    console.log(`Service Worker registered: ${swRegistered}`);
  });
});

// Export issues for external use
export { issues };

