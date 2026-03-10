import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";

function LayoutWrapper() {
  const location = useLocation();

  // Hide layout for ALL dashboard roles
  const hideLayout =
    location.pathname.startsWith("/student") ||
    location.pathname.startsWith("/trainer") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/superadmin") ||
    location.pathname.startsWith("/marketer");

  return (
    <>
      {!hideLayout && <Navbar />}
      <AppRoutes />
      {!hideLayout && <Footer />}
    </>
  );
}

function App() {
  return <LayoutWrapper />;
}

export default App;