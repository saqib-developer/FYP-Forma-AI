import { db } from "@/config/db";
import { genAI } from "@/config/google";
import { SchemaType } from "@google/generative-ai";
import { ProjectsTable, ScreenConfigTable } from "@/config/schema";
import { CODE_GENERATION_PROMPT, UI_GENERATION_PROMPT } from "@/data/prompt";
import { ProjectType, ScreenConfigType } from "@/types/types";
import { and, eq } from "drizzle-orm";

export interface GeneratedScreenOutline {
  id: string;
  name: string;
  purpose: string;
  layoutDescription: string;
}

export interface GeneratedConfig {
  projectName: string;
  deviceType: string;
  theme: string;
  projectVisualDescription: string;
  screens: GeneratedScreenOutline[];
}

export async function generateConfig(
  projectId: string,
  userInput: string,
  device: string
): Promise<GeneratedConfig> {
  const genModel = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite",
    systemInstruction: UI_GENERATION_PROMPT,
  });

  const aiResult = await genModel.generateContent(
    `Device Type: ${device}\nUser Request: ${userInput}`
  );
  let rawContent = aiResult.response.text();
  rawContent = rawContent.replace(/```json|```/g, "").trim();

  const jsonResult = JSON.parse(rawContent) as GeneratedConfig;
  console.log("AI Config JSON Result:", jsonResult);

  if (jsonResult) {
    const pName = jsonResult.projectName || jsonResult.theme; // Fallback
    const pVisual = jsonResult.projectVisualDescription;
    const pTheme = jsonResult.theme;

    await db.update(ProjectsTable).set({
      projectVisualDescription: pVisual,
      projectName: pName,
      theme: pTheme,
    }).where(eq(ProjectsTable.projectId, projectId));

    // Clear existing screen configs
    await db.delete(ScreenConfigTable).where(eq(ScreenConfigTable.projectId, projectId));

        const screenConfigs = (jsonResult.screens || []).map((screen, index) =>
      db.insert(ScreenConfigTable).values({
        projectId,
        screenName: screen.name,
        purpose: screen.purpose,
        screenDescription: screen.layoutDescription,
        screenId: `${screen.id}-${index}`,
      })
    );

    await Promise.all(screenConfigs);
    return jsonResult;
  } else {
    throw new Error("InvalidConfigResult");
  }
}

export async function generateFromImage(
  projectId: string,
  userInput: string,
  device: string,
  imageBase64: string,
  theme: string
): Promise<GeneratedConfig> {
  const genModel = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite",
    systemInstruction: UI_GENERATION_PROMPT,
  });

  const mimeType = imageBase64.split(';')[0].split(':')[1];
  const base64Data = imageBase64.split(',')[1];

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType
    }
  };

  const textPart = { text: `Device Type: ${device}\nUser Request: ${userInput}` };

  const aiResult = await genModel.generateContent([imagePart, textPart]);
  let rawContent = aiResult.response.text();
  rawContent = rawContent.replace(/```json|```/g, "").trim();

  const jsonResult = JSON.parse(rawContent) as GeneratedConfig;
  console.log("AI Config JSON Result from Image:", jsonResult);

  if (jsonResult) {
    const pName = jsonResult.projectName || jsonResult.theme || theme;
    const pVisual = jsonResult.projectVisualDescription;
    const pTheme = jsonResult.theme || theme;

    await db.update(ProjectsTable).set({
      projectVisualDescription: pVisual,
      projectName: pName,
      theme: pTheme,
    }).where(eq(ProjectsTable.projectId, projectId));

    await db.delete(ScreenConfigTable).where(eq(ScreenConfigTable.projectId, projectId));

    const screenConfigs = (jsonResult.screens || []).map((screen) =>
      db.insert(ScreenConfigTable).values({
        projectId,
        screenName: screen.name,
        purpose: screen.purpose,
        screenDescription: screen.layoutDescription,
        screenId: screen.id,
      })
    );

    await Promise.all(screenConfigs);
    return jsonResult;
  } else {
    throw new Error("InvalidConfigResult");
  }
}

export async function generateScreenUI(
  projectId: string,
  screenId: string,
  screenName: string,
  purpose: string,
  screenDescription: string
): Promise<ScreenConfigType> {
  // Fetch project details for design system blueprint
  const project = await db.select()
    .from(ProjectsTable)
    .where(eq(ProjectsTable.projectId, projectId))
    .limit(1);

  if (!project || project.length === 0) {
    throw new Error("ProjectNotFound");
  }

  const projectVisualDescription = project[0].projectVisualDescription || "";
  const projectName = project[0].projectName || "";

  // Fetch reference screen context
  const allScreens = await db.select()
    .from(ScreenConfigTable)
    .where(eq(ScreenConfigTable.projectId, projectId));

  allScreens.sort((a, b) => a.id - b.id);
  const referenceScreen = allScreens.find((s) => s.code && s.screenId !== screenId);

  const availableScreens = allScreens.map(s => `- Screen Name: "${s.screenName}", ID: "${s.screenId}"`).join('\n');

  let genUserInput = `
    Project Name: ${projectName}
    Project Blueprint: ${projectVisualDescription}
    Screen Name: ${screenName}
    Screen Purpose: ${purpose}
    Screen Description: ${screenDescription}

    AVAILABLE SCREENS FOR PROTOTYPE NAVIGATION:
    Below are the screens available in this project. When building links or buttons that should navigate, use the exact ID listed below in the data-navigate-to attribute (e.g., data-navigate-to="target-screen-id"):
    ${availableScreens}
  `;

  if (referenceScreen && referenceScreen.code) {
    genUserInput += `

    ### Existing Screen Code (Reference)
    Below is the HTML code of another screen in this project ("${referenceScreen.screenName}"). 
    Use this code as a guide. The Header, Navigation, Logo styling, Footer, container sizes/paddings, and design components MUST be copied EXACTLY for visual consistency:
    \`\`\`html
    ${referenceScreen.code}
    \`\`\`
    `;
  }

  const genModel = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite",
    systemInstruction: CODE_GENERATION_PROMPT,
  });

  const aiResult = await genModel.generateContent(genUserInput);
  let response = aiResult.response.text();
  response = response.replace(/```html|```/g, "").trim();

  const updateResult = await db.update(ScreenConfigTable).set({
    code: response,
  }).where(and(eq(ScreenConfigTable.projectId, projectId), eq(ScreenConfigTable.screenId, screenId)))
    .returning();

  return { ...updateResult[0] } as ScreenConfigType;
}

export async function generateNewScreen(
  projectId: string,
  userInput: string
): Promise<ScreenConfigType> {
  const project = await db.select()
    .from(ProjectsTable)
    .where(eq(ProjectsTable.projectId, projectId))
    .limit(1);

  if (!project || project.length === 0) {
    throw new Error("ProjectNotFound");
  }

  const projectName = project[0].projectName || "My App";
  const projectVisualDescription = project[0].projectVisualDescription || "";
  const device = project[0].device || "Website";

  const SYSTEM_INSTRUCTION = `
You are a Lead UI/UX designer. Your goal is to generate a new, additional screen configuration outline for an existing project based on the user's request.
This screen configuration will be used to generate the high-fidelity UI code later.

PROJECT CONTEXT:
- Project Name: ${projectName}
- Global Design Blueprint: ${projectVisualDescription}
- Device Type: ${device}

USER REQUEST:
Generate a new screen matching the description: "${userInput}"

You MUST return ONLY a valid JSON object. No markdown, no explanations, no trailing commas.

OUTPUT JSON STRUCTURE:
{
  "id": "kebab-case-screen-id",
  "name": "Human Readable Screen Name",
  "purpose": "A one-sentence description of the screen's role.",
  "layoutDescription": "Extremely specific, implementable layout instructions. Must include root container strategy, exact sections (header, hero, charts, etc.), realistic data examples, and specific icon names (lucide:icon-name). Ensure this matches the Global Design Blueprint style and navigation patterns."
}
`;

  const genModel = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite",
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const aiResult = await genModel.generateContent(
    `Generate a single screen configuration outline for the user request: ${userInput}`
  );
  let rawContent = aiResult.response.text();
  rawContent = rawContent.replace(/```json|```/g, "").trim();

  const jsonResult = JSON.parse(rawContent) as GeneratedScreenOutline;
  console.log("AI New Screen Config Result:", jsonResult);

  if (jsonResult) {
    const screenId = jsonResult.id || `screen-${Date.now()}`;
    const screenName = jsonResult.name || "New Screen";
    const purpose = jsonResult.purpose || "";
    const screenDescription = jsonResult.layoutDescription || "";

    const insertedRow = await db.insert(ScreenConfigTable).values({
      projectId,
      screenName,
      purpose,
      screenDescription,
      screenId,
    }).returning();

    return insertedRow[0] as unknown as ScreenConfigType;
  } else {
    throw new Error("InvalidScreenConfigResult");
  }
}

export async function editScreen(
  projectId: string,
  screenId: string,
  oldCode: string,
  userInput: string
): Promise<ScreenConfigType> {
  const project = await db.select()
    .from(ProjectsTable)
    .where(eq(ProjectsTable.projectId, projectId))
    .limit(1);

  if (!project || project.length === 0) {
    throw new Error("ProjectNotFound");
  }

  const projectVisualDescription = project[0].projectVisualDescription || "";
  const projectName = project[0].projectName || "";

  const allScreens = await db.select()
    .from(ScreenConfigTable)
    .where(eq(ScreenConfigTable.projectId, projectId));

  allScreens.sort((a, b) => a.id - b.id);
  const referenceScreen = allScreens.find((s) => s.code && s.screenId !== screenId);

  let genUserInput = `
    Project Name: ${projectName}
    Project Blueprint: ${projectVisualDescription}
    Current Code: ${oldCode}
    User Instructions: ${userInput}
    
    Apply the user's instructions to the current code. Maintain the exact same design system, theme, and styling defined in the Project Blueprint and Current Code.
  `;

  if (referenceScreen && referenceScreen.code) {
    genUserInput += `

    ### Existing Screen Code (Reference for Consistency)
    Below is the HTML code of another screen in this project ("${referenceScreen.screenName}").
    The Header, Navigation, Logo styling, Footer, container sizes/paddings, and design components MUST match this screen for visual consistency:
    \`\`\`html
    ${referenceScreen.code}
    \`\`\`
    `;
  }

  const genModel = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite",
    systemInstruction: CODE_GENERATION_PROMPT,
  });

  const aiResult = await genModel.generateContent(genUserInput);
  let response = aiResult.response.text();
  response = response.replace(/```html|```/g, "").trim();

  const updateResult = await db.update(ScreenConfigTable).set({
    code: response,
  }).where(and(eq(ScreenConfigTable.projectId, projectId), eq(ScreenConfigTable.screenId, screenId)))
    .returning();

  return { ...updateResult[0] } as ScreenConfigType;
}

// ─── Design Review ─────────────────────────────────────────────────────────

export interface ReviewIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'suggestion';
  category: string;
}

export interface ReviewResult {
  score: number;       // 1-10
  summary: string;
  issues: ReviewIssue[];
}

/**
 * Extracts a compact semantic summary from HTML.
 * Instead of sending raw HTML (which causes Gemini to embed HTML snippets
 * in JSON strings and break parsing), we extract only the meaningful
 * text content and structure as plain text.
 */
