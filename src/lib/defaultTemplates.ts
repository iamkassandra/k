import type { Workflow } from '../types';

export const ENTERPRISE_TEMPLATES: Workflow[] = [
  {
    id: 'tpl_incident_triage',
    name: 'Cloud Incident Auto-Triage & Remediation',
    description: 'Autonomous incident response pipeline: ingests webhook alerts, classifies severity via Gemini AI thinking mode, branches for critical alerts, and triggers Slack/PagerDuty escalation with auto-remediation scripts.',
    tags: ['DevSecOps', 'Incident Response', 'Enterprise', 'AI Agent'],
    category: 'Infrastructure',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000,
    variables: [
      { key: 'SLACK_WEBHOOK_URL', value: 'https://hooks.slack.com/services/T00/B00/XXXXX', isSecret: true, description: 'Slack incoming webhook for SRE alerts' },
      { key: 'SEVERITY_THRESHOLD', value: 'HIGH', isSecret: false, description: 'Minimum severity for on-call page' },
      { key: 'ENVIRONMENT', value: 'production-us-east-1', isSecret: false, description: 'Target deployment cluster' }
    ],
    nodes: [
      {
        id: 'node_1',
        type: 'trigger',
        position: { x: 80, y: 220 },
        data: {
          label: 'CloudWatch / Datadog Alert',
          description: 'Webhook triggers on metric threshold breaches or 5xx spikes',
          category: 'trigger',
          type: 'trigger',
          color: '#7BCDFF',
          config: {
            method: 'POST',
            body: '{"alert_id": "ALT-9842", "service": "auth-gateway", "metric": "5xx_rate", "value": 14.8, "region": "us-east-1"}'
          },
          inputs: [],
          outputs: [{ id: 'out_payload', name: 'Alert Payload', type: 'object' }]
        }
      },
      {
        id: 'node_2',
        type: 'gemini_ai',
        position: { x: 380, y: 200 },
        data: {
          label: 'Gemini Deep Incident Reasoner',
          description: 'Uses gemini-3.1-pro-preview with HIGH thinking to analyze telemetry, determine root cause, and assign blast radius.',
          category: 'ai',
          type: 'gemini_ai',
          color: '#FFB7EF',
          config: {
            model: 'gemini-3.1-pro-preview',
            thinkingEnabled: true,
            thinkingLevel: 'HIGH',
            systemPrompt: 'You are an elite Principal Site Reliability Engineer. Analyze the incoming alert payload, correlate with recent deployments, and return structured JSON with root_cause_hypothesis, severity (LOW/MEDIUM/HIGH/CRITICAL), recommended_action, and runbook_command.',
            userPrompt: 'Analyze this incident alert: {{node_1.output}}',
            responseFormat: 'json',
            retryCount: 2,
            timeoutMs: 30000
          },
          inputs: [{ id: 'in_payload', name: 'Alert Payload', type: 'object' }],
          outputs: [{ id: 'out_analysis', name: 'Analysis JSON', type: 'object' }]
        }
      },
      {
        id: 'node_3',
        type: 'condition',
        position: { x: 700, y: 210 },
        data: {
          label: 'Severity >= HIGH ?',
          description: 'Branches based on AI severity classification',
          category: 'logic',
          type: 'condition',
          color: '#FFCC00',
          config: {
            conditionType: 'expression',
            conditionExpression: '{{node_2.output.severity}} === "HIGH" || {{node_2.output.severity}} === "CRITICAL"'
          },
          inputs: [{ id: 'in_eval', name: 'AI Result', type: 'object' }],
          outputs: [
            { id: 'true', name: 'Critical / High (True)', type: 'object' },
            { id: 'false', name: 'Low / Medium (False)', type: 'object' }
          ]
        }
      },
      {
        id: 'node_4',
        type: 'notification',
        position: { x: 1020, y: 120 },
        data: {
          label: 'PagerDuty & Slack Urgent Escalation',
          description: 'Broadcasts executive incident summary with one-click remediation button',
          category: 'integration',
          type: 'notification',
          color: '#FF4D4D',
          config: {
            channel: 'slack',
            recipient: '#sre-war-room',
            template: '🚨 *P1 INCIDENT DETECTED* \n*Service*: {{node_1.output.service}}\n*AI Analysis*: {{node_2.output.recommended_action}}\n*Hypothesis*: {{node_2.output.root_cause_hypothesis}}'
          },
          inputs: [{ id: 'in_data', name: 'Incident Data', type: 'object' }],
          outputs: [{ id: 'out_status', name: 'Delivery Status', type: 'object' }]
        }
      },
      {
        id: 'node_5',
        type: 'database',
        position: { x: 1020, y: 320 },
        data: {
          label: 'Firestore SRE Audit Log',
          description: 'Records telemetry, classification metrics, and audit timestamps',
          category: 'data',
          type: 'database',
          color: '#00E676',
          config: {
            dbOperation: 'set',
            collection: 'incident_audit_logs',
            documentId: '{{node_1.output.alert_id}}'
          },
          inputs: [{ id: 'in_record', name: 'Log Data', type: 'object' }],
          outputs: [{ id: 'out_doc', name: 'Saved Doc', type: 'object' }]
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
      { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
      { id: 'e3-4', source: 'node_3', target: 'node_4', sourceHandle: 'true', label: 'High / Critical', animated: true },
      { id: 'e3-5', source: 'node_3', target: 'node_5', sourceHandle: 'false', label: 'Standard Logging', animated: true }
    ]
  },
  {
    id: 'tpl_lead_enrichment',
    name: 'Enterprise Autonomous Lead Enrichment & Scoring',
    description: 'Ingests new signup leads, enriches domain metadata via external APIs, synthesizes intent and buying signals with Gemini 3.1 Pro, and routes high-value prospects to HubSpot with personalized outreach drafts.',
    tags: ['Sales Ops', 'CRM', 'Gemini AI', 'Enrichment'],
    category: 'Sales & Marketing',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 7200000,
    variables: [
      { key: 'HUBSPOT_API_KEY', value: 'pat-na1-xxxx-xxxx', isSecret: true, description: 'HubSpot CRM Private App Access Token' },
      { key: 'MIN_FIT_SCORE', value: '80', isSecret: false, description: 'Threshold for VIP Account Executive assignment' }
    ],
    nodes: [
      {
        id: 'node_1',
        type: 'trigger',
        position: { x: 80, y: 200 },
        data: {
          label: 'New Enterprise Signup',
          description: 'Webhook from product onboarding form',
          category: 'trigger',
          type: 'trigger',
          color: '#7BCDFF',
          config: {
            body: '{"email": "alex.vance@blackmesa-labs.io", "company": "Black Mesa Labs", "employee_count": "500-1000", "source": "organic_demo"}'
          },
          inputs: [],
          outputs: [{ id: 'out_lead', name: 'Lead Payload', type: 'object' }]
        }
      },
      {
        id: 'node_2',
        type: 'api_request',
        position: { x: 380, y: 200 },
        data: {
          label: 'Clearbit Company Enrichment API',
          description: 'Fetches company valuation, tech stack, and LinkedIn headcount',
          category: 'integration',
          type: 'api_request',
          color: '#9C27B0',
          config: {
            method: 'GET',
            url: 'https://company.clearbit.com/v2/companies/find?domain=blackmesa-labs.io',
            headers: { Authorization: 'Bearer {{CLEARBIT_KEY}}' }
          },
          inputs: [{ id: 'in_lead', name: 'Lead Data', type: 'object' }],
          outputs: [{ id: 'out_company', name: 'Company Profile', type: 'object' }]
        }
      },
      {
        id: 'node_3',
        type: 'gemini_ai',
        position: { x: 680, y: 200 },
        data: {
          label: 'Gemini Fit Scorer & Personalizer',
          description: 'Deeply evaluates Ideal Customer Profile (ICP) fit, predicts ACV, and crafts bespoke executive icebreaker.',
          category: 'ai',
          type: 'gemini_ai',
          color: '#FFB7EF',
          config: {
            model: 'gemini-3.1-pro-preview',
            thinkingEnabled: true,
            thinkingLevel: 'HIGH',
            systemPrompt: 'You are an Enterprise Revenue Operations specialist. Score ICP fit (0-100), identify top 3 pain points based on tech stack, and draft a high-converting personalized email opening line for the Account Executive.',
            responseFormat: 'json'
          },
          inputs: [{ id: 'in_data', name: 'Enriched Profile', type: 'object' }],
          outputs: [{ id: 'out_scored', name: 'Scored Intelligence', type: 'object' }]
        }
      },
      {
        id: 'node_4',
        type: 'condition',
        position: { x: 980, y: 200 },
        data: {
          label: 'ICP Score >= 80 ?',
          description: 'Route based on VIP enterprise tier',
          category: 'logic',
          type: 'condition',
          color: '#FFCC00',
          config: {
            conditionType: 'expression',
            conditionExpression: '{{node_3.output.icp_score}} >= 80'
          },
          inputs: [{ id: 'in_score', name: 'Score Data', type: 'object' }],
          outputs: [
            { id: 'true', name: 'VIP Lead (True)', type: 'object' },
            { id: 'false', name: 'Self-Serve (False)', type: 'object' }
          ]
        }
      },
      {
        id: 'node_5',
        type: 'api_request',
        position: { x: 1280, y: 120 },
        data: {
          label: 'HubSpot Enterprise Deal Creator',
          description: 'Creates CRM Deal, assigns Lead AE, attaches generated briefing note',
          category: 'integration',
          type: 'api_request',
          color: '#FF7043',
          config: {
            method: 'POST',
            url: 'https://api.hubapi.com/crm/v3/objects/deals',
            body: '{"properties": {"dealname": "{{node_1.output.company}} - Enterprise", "pipeline": "sales", "amount": 60000}}'
          },
          inputs: [{ id: 'in_lead', name: 'Deal Payload', type: 'object' }],
          outputs: [{ id: 'out_deal', name: 'Deal ID', type: 'object' }]
        }
      },
      {
        id: 'node_6',
        type: 'notification',
        position: { x: 1280, y: 300 },
        data: {
          label: 'Slack Enterprise SDR Alert',
          description: 'Alerts sales team with instant Calendly dispatch link',
          category: 'integration',
          type: 'notification',
          color: '#00E676',
          config: {
            channel: 'slack',
            recipient: '#enterprise-wins',
            template: '🎯 *VIP Lead Detected (Score: {{node_3.output.icp_score}})* \n*Company*: {{node_1.output.company}}\n*Icebreaker*: {{node_3.output.email_icebreaker}}'
          },
          inputs: [{ id: 'in_alert', name: 'Alert Data', type: 'object' }],
          outputs: [{ id: 'out_status', name: 'Status', type: 'object' }]
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
      { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
      { id: 'e3-4', source: 'node_3', target: 'node_4', animated: true },
      { id: 'e4-5', source: 'node_4', target: 'node_5', sourceHandle: 'true', label: 'VIP Route', animated: true },
      { id: 'e5-6', source: 'node_5', target: 'node_6', animated: true }
    ]
  },
  {
    id: 'tpl_kyc_compliance',
    name: 'Autonomous KYC & Financial Risk Matrix',
    description: 'Bank-grade compliance engine: verifies applicant credentials, conducts sanctions and PEP screening via Gemini high reasoning, computes risk coefficients, and routes for straight-through-processing (STP) or compliance officer review.',
    tags: ['FinTech', 'Compliance', 'Security', 'Enterprise'],
    category: 'Finance & Risk',
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 14400000,
    variables: [
      { key: 'RISK_TOLERANCE_MAX', value: '0.25', isSecret: false, description: 'Maximum allowed risk coefficient for automatic approval' },
      { key: 'OFAC_API_KEY', value: 'sec_prod_xxxx', isSecret: true, description: 'Sanctions database credential' }
    ],
    nodes: [
      {
        id: 'node_1',
        type: 'trigger',
        position: { x: 80, y: 220 },
        data: {
          label: 'Customer KYC Submission',
          description: 'Applicant passport & biometric verification event',
          category: 'trigger',
          type: 'trigger',
          color: '#7BCDFF',
          config: {
            body: '{"applicant_id": "USR-8829", "country": "NZ", "doc_type": "passport", "pep_declaration": false, "volume_monthly": 150000}'
          },
          inputs: [],
          outputs: [{ id: 'out_app', name: 'Applicant Data', type: 'object' }]
        }
      },
      {
        id: 'node_2',
        type: 'gemini_ai',
        position: { x: 400, y: 200 },
        data: {
          label: 'Gemini Sanctions & Risk Synthesizer',
          description: 'Calculates AML risk vector using high-thinking multi-step evaluation against international guidelines.',
          category: 'ai',
          type: 'gemini_ai',
          color: '#FFB7EF',
          config: {
            model: 'gemini-3.1-pro-preview',
            thinkingEnabled: true,
            thinkingLevel: 'HIGH',
            systemPrompt: 'You are a Senior Anti-Money Laundering (AML) Compliance Officer. Calculate the composite risk index (0.0 to 1.0), flag red flags, and determine whether Straight-Through-Processing is permitted.',
            responseFormat: 'json'
          },
          inputs: [{ id: 'in_data', name: 'Applicant Data', type: 'object' }],
          outputs: [{ id: 'out_risk', name: 'Risk Assessment', type: 'object' }]
        }
      },
      {
        id: 'node_3',
        type: 'condition',
        position: { x: 720, y: 210 },
        data: {
          label: 'Risk Score < 0.25 ?',
          description: 'Pass threshold check for automatic instant approval',
          category: 'logic',
          type: 'condition',
          color: '#FFCC00',
          config: {
            conditionType: 'expression',
            conditionExpression: '{{node_2.output.risk_score}} < 0.25'
          },
          inputs: [{ id: 'in_risk', name: 'Risk Data', type: 'object' }],
          outputs: [
            { id: 'true', name: 'Approved (STP)', type: 'object' },
            { id: 'false', name: 'Manual Review Required', type: 'object' }
          ]
        }
      },
      {
        id: 'node_4',
        type: 'database',
        position: { x: 1040, y: 120 },
        data: {
          label: 'Firestore User Account Activation',
          description: 'Marks account KYC_STATUS = VERIFIED and provisions wallet',
          category: 'data',
          type: 'database',
          color: '#00E676',
          config: {
            dbOperation: 'update',
            collection: 'user_accounts',
            documentId: '{{node_1.output.applicant_id}}'
          },
          inputs: [{ id: 'in_user', name: 'Status Update', type: 'object' }],
          outputs: [{ id: 'out_saved', name: 'Updated Record', type: 'object' }]
        }
      },
      {
        id: 'node_5',
        type: 'notification',
        position: { x: 1040, y: 320 },
        data: {
          label: 'Compliance Officer Review Queue',
          description: 'Dispatches task to human compliance queue with full AI reasoning trace',
          category: 'integration',
          type: 'notification',
          color: '#FF5252',
          config: {
            channel: 'email',
            recipient: 'compliance-desk@enterprise-bank.io',
            template: '⚠️ MANUAL AML REVIEW: Applicant {{node_1.output.applicant_id}} flagged with risk score {{node_2.output.risk_score}}.'
          },
          inputs: [{ id: 'in_payload', name: 'Review Payload', type: 'object' }],
          outputs: [{ id: 'out_res', name: 'Result', type: 'object' }]
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
      { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
      { id: 'e3-4', source: 'node_3', target: 'node_4', sourceHandle: 'true', label: 'Auto-Approve', animated: true },
      { id: 'e3-5', source: 'node_3', target: 'node_5', sourceHandle: 'false', label: 'Escalate', animated: true }
    ]
  },
  {
    id: 'tpl_content_engine',
    name: 'Multi-Agent Autonomous Content Engine',
    description: 'Transform raw research/whitepapers into multi-channel marketing campaigns: generates SEO article, viral LinkedIn post, 7-tweet thread, and newsletter digest in parallel.',
    tags: ['Marketing', 'Multi-Agent', 'Content', 'Creative'],
    category: 'Content & Media',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 1800000,
    variables: [
      { key: 'BRAND_TONE', value: 'Authoritative yet punchy technical vision', isSecret: false, description: 'Brand voice guidelines' }
    ],
    nodes: [
      {
        id: 'node_1',
        type: 'trigger',
        position: { x: 80, y: 220 },
        data: {
          label: 'Article / Whitepaper Source',
          description: 'Input raw research text or URL',
          category: 'trigger',
          type: 'trigger',
          color: '#7BCDFF',
          config: {
            body: '{"title": "The Shift to Agentic Workflows in 2026", "raw_notes": "Enterprises are adopting autonomous graphs over linear scripts. Latency reduced by 40% with smart caching."}'
          },
          inputs: [],
          outputs: [{ id: 'out_source', name: 'Raw Notes', type: 'object' }]
        }
      },
      {
        id: 'node_2',
        type: 'gemini_ai',
        position: { x: 380, y: 120 },
        data: {
          label: 'LinkedIn Thought-Leader Agent',
          description: 'Generates high-engagement professional LinkedIn post with hooks and hashtags',
          category: 'ai',
          type: 'gemini_ai',
          color: '#7BCDFF',
          config: {
            model: 'gemini-3.1-pro-preview',
            thinkingEnabled: true,
            thinkingLevel: 'HIGH',
            systemPrompt: 'You are a top 1% B2B LinkedIn creator. Turn the provided notes into an engaging hook-driven post with high readability and bullet points.',
            userPrompt: 'Draft LinkedIn post for: {{node_1.output}}'
          },
          inputs: [{ id: 'in_text', name: 'Notes', type: 'object' }],
          outputs: [{ id: 'out_post', name: 'LinkedIn Post', type: 'string' }]
        }
      },
      {
        id: 'node_3',
        type: 'gemini_ai',
        position: { x: 380, y: 320 },
        data: {
          label: 'Twitter / X Thread Generator',
          description: 'Synthesizes key metrics into a 5-tweet narrative thread with virality triggers',
          category: 'ai',
          type: 'gemini_ai',
          color: '#FFB7EF',
          config: {
            model: 'gemini-3.1-pro-preview',
            thinkingEnabled: true,
            thinkingLevel: 'HIGH',
            systemPrompt: 'You are a Twitter virality specialist. Craft a 5-tweet thread distilling the most compelling insights.',
            userPrompt: 'Generate Twitter thread from: {{node_1.output}}'
          },
          inputs: [{ id: 'in_text', name: 'Notes', type: 'object' }],
          outputs: [{ id: 'out_thread', name: 'Tweet Thread', type: 'array' }]
        }
      },
      {
        id: 'node_4',
        type: 'database',
        position: { x: 740, y: 220 },
        data: {
          label: 'Firestore Campaign Archive',
          description: 'Stores generated assets for schedule & editorial review',
          category: 'data',
          type: 'database',
          color: '#00E676',
          config: {
            dbOperation: 'set',
            collection: 'marketing_campaigns'
          },
          inputs: [
            { id: 'in_li', name: 'LinkedIn Content', type: 'string' },
            { id: 'in_tw', name: 'Twitter Content', type: 'array' }
          ],
          outputs: [{ id: 'out_record', name: 'Campaign Record', type: 'object' }]
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
      { id: 'e1-3', source: 'node_1', target: 'node_3', animated: true },
      { id: 'e2-4', source: 'node_2', target: 'node_4', animated: true },
      { id: 'e3-4', source: 'node_3', target: 'node_4', animated: true }
    ]
  }
];
