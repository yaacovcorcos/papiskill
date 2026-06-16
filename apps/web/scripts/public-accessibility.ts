import { chromium, type Page } from "playwright";

export interface AccessibilityOptions {
  baseUrl: string;
  routes: string[];
  json: boolean;
}

export interface ControlAudit {
  tag: string;
  selector: string;
  text: string;
  ariaLabel: string;
  ariaLabelledBy: string;
  title: string;
  labelText: string;
  placeholder: string;
  inputType: string | null;
}

interface DomAccessibilityAudit {
  mainCount: number;
  h1Texts: string[];
  skipLinkText: string | null;
  skipTargetExists: boolean;
  duplicateIds: string[];
  controls: ControlAudit[];
  missingImageAltSelectors: string[];
}

interface PageAccessibilityMetrics {
  route: string;
  url: string;
  status: number;
  mainCount: number;
  h1Texts: string[];
  skipLinkText: string | null;
  skipTargetExists: boolean;
  skipLinkFirstFocusable: boolean;
  skipEnterTargetId: string | null;
  duplicateIds: string[];
  unlabeledControls: ControlAudit[];
  missingImageAltSelectors: string[];
  consoleWarnings: number;
  consoleErrors: number;
  failures: string[];
}

const defaultRoutes = [
  "/skills",
  "/skills/official/code-review",
  "/docs",
  "/docs/authoring",
];

const defaultOptions: AccessibilityOptions = {
  baseUrl: "http://localhost:3000",
  routes: defaultRoutes,
  json: false,
};

