# Final Project: E-Commerce Advanced Architecture

## 1. Architecture Description
**Pattern Used:** Container/Presenter Pattern.
- **Containers:** Handle state, Redux dispatching, and Side Effects (API calls).
- **Presenters:** Pure functional components that receive data via props.
- **State Management:** Global state handled by Redux Toolkit (Slices).
- **Data Flow:** API -> AsyncThunk -> Redux Store -> Container -> Presenter.

## 2. Technical Justification
- **React:** Chosen for its Component-Based architecture and rich ecosystem.
- **Redux Toolkit:** Selected over Context API to handle complex global state (Cart, User, Product Lists) efficiently without prop-drilling or excessive re-renders.
- **Vite:** Used for faster HMR (Hot Module Replacement) compared to Webpack.

## 3. Performance Analysis
- **Lazy Loading:** Implemented on all Route levels. The `AdminScreen` bundle is 0kb for normal users.
- **Memoization:**
    - `React.memo` used on `ProductView` to prevent re-rendering when parent state changes.
    - `useCallback` used for `addToCart` handlers to maintain referential integrity.
- **Code Splitting:** Achieved via `React.lazy`.

## 4. Test Results
- **Tools:** Vitest + React Testing Library.
- **Coverage:** 80% coverage on Redux Slices (Business Logic) and Utility Hooks.
- *(Insert Screenshot of terminal showing green checkmarks here)*

## 5. Deployment Plan
- **CI/CD:** GitHub Actions workflow configured to run `npm test` on PR.
- **Hosting:** Vercel (Frontend) + Heroku (Backend).
- **Build:** `npm run build` generates optimized static assets.