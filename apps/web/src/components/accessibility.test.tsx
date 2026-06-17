import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  commentAuthorLabel,
  copyInstallCommandLabel,
  deleteCommentLabel,
  downloadSkillLabel,
  hideCommentLabel,
  openProfileSkillLabel,
  signInToStarLabel,
  starCountLabel,
} from "./action-labels";
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

  it("does not flash a signed-out account state before hydration", () => {
    const html = renderToStaticMarkup(<AppHeader />);

    expect(html).toContain("h-10 w-36");
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain(">Sign in</span>");
    expect(html).not.toContain(">Sign in with GitHub</span>");
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

  it("builds target-aware labels for compact icon actions", () => {
    expect(starCountLabel(1)).toBe("1 star");
    expect(starCountLabel(2)).toBe("2 stars");
    expect(signInToStarLabel(0)).toBe("Sign in to star skill. 0 stars.");
    expect(copyInstallCommandLabel("Code Review")).toBe(
      "Copy install command for Code Review",
    );
    expect(downloadSkillLabel("Code Review")).toBe("Download Code Review");
    expect(openProfileSkillLabel("Code Review")).toBe("Open Code Review profile page");
    expect(commentAuthorLabel("yaacovcorcos", null)).toBe("@yaacovcorcos");
    expect(commentAuthorLabel(null, "Yaacov")).toBe("Yaacov");
    expect(hideCommentLabel("yaacovcorcos", null)).toBe("Hide comment by @yaacovcorcos");
    expect(deleteCommentLabel(null, "Yaacov")).toBe("Delete comment by Yaacov");
  });
});
