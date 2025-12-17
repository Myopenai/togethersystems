// src/js/cards.js
import { graph } from './graph.js';

let seq = 0;
const newId = (prefix) => `${prefix}-${++seq}`;

export const CardTypes = {
  CONTENT_PAGE: 'content.page',
  TEMPLATE_USER_GUIDE: 'template.user_guide',
  GOVERNANCE_APPROVAL: 'governance.approval_flow',
  GOVERNANCE_ROLE: 'governance.role',
  COMPLIANCE_WCAG: 'compliance.wcag',
  COMPLIANCE_GDPR: 'compliance.gdpr',
  COMPLIANCE_ISO: 'compliance.iso',
  SEO_META: 'seo.meta',
  DEPLOY_PREVIEW: 'deployment.preview',
  DEPLOY_PUBLISH: 'deployment.publish',
  THEME_TOKENS: 'theme.tokens',
  OBS_HEALTH: 'obs.health'
};

export function createCard(type, props = {}, tags = []) {
  const id = newId(type.split('.').join('-'));
  const card = {
    id, type, props, tags,
    ports: defaultPorts(type),
    ariaLabel: `${type} card` 
  };
  graph.add(card);
  graph.moveToLane(id, 'draft');
  return card;
}

function defaultPorts(type) {
  switch (type) {
    case CardTypes.CONTENT_PAGE:
      return { input: ['template', 'seo', 'wcag'], output: ['render', 'publish'] };
    case CardTypes.TEMPLATE_USER_GUIDE:
      return { output: ['structure', 'components'] };
    case CardTypes.GOVERNANCE_APPROVAL:
      return { control: ['review', 'approve'], evidence: ['audit'] };
    case CardTypes.GOVERNANCE_ROLE:
      return { role: ['author', 'reviewer', 'owner'] };
    case CardTypes.COMPLIANCE_WCAG:
      return { check: ['contrast', 'landmarks', 'focus'], fix: ['suggest'] };
    case CardTypes.COMPLIANCE_GDPR:
      return { check: ['consent', 'minimization', 'retention'], evidence: ['dsr'] };
    case CardTypes.COMPLIANCE_ISO:
      return { check: ['logging', 'access', 'change'], evidence: ['controls'] };
    case CardTypes.SEO_META:
      return { meta: ['title', 'desc', 'schema'], output: ['index'] };
    case CardTypes.DEPLOY_PREVIEW:
      return { env: ['branch'], output: ['url'] };
    case CardTypes.DEPLOY_PUBLISH:
      return { env: ['prod'], output: ['web', 'pdf', 'helpcenter'] };
    case CardTypes.THEME_TOKENS:
      return { style: ['colors', 'fonts', 'spacing'] };
    case CardTypes.OBS_HEALTH:
      return { metrics: ['uptime', 'latency'], alert: ['route'] };
    default:
      return { input: [], output: [] };
  }
}

// Convenience factories
export const Cards = {
  page(props = {}) { return createCard(CardTypes.CONTENT_PAGE, props, ['content']); },
  userGuide(props = {}) { return createCard(CardTypes.TEMPLATE_USER_GUIDE, props, ['template']); },
  approvalFlow(props = {}) { return createCard(CardTypes.GOVERNANCE_APPROVAL, props, ['governance']); },
  role(token, props = {}) { return createCard(CardTypes.GOVERNANCE_ROLE, { token, ...props }, ['governance']); },
  wcagGuard(props = {}) { return createCard(CardTypes.COMPLIANCE_WCAG, props, ['compliance']); },
  gdprGuard(props = {}) { return createCard(CardTypes.COMPLIANCE_GDPR, props, ['compliance']); },
  isoGuard(props = {}) { return createCard(CardTypes.COMPLIANCE_ISO, props, ['compliance']); },
  seoMeta(props = {}) { return createCard(CardTypes.SEO_META, props, ['seo']); },
  preview(props = {}) { return createCard(CardTypes.DEPLOY_PREVIEW, props, ['deploy']); },
  publish(props = {}) { return createCard(CardTypes.DEPLOY_PUBLISH, props, ['deploy']); },
  theme(props = {}) { return createCard(CardTypes.THEME_TOKENS, props, ['theme']); },
  health(props = {}) { return createCard(CardTypes.OBS_HEALTH, props, ['obs']); }
};
