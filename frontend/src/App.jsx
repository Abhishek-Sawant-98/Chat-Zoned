import { Route, Routes } from "react-router-dom";
import { Suspense, lazy, useRef } from "react";
import animationData from "../src/animations/app-loading.json";
import LottieAnimation from "../src/components/utils/LottieAnimation";

const HomePage = lazy(() => import("./pages/HomePage"));
const ChatsPage = lazy(() => import("./pages/ChatsPage"));
const AppToast = lazy(() => import("./components/utils/AppToast"));

function App() {
  const loadingGif = useRef(null);
  return (
    <div className="App">
      <Suspense
        fallback={
          <div style={{ marginTop: 150 }}>
            <LottieAnimation
              ref={loadingGif}
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
    </div>
  );
}

export default App;
