import { Route, Routes } from "react-router-dom";
import { Suspense, lazy, useRef } from "react";
import animationData from "./animations/app-loading.json";
import LottieAnimation from "./components/utils/LottieAnimation";
import ErrorBoundary from "./pages/ErrorBoundary";
import type { lazyComponent, SpanRef } from "./utils/AppTypes";

const HomePage: lazyComponent = lazy(() => import("./pages/HomePage"));
const ChatsPage: lazyComponent = lazy(() => import("./pages/ChatsPage"));
const AppToast: lazyComponent = lazy(
  () => import("./components/utils/AppToast")
);

function App() {
  const loadingGif = useRef<HTMLSpanElement>(null);
  return (
    <div className="App">
      <ErrorBoundary>
        <Suspense
          fallback={
            <div style={{ marginTop: 150 }}>
              <LottieAnimation
                ref={loadingGif as SpanRef}
                className={"d-inline-block"}
                style={{ marginBottom: 10, height: 110 }}
                animationData={animationData}
              />
              <p className="text-white" style={{ fontSize: 40 }}>
                Loading...
              </p>
            </div>
          }
        >
          {/* App routes */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chats" element={<ChatsPage />} />
          </Routes>

          {/* Toast */}
          <AppToast />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default App;
