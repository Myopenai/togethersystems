// src/js/render.js
import { graph } from './graph.js';

export function renderProperties(card, panelEl) {
  if (!panelEl) return;
  
  panelEl.innerHTML = `
    <div class="prop"><strong>ID:</strong> ${escapeHtml(card.id)}</div>
    <div class="prop"><strong>Type:</strong> ${escapeHtml(card.type)}</div>
    <div class="prop"><strong>Lane:</strong> ${escapeHtml((graph.state.get(card.id)||{}).lane || 'draft')}</div>
    <div class="prop"><strong>Status:</strong> ${escapeHtml((graph.state.get(card.id)||{}).status || 'active')}</div>
    <div class="prop"><strong>Tags:</strong> ${escapeHtml((card.tags||[]).join(', '))}</div>
    <div class="prop"><strong>Props:</strong> <pre>${escapeHtml(JSON.stringify(card.props, null, 2))}</pre></div>
  `;
}

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Two-pass rendering example for content page
export function renderPageHTML(pageId) {
  const page = graph.nodes.get(pageId);
  if (!page || page.type !== 'content.page') return '';

  // Pass 1: structure & semantics
  const h = `<article role="article" aria-labelledby="${pageId}-title">
    <h1 id="${pageId}-title">${escapeHtml(page.props.title || 'Untitled')}</h1>
    <nav aria-label="Table of contents"></nav>
    <section role="region" aria-label="Content body"></section>
  </article>`;

  // Pass 2: behavior & overlays
  const neighbors = graph.neighbors(pageId);
  const seo = neighbors.find(n => n.type.startsWith('seo'));
  const wcag = neighbors.find(n => n.type.startsWith('compliance.wcag'));

  let head = '';
  if (seo) {
    head += `<meta name="description" content="${escapeHtml(seo.props.description || '')}">`;
    head += `<script type="application/ld+json">${JSON.stringify(schemaForPage(page, seo))}</script>`;
  }

  const accessibilityBadge = wcag ? 
    `<div class="badge badge-wcag">WCAG ${escapeHtml(wcag.props.level || 'AA')}</div>` : '';

  return `${head}${h}${accessibilityBadge}`;
}

function schemaForPage(page, seo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': page.props.title || 'Untitled',
    'description': seo?.props?.description || '',
    'inLanguage': 'en',
    'isAccessibleForFree': true
  };
}
