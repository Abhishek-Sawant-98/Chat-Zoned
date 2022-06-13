import { Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";

const HomePage = lazy(() => import("./pages/HomePage"));
const ChatsPage = lazy(() => import("./pages/ChatsPage"));
const AppToast = lazy(() => import("./components/AppToast"));

function App() {
  return (
    <div className="App">
      <Suspense
        fallback={
          <div style={{marginTop: '200px'}}>
            <h1 className="text-white">Loading...</h1>
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
