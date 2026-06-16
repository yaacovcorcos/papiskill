import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppHeader } from "./app-header";
import { CopyButton } from "./copy-button";
import { FormFeedback } from "./form-feedback";

describe("shared accessibility affordances", () => {
  it("renders a skip link and target around the shared header", () => {
    const html = renderToStaticMarkup(<AppHeader />);

    expect(html).toContain('href="#main-content"');
    expect(html).toContain("Skip to content");
    expect(html).toContain('id="main-content"');
  });

  it("keeps copy buttons keyboard-visible and labelled", () => {
    const html = renderToStaticMarkup(
      <CopyButton value="papiskill install official/code-review" label="Copy install command" />,
    );

    expect(html).toContain('aria-label="Copy install command"');
    expect(html).toContain("focus-ring");
  });

  it("renders form feedback as live regions", () => {
    const errorHtml = renderToStaticMarkup(
      <FormFeedback id="save-feedback" kind="error">
        Could not save.
      </FormFeedback>,
    );
    const successHtml = renderToStaticMarkup(
      <FormFeedback id="save-feedback" kind="success">
        Saved.
      </FormFeedback>,
    );

    expect(errorHtml).toContain('role="alert"');
    expect(errorHtml).toContain('aria-live="assertive"');
    expect(successHtml).toContain('role="status"');
    expect(successHtml).toContain('aria-live="polite"');
  });
});
