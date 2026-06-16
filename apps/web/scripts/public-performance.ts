import { chromium, type Page } from "playwright";

export interface PerformanceOptions {
  baseUrl: string;
  pageRoutes: string[];
  endpointRoutes: string[];
  json: boolean;
  maxDomContentLoadedMs: number;
  maxLoadMs: number;
  maxHtmlBytes: number;
}

interface PageMetrics {
  kind: "page";
  route: string;
  url: string;
  status: number;
  domContentLoadedMs: number;
  loadMs: number;
  htmlBytes: number;
  resourceCount: number;
  transferBytes: number;
  consoleWarnings: number;
  consoleErrors: number;
  cacheControl: string | null;
  failures: string[];
}

interface EndpointMetrics {
  kind: "endpoint";
  route: string;
  url: string;
  status: number;
  bytes: number;
  contentType: string | null;
  cacheControl: string | null;
  cdnCacheControl: string | null;
  failures: string[];
}

type PublicPerformanceResult = PageMetrics | EndpointMetrics;

const defaultPageRoutes = [
  "/skills",
  "/skills/official/code-review",
];

const defaultEndpointRoutes = [
  "/api/v1/health",
  "/api/v1/skills/official/code-review",
  "/download/official/code-review?format=zip",
];

const defaultOptions: PerformanceOptions = {
  baseUrl: "http://localhost:3000",
  pageRoutes: defaultPageRoutes,
  endpointRoutes: defaultEndpointRoutes,
  json: false,
  maxDomContentLoadedMs: 8_000,
  maxLoadMs: 10_000,
  maxHtmlBytes: 750_000,
};

export function parsePerformanceArgs(argv: string[]): PerformanceOptions {
  const options: PerformanceOptions = {
    ...defaultOptions,
    pageRoutes: [...defaultOptions.pageRoutes],
    endpointRoutes: [...defaultOptions.endpointRoutes],
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
    else if (arg === "--page") options.pageRoutes.push(nextValue());
    else if (arg === "--endpoint") options.endpointRoutes.push(nextValue());
    else if (arg === "--only-page") options.pageRoutes = [nextValue()];
    else if (arg === "--only-endpoint") options.endpointRoutes = [nextValue()];
    else if (arg === "--json") options.json = true;
    else if (arg === "--max-dcl-ms") options.maxDomContentLoadedMs = Number(nextValue());
    else if (arg === "--max-load-ms") options.maxLoadMs = Number(nextValue());
    else if (arg === "--max-html-bytes") options.maxHtmlBytes = Number(nextValue());
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isFinite(options.maxDomContentLoadedMs)) {
    throw new Error("--max-dcl-ms must be a number");
  }
  if (!Number.isFinite(options.maxLoadMs)) {
    throw new Error("--max-load-ms must be a number");
  }
  if (!Number.isFinite(options.maxHtmlBytes)) {
    throw new Error("--max-html-bytes must be a number");
  }

  return options;
}

export function pageFailures(
  metrics: Omit<PageMetrics, "failures" | "kind">,
  options: Pick<PerformanceOptions, "maxDomContentLoadedMs" | "maxLoadMs" | "maxHtmlBytes">,
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
  if (metrics.domContentLoadedMs > options.maxDomContentLoadedMs) {
    failures.push(`domcontentloaded ${metrics.domContentLoadedMs}ms`);
  }
  if (metrics.loadMs > options.maxLoadMs) {
    failures.push(`load ${metrics.loadMs}ms`);
  }
  if (metrics.htmlBytes > options.maxHtmlBytes) {
    failures.push(`html ${metrics.htmlBytes} bytes`);
  }
  return failures;
}

export function endpointFailures(metrics: Omit<EndpointMetrics, "failures" | "kind">) {
  const failures: string[] = [];
  if (metrics.status < 200 || metrics.status >= 400) {
    failures.push(`status ${metrics.status}`);
  }
  if (!metrics.cacheControl?.includes("public")) {
    failures.push("missing public cache-control");
  }
  if (!metrics.cdnCacheControl?.includes("public")) {
    failures.push("missing public cdn-cache-control");
  }
  return failures;
}

async function measurePage(
  page: Page,
  route: string,
  options: PerformanceOptions,
): Promise<PageMetrics> {
  const url = absoluteUrl(options.baseUrl, route);
  const consoleMessages: string[] = [];
  const onConsole = (message: { type: () => string }) => {
    const type = message.type();
    if (type === "warning" || type === "error") consoleMessages.push(type);
  };

  page.on("console", onConsole);
  const response = await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);
  page.off("console", onConsole);

  if (!response) throw new Error(`No response for ${url}`);
  const htmlBytes = (await response.body()).byteLength;
  const timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    return {
      domContentLoadedMs: Math.round(nav?.domContentLoadedEventEnd ?? 0),
      loadMs: Math.round(nav?.loadEventEnd || nav?.duration || 0),
      resourceCount: resources.length,
      transferBytes: Math.round(resources.reduce((total, item) => total + (item.transferSize || 0), 0)),
    };
  });
  const metrics = {
    route,
    url,
    status: response.status(),
    htmlBytes,
    cacheControl: response.headers()["cache-control"] ?? null,
    consoleWarnings: consoleMessages.filter((type) => type === "warning").length,
    consoleErrors: consoleMessages.filter((type) => type === "error").length,
    ...timing,
  };

  return {
    kind: "page",
    ...metrics,
    failures: pageFailures(metrics, options),
  };
}

async function measureEndpoint(
  route: string,
  options: PerformanceOptions,
): Promise<EndpointMetrics> {
  const url = absoluteUrl(options.baseUrl, route);
  const response = await fetch(url);
  const body = await response.arrayBuffer();
  const metrics = {
    route,
    url,
    status: response.status,
    bytes: body.byteLength,
    contentType: response.headers.get("content-type"),
    cacheControl: response.headers.get("cache-control"),
    cdnCacheControl:
      response.headers.get("cdn-cache-control") ??
      response.headers.get("vercel-cdn-cache-control"),
  };

  return {
    kind: "endpoint",
    ...metrics,
    failures: endpointFailures(metrics),
  };
}

function absoluteUrl(baseUrl: string, route: string) {
  return new URL(route, ensureTrailingSlash(baseUrl)).toString();
}

function ensureTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}

function printText(results: PublicPerformanceResult[]) {
  for (const result of results) {
    if (result.kind === "page") {
      console.log(
        [
          `PAGE ${result.route}`,
          `${result.status}`,
          `dcl=${result.domContentLoadedMs}ms`,
          `load=${result.loadMs}ms`,
          `html=${result.htmlBytes}b`,
          `resources=${result.resourceCount}`,
          `console=${result.consoleWarnings}w/${result.consoleErrors}e`,
        ].join(" "),
      );
    } else {
      console.log(
        [
          `ENDPOINT ${result.route}`,
          `${result.status}`,
          `bytes=${result.bytes}`,
          `cache=${result.cacheControl ?? "missing"}`,
          `cdn=${result.cdnCacheControl ?? "missing"}`,
        ].join(" "),
      );
    }
    if (result.failures.length > 0) {
      console.log(`  failures: ${result.failures.join(", ")}`);
    }
  }
}

async function main() {
  const options = parsePerformanceArgs(process.argv.slice(2));
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const pageResults = [];
    for (const route of options.pageRoutes) {
      pageResults.push(await measurePage(page, route, options));
    }

    const endpointResults = [];
    for (const route of options.endpointRoutes) {
      endpointResults.push(await measureEndpoint(route, options));
    }

    const results = [...pageResults, ...endpointResults];
    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      printText(results);
    }

    const failures = results.flatMap((result) =>
      result.failures.map((failure) => `${result.route}: ${failure}`),
    );
    if (failures.length > 0) {
      console.error(`Public performance smoke failed:\n${failures.join("\n")}`);
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