function extractSemanticSummary(html: string): string {
  const get = (regex: RegExp): string[] => {
    const matches: string[] = [];
    let m;
    while ((m = regex.exec(html)) !== null) {
      const text = (m[1] || '').replace(/<[^>]+>/g, '').trim();
      if (text) matches.push(text);
    }
    return matches;
  };

  const h1 = get(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
  const h2 = get(/<h2[^>]*>([\s\S]*?)<\/h2>/gi);
  const h3 = get(/<h3[^>]*>([\s\S]*?)<\/h3>/gi);
  const buttons = get(/<button[^>]*>([\s\S]*?)<\/button>/gi);
  const links = get(/<a[^>]*>([\s\S]*?)<\/a>/gi);
  const labels = get(/<label[^>]*>([\s\S]*?)<\/label>/gi);
  const navs = get(/<nav[^>]*>([\s\S]*?)<\/nav>/gi);

  // Count key elements
  const imgCount = (html.match(/<img/gi) || []).length;
  const imgNoAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length;
  const inputCount = (html.match(/<input/gi) || []).length;
  const formCount = (html.match(/<form/gi) || []).length;
  const btnCount = (html.match(/<button/gi) || []).length;
  const divBtnCount = (html.match(/role=["']button["']/gi) || []).length;
  const hasNav = /<nav/i.test(html);
  const hasMain = /<main/i.test(html);
  const hasH1 = h1.length > 0;

  // Tailwind layout classes for layout hints
  const layoutHints: string[] = [];
  if (/flex/i.test(html)) layoutHints.push('uses flexbox');
  if (/grid/i.test(html)) layoutHints.push('uses CSS grid');
  if (/fixed|sticky/i.test(html)) layoutHints.push('has fixed/sticky elements');
  if (/overflow-(auto|scroll)/i.test(html)) layoutHints.push('has scrollable regions');

  const lines: string[] = ['=== DESIGN SEMANTIC SUMMARY ==='];
  if (h1.length) lines.push(`H1 headings: ${h1.slice(0, 3).join(' | ')}`);
  if (h2.length) lines.push(`H2 headings: ${h2.slice(0, 5).join(' | ')}`);
  if (h3.length) lines.push(`H3 headings: ${h3.slice(0, 5).join(' | ')}`);
  if (buttons.length) lines.push(`Buttons (${btnCount}): ${buttons.slice(0, 6).join(' | ')}`);
  if (links.length) lines.push(`Links (${links.length}): ${links.slice(0, 6).join(' | ')}`);
  if (labels.length) lines.push(`Form labels: ${labels.slice(0, 5).join(' | ')}`);
  if (navs.length) lines.push(`Navigation present: yes`);

  lines.push(`\n=== ELEMENT COUNTS ===`);
  lines.push(`Images: ${imgCount} total, ${imgNoAlt} missing alt text`);
  lines.push(`Inputs: ${inputCount}, Forms: ${formCount}`);
  lines.push(`Semantic elements: nav=${hasNav}, main=${hasMain}, h1=${hasH1}`);
  if (divBtnCount) lines.push(`Non-semantic button-like divs: ${divBtnCount}`);
  if (layoutHints.length) lines.push(`Layout: ${layoutHints.join(', ')}`);

  return lines.join('\n');
}



const REVIEW_SYSTEM_PROMPTS: Record<string, string> = {
  ux: `You are a principal product designer at Google with 15 years of experience shipping consumer products used by billions.
You have deep expertise in information architecture, visual hierarchy, interaction patterns, and user psychology.

Analyse the HTML design structure provided. Review ONLY based on what you can determine from the markup and Tailwind class names.
DO NOT guess or hallucinate issues that are not directly evidenced in the code.

Return your response in EXACTLY this plaintext format (no markdown code blocks, just raw text):
SCORE: <integer 1-10>
SUMMARY: <2-3 sentence overall assessment>
ISSUE: <short-kebab-id>
TITLE: <specific, actionable issue in 4-7 words>
DESC: <one sentence: what is wrong and why it hurts UX>
SEV: <critical | warning | suggestion>
CAT: <hierarchy | spacing | typography | navigation | consistency>
ISSUE: <another-id>
...

Hard rules:
- Maximum 6 issues total
- severity must be strictly one of: critical, warning, suggestion
- ONLY report issues directly observable in the provided code
- DO NOT mention colours, images, or real content unless visible in the markup`,

  accessibility: `You are a certified WCAG 2.1 AA accessibility auditor who has audited 300+ production applications for Fortune 500 companies.
You are meticulous, accurate, and never report violations you cannot directly prove from the code.

Analyse the HTML structure below for accessibility issues.
DO NOT guess or infer problems. Only report what is directly provable from the markup.

Return your response in EXACTLY this plaintext format (no markdown code blocks, just raw text):
SCORE: <integer 1-10>
SUMMARY: <2-3 sentence assessment>
ISSUE: <short-kebab-id>
TITLE: <WCAG criterion short name + the specific element>
DESC: <what fails, which WCAG criterion, and the exact fix>
SEV: <critical | warning | suggestion>
CAT: <semantic | aria | keyboard | alt-text | form-labels>
ISSUE: <another-id>
...

Hard rules:
- Maximum 6 issues total
- severity must be strictly one of: critical, warning, suggestion
- Only report STRUCTURAL issues: missing alt on <img>, wrong heading order (h3 before h2), buttons using <div> or <a>, inputs without <label>
- DO NOT report colour contrast unless hex/rgb values are explicitly in the code
- DO NOT invent WCAG violations you cannot cite directly from the markup`,

  cta: `You are a senior conversion rate optimisation expert and UX strategist who has run 500+ A/B tests on landing pages, onboarding flows, and checkout experiences.
You have a track record of improving conversion rates by 20-200% through targeted UX changes.

Analyse the HTML structure below and identify the specific friction points and CTA weaknesses reducing conversion.
Be precise, practical, and prioritise impact over perfection.

Return your response in EXACTLY this plaintext format (no markdown code blocks, just raw text):
SCORE: <integer 1-10>
SUMMARY: <2-3 sentence assessment. Mention the single biggest blocker.>
ISSUE: <short-kebab-id>
TITLE: <specific conversion problem in 4-7 words>
DESC: <what the problem is, why it reduces conversion, and exact change>
SEV: <critical | warning | suggestion>
CAT: <cta-prominence | value-proposition | friction | trust | above-fold>
ISSUE: <another-id>
...

Hard rules:
- Maximum 6 issues total  
- severity must be strictly one of: critical, warning, suggestion
- Focus on: CTA button visibility, position, size and copy; primary action above-fold; form field count; competing CTAs; urgency/trust signals
- ONLY report issues you can DIRECTLY observe in the markup — no speculation`
};



export async function reviewDesign(
  screenCode: string,
  reviewType: 'ux' | 'accessibility' | 'cta'
): Promise<ReviewResult> {
  const systemPrompt = REVIEW_SYSTEM_PROMPTS[reviewType];
  if (!systemPrompt) throw new Error('Invalid review type');

  // Extract semantic summary — plain text with no HTML tags.
  // This prevents Gemini from embedding raw HTML into JSON strings (which breaks JSON.parse).
  const semanticSummary = extractSemanticSummary(screenCode);

  const genModel = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  });

  const aiResult = await genModel.generateContent(semanticSummary);
  const raw = aiResult.response.text().trim();

  console.log("=== RAW TEXT FROM GEMINI ===");
  console.log(raw);
  console.log("============================");

  // Parse the custom plaintext format
  const parsed: ReviewResult = {
    score: 10,
    summary: 'Could not generate a summary.',
    issues: []
  };

  const lines = raw.split('\n').map(l => l.trim());
  let currentIssue: Partial<ReviewIssue> | null = null;

  for (const line of lines) {
    if (line.startsWith('SCORE:')) {
      parsed.score = parseInt(line.replace('SCORE:', '').trim(), 10) || 10;
    } else if (line.startsWith('SUMMARY:')) {
      parsed.summary = line.replace('SUMMARY:', '').trim();
    } else if (line.startsWith('ISSUE:')) {
      if (currentIssue && currentIssue.id) {
        parsed.issues.push(currentIssue as ReviewIssue);
      }
      currentIssue = {
        id: line.replace('ISSUE:', '').trim(),
        title: '',
        description: '',
        severity: 'warning',
        category: 'general'
      };
    } else if (line.startsWith('TITLE:') && currentIssue) {
      currentIssue.title = line.replace('TITLE:', '').trim();
    } else if (line.startsWith('DESC:') && currentIssue) {
      currentIssue.description = line.replace('DESC:', '').trim();
    } else if (line.startsWith('SEV:') && currentIssue) {
      const sev = line.replace('SEV:', '').trim().toLowerCase();
      if (['critical', 'warning', 'suggestion'].includes(sev)) {
        currentIssue.severity = sev as any;
      }
    } else if (line.startsWith('CAT:') && currentIssue) {
      currentIssue.category = line.replace('CAT:', '').trim();
    }
  }

  // Push the final issue if exists
  if (currentIssue && currentIssue.id) {
    parsed.issues.push(currentIssue as ReviewIssue);
  }

  // Clamp score to 1-10
  parsed.score = Math.max(1, Math.min(10, Math.round(parsed.score)));

  return parsed;
}
