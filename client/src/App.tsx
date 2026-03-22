import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import MyOrders from "./pages/MyOrders";
import FormOS from "./pages/FormOS";
import FormOC from "./pages/FormOC";
import Checklist from "./pages/Checklist";
import ChecklistVehicle from "./pages/ChecklistVehicle";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import { OrderDetails } from "./pages/OrderDetails";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/orders"} component={Orders} />
      <Route path={"/my-orders"} component={MyOrders} />
      <Route path={"/form/os"} component={FormOS} />
      <Route path={"/form/oc"} component={FormOC} />
      <Route path={"/checklist"} component={Checklist} />
      <Route path={"/checklist/vehicle"} component={ChecklistVehicle} />
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/admin/orders"} component={AdminOrders} />
      <Route path={"/users"} component={AdminUsers} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/order/:id"} component={OrderDetails} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
