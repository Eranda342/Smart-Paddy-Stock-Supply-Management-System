import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <ThemeProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;