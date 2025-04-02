# Plan: Sidebar Navigation Overhaul

**Objective:** Redesign the application's sidebar navigation to span the full height of the screen (from header to footer) for improved usability, visual consistency, and better space utilization, addressing the layout issues identified in the provided UI screenshot.

**Current State Analysis:**
*   The existing sidebar navigation panel appears as a drawer originating from the top-left.
*   It occupies only a fraction of the vertical screen real estate, which can lead to scrolling for longer lists and feels disconnected from the lower portion of the UI (like the footer elements).
*   The main content area and footer are visually separate from the sidebar's vertical flow.

**Proposed Design:**

1.  **Layout:**
    *   Implement a persistent vertical sidebar docked firmly to the left edge of the screen.
    *   The sidebar's height will stretch from the bottom edge of the global header (or the very top of the viewport if no distinct header band exists) down to the top edge of the global footer.
    *   The main content area will occupy the remaining horizontal space to the right of the sidebar.

2.  **Sidebar Content & Structure:**
    *   **Header:** Include a clear title or logo at the top of the sidebar. The current "Navigation" title and close 'X' button should be integrated cleanly into this new structure. The 'X' might become a collapse/expand icon if the sidebar is designed to be collapsible.
    *   **Navigation Items:** Vertically stack the primary navigation items ("Brainstorm Map", "S3 Connection", "Sample Cards", etc.) with clear visual separation, appropriate padding, and distinct hover/active states. Use icons consistently alongside text labels.
    *   **Footer/Secondary Actions:** Consider if any elements currently in the main footer (like settings or user profile access, if applicable) could be logically moved to the bottom of the new sidebar for better grouping of navigation/actions.

3.  **Header & Footer Integration:**
    *   **Global Header:** Ensure the global header spans the full width above both the sidebar and the main content area. Its design should be complementary to the new sidebar.
    *   **Global Footer:** The footer containing sync status, icons (web, settings, etc.), breadcrumbs, and the chat button should span the full width *below* both the sidebar and the main content area. Minor adjustments to the footer's internal layout might be needed to ensure visual balance now that the sidebar extends down to it.

4.  **Visual Design & Optimization:**
    *   Maintain the existing dark theme and general aesthetic.
    *   Ensure text size, icon size, and spacing within the sidebar are optimized for readability and ease of interaction.
    *   Use visual hierarchy (e.g., slightly bolder text for the active section) to guide the user.

5.  **Responsiveness (Consideration):**
    *   While the primary request focuses on the desktop view, the design should anticipate future adaptation for smaller screens (e.g., collapsing to icons, using a hamburger menu trigger).

6.  **Mockup/Visual Aid:**
    *   A detailed visual mockup illustrating this proposed layout is the next step to visualize the changes before implementation. This plan serves as the specification for that mockup.

**Implementation Steps (High-Level):**
1.  **HTML Structure:** Refactor the main application layout (likely using `div`s or semantic HTML5 elements) to create distinct containers for `header`, `sidebar`, `main-content`, and `footer`.
2.  **CSS Styling:** Utilize CSS (Flexbox or Grid are ideal) to define the layout.
    *   Set the sidebar to a fixed width and `height: 100%` (or calculated height like `calc(100vh - headerHeight - footerHeight)` if header/footer have fixed heights). Position it appropriately (e.g., `position: fixed; left: 0; top: headerHeight;`).
    *   Adjust the `main-content` area's margin or padding to prevent overlap with the fixed sidebar.
    *   Style the sidebar's internal elements (background, text, icons, spacing, hover/active states).
    *   Ensure the footer is correctly positioned below both sidebar and content.