export function parseAccessibilityArgs(argv: string[]): AccessibilityOptions {
  const options: AccessibilityOptions = {
    ...defaultOptions,
    routes: [...defaultOptions.routes],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const nextValue = () => {
      const value = argv[index + 1];
      if (!value) throw new Error(`Missing value for ${arg}`);
      index += 1;
      return value;
    };

    if (arg === "--base-url") options.baseUrl = nextValue();
    else if (arg === "--route") options.routes.push(nextValue());
    else if (arg === "--only-route") options.routes = [nextValue()];
    else if (arg === "--json") options.json = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

export function controlNameFailures(controls: ControlAudit[]) {
  return controls.filter((control) => {
    if (control.inputType === "hidden") return false;
    return !accessibleName(control);
  });
}

export function pageAccessibilityFailures(
  metrics: Omit<PageAccessibilityMetrics, "failures">,
) {
  const failures: string[] = [];
  if (metrics.status < 200 || metrics.status >= 400) {
    failures.push(`status ${metrics.status}`);
  }
  if (metrics.consoleErrors > 0) {
    failures.push(`${metrics.consoleErrors} console errors`);
  }
  if (metrics.consoleWarnings > 0) {
    failures.push(`${metrics.consoleWarnings} console warnings`);
  }
  if (metrics.mainCount !== 1) {
    failures.push(`expected 1 main landmark, found ${metrics.mainCount}`);
  }
  if (metrics.h1Texts.length !== 1) {
    failures.push(`expected 1 h1, found ${metrics.h1Texts.length}`);
  }
  if (!metrics.skipLinkText) {
    failures.push("missing skip link");
  }
  if (!metrics.skipTargetExists) {
    failures.push("missing skip link target");
  }
  if (!metrics.skipLinkFirstFocusable) {
    failures.push("skip link is not first focus target");
  }
  if (metrics.skipEnterTargetId !== "main-content") {
    failures.push("skip link does not move focus to main content");
  }
  if (metrics.duplicateIds.length > 0) {
    failures.push(`duplicate ids: ${metrics.duplicateIds.join(", ")}`);
  }
  if (metrics.unlabeledControls.length > 0) {
    failures.push(
      `unlabeled controls: ${metrics.unlabeledControls
        .map((control) => control.selector)
        .join(", ")}`,
    );
  }
  if (metrics.missingImageAltSelectors.length > 0) {
    failures.push(
      `images missing alt: ${metrics.missingImageAltSelectors.join(", ")}`,
    );
  }
  return failures;
}

function accessibleName(control: ControlAudit) {
  return [
    control.ariaLabel,
    control.ariaLabelledBy,
    control.labelText,
    control.text,
    control.title,
  ].some((value) => value.trim().length > 0);
}

async function measureRoute(
  page: Page,
  route: string,
  options: AccessibilityOptions,
): Promise<PageAccessibilityMetrics> {
  const url = absoluteUrl(options.baseUrl, route);
  const consoleMessages: string[] = [];
  const onConsole = (message: { type: () => string }) => {
    const type = message.type();
    if (type === "warning" || type === "error") consoleMessages.push(type);
  };

  page.on("console", onConsole);
  const response = await page.goto(url, { waitUntil: "networkidle" });
  page.off("console", onConsole);
  if (!response) throw new Error(`No response for ${url}`);

  await page.keyboard.press("Tab");
  const firstFocus = await page.evaluate(() => ({
    href: document.activeElement?.getAttribute("href"),
    text: document.activeElement?.textContent?.trim() ?? "",
  }));
  await page.keyboard.press("Enter");
  const skipEnterTargetId = await page.evaluate(
    () => document.activeElement?.id ?? null,
  );

  const domAudit = await page.evaluate(`
    (() => {
      function isHidden(element) {
        if (element.getAttribute("aria-hidden") === "true") return true;
        if (element.hidden) return true;
        const style = window.getComputedStyle(element);
        return style.display === "none" || style.visibility === "hidden";
      }

      function selectorFor(element) {
        const id = element.getAttribute("id");
        if (id) return element.tagName.toLowerCase() + "#" + id;
        const label = element.getAttribute("aria-label");
        if (label) return element.tagName.toLowerCase() + "[aria-label=\\"" + label + "\\"]";
        const text = (element.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 40);
        return text ? element.tagName.toLowerCase() + " \\"" + text + "\\"" : element.tagName.toLowerCase();
      }

      function labelledByText(element) {
        const ids = (element.getAttribute("aria-labelledby") || "").split(/\\s+/).filter(Boolean);
        return ids
          .map((id) => {
            const target = document.getElementById(id);
            return target ? (target.textContent || "").trim() : "";
          })
          .filter(Boolean)
          .join(" ");
      }

      function labelText(element) {
        if (!("labels" in element)) return "";
        return Array.from(element.labels || [])
          .map((label) => (label.textContent || "").trim())
          .filter(Boolean)
          .join(" ");
      }

      const ids = Array.from(document.querySelectorAll("[id]"))
        .map((element) => element.id)
        .filter(Boolean);
      const duplicateIds = Array.from(new Set(ids.filter((id, index) => ids.indexOf(id) !== index)));

      const controls = Array.from(
        document.querySelectorAll("a[href], button, input, textarea, select, summary"),
      )
        .filter((element) => !isHidden(element))
        .map((element) => ({
          tag: element.tagName.toLowerCase(),
          selector: selectorFor(element),
          text: (element.textContent || "").trim().replace(/\\s+/g, " "),
          ariaLabel: element.getAttribute("aria-label") || "",
          ariaLabelledBy: labelledByText(element),
          title: element.getAttribute("title") || "",
          labelText: labelText(element),
          placeholder: element.getAttribute("placeholder") || "",
          inputType: element instanceof HTMLInputElement ? element.type.toLowerCase() : null,
        }));

      const missingImageAltSelectors = Array.from(document.querySelectorAll("img"))
        .filter((image) => !isHidden(image) && !image.hasAttribute("alt"))
        .map((image) => selectorFor(image));

      return {
        mainCount: document.querySelectorAll("main").length,
        h1Texts: Array.from(document.querySelectorAll("h1"))
          .map((heading) => (heading.textContent || "").trim())
          .filter(Boolean),
        skipLinkText:
          (document.querySelector('a[href="#main-content"]') || {}).textContent?.trim() || null,
        skipTargetExists: Boolean(document.getElementById("main-content")),
        duplicateIds,
        controls,
        missingImageAltSelectors,
      };
    })()
  `) as DomAccessibilityAudit;

  const metrics = {
    route,
    url,
    status: response.status(),
    consoleWarnings: consoleMessages.filter((type) => type === "warning").length,
    consoleErrors: consoleMessages.filter((type) => type === "error").length,
    skipLinkFirstFocusable:
      firstFocus.href === "#main-content" &&
      firstFocus.text === domAudit.skipLinkText,
    skipEnterTargetId,
    mainCount: domAudit.mainCount,
    h1Texts: domAudit.h1Texts,
    skipLinkText: domAudit.skipLinkText,
    skipTargetExists: domAudit.skipTargetExists,
    duplicateIds: domAudit.duplicateIds,
    unlabeledControls: controlNameFailures(domAudit.controls),
    missingImageAltSelectors: domAudit.missingImageAltSelectors,
  };

  return {
    ...metrics,
    failures: pageAccessibilityFailures(metrics),
  };
}

function absoluteUrl(baseUrl: string, route: string) {
  return new URL(route, ensureTrailingSlash(baseUrl)).toString();
}

function ensureTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}

function printText(results: PageAccessibilityMetrics[]) {
  for (const result of results) {
    console.log(
      [
        `PAGE ${result.route}`,
        `${result.status}`,
        `h1=${result.h1Texts.length}`,
        `main=${result.mainCount}`,
        `controls=${result.unlabeledControls.length} unlabeled`,
        `console=${result.consoleWarnings}w/${result.consoleErrors}e`,
      ].join(" "),
    );
    if (result.failures.length > 0) {
      console.log(`  failures: ${result.failures.join(", ")}`);
    }
  }
}

async function main() {
  const options = parseAccessibilityArgs(process.argv.slice(2));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    const results = [];
    for (const route of options.routes) {
      results.push(await measureRoute(page, route, options));
    }

    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      printText(results);
    }

    const failures = results.flatMap((result) =>
      result.failures.map((failure) => `${result.route}: ${failure}`),
    );
    if (failures.length > 0) {
      console.error(`Public accessibility smoke failed:\n${failures.join("\n")}`);
      process.exitCode = 1;
    }
  } finally {
    await page.close().catch(() => undefined);
    await browser.close().catch(() => undefined);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
