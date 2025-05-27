# Feature: UI Display of LangGraph State via `dash_outputs`

**Goal:** Enhance the frontend UI to display structured data from a dedicated `dash_outputs` list within the LangGraph state. This list is already being returned by the backend AI agent API and contains items specifically designated for dashboard visualization, each flagged with an "intent" to guide its display.

**User Story:** As a user interacting with the options trading copilot, I want to see a dynamic display of the AI agent's relevant outputs (like charts, data tables, key figures) on a dedicated dashboard panel, where each output is presented appropriately based on its type ("intent"), so I can easily consume and understand the agent's findings.

## Frontend (React.js) Implementation Guidelines:

**Context:**
*   The frontend is built with React.js.
*   The backend AI agent API (Python-based, with LangGraph) returns the full LangGraph state object per user interaction.
*   Crucially, within this state object, there is a specific field named `dash_outputs`. This field is a list.
*   Each item in the `dash_outputs` list is an object containing:
    *   The structured data result itself.
    *   An "intent" flag (or similar type indicator) that specifies what kind of result it is (e.g., 'portfolio_summary_table', 'asset_price_chart_data', 'risk_metric_value').
*   The frontend chat implementation receives this full state object but is not yet utilizing `dash_outputs`.
*   The goal is to create a new dashboard area/panel adjacent to the chat window, associated with the current chat session/thread. This dashboard will iterate through the `dash_outputs` list and render each item appropriately.
*   For this MVP, the UI will *only* use the `dash_outputs` list as provided directly by the API.

**Tasks for Cursor to Guide (Step-by-Step):**

1.  **Locate and Understand `dash_outputs`:**
    *   Confirm the exact path to the `dash_outputs` list within the LangGraph state object received by the frontend.
    *   Examine the typical structure of items within the `dash_outputs` list, paying attention to how the "intent" and the "structured data result" are represented.
    *   *Cursor: Please analyze the existing API response handling in the frontend to understand the structure of the `dash_outputs` list and its items.*

2.  **Design Dashboard Data Handling:**
    *   Define how the React component(s) for the dashboard will store and manage the `dash_outputs` list.
    *   Consider that `dash_outputs` likely represents a chronological feed, so new items might be appended or the list might be replaced with each API response for the current chat session.

3.  **Create Dashboard Component(s) in React:**
    *   Guide the creation of new React component(s) for the dashboard panel.
    *   This panel should be designed to display a "rolling feed" by rendering each item from the `dash_outputs` list.

4.  **Implement Conditional Rendering based on "Intent":**
    *   The core logic will be to iterate over the `dash_outputs` list.
    *   For each item, use its "intent" flag to conditionally render a specific React sub-component or display logic.
        *   Example: If `intent === 'portfolio_summary_table'`, render a `PortfolioTable` component.
        *   Example: If `intent === 'asset_price_chart_data'`, render a `PriceChart` component (for MVP, this could initially be a placeholder or simple data display before actual charting is implemented).
    *   Guide the creation of a few initial placeholder sub-components for 2-3 common "intents" found in `dash_outputs`.
    *   *Cursor: Show how to iterate through `dash_outputs` and use a switch statement or conditional logic based on the "intent" of each item to render different placeholder components.*

5.  **Pass Data to Intent-Specific Components:**
    *   Show how to pass the "structured data result" from each `dash_outputs` item as props to its corresponding intent-specific rendering component.

6.  **State Management and Updates:**
    *   Advise on managing the `dash_outputs` list within React state.
    *   Ensure the dashboard re-renders correctly when a new `dash_outputs` list is received from the API.

7.  **Styling and Layout:**
    *   Provide general guidance on styling the dashboard panel and the rendered output items.

**Key Considerations:**

*   **MVP Focus:** Start by handling 2-3 key "intents" from `dash_outputs` with simple placeholder renderers. Actual complex visualizations (like charts) can be developed iteratively.
*   **Extensibility:** Design the conditional rendering logic such that adding support for new "intents" in the future is straightforward.
*   **Chronological Order:** The dashboard should generally display items from `dash_outputs` in the order they appear in the list, reflecting the flow of the conversation.

**Example Scenario (Illustrative):**
*   `dash_outputs` list in LangGraph state:
    ```json
    [
      { "intent": "risk_metric_value", "data": { "metric_name": "Portfolio Delta", "value": "150.25" } },
      { "intent": "asset_price_chart_data", "data": { "symbol": "TSLA", "prices": [...] } }
    ]
    ```
*   Dashboard displays:
    *   A rendered component for "Portfolio Delta: 150.25"
    *   A (placeholder/simple) rendered component for "TSLA Price Chart Data: [summary or placeholder]"

---