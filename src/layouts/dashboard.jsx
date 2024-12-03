import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom"; // Import useNavigate
import { PlusIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController } from "@/context";
import AddTask from "@/pages/dashboard/addtask"; // Import AddTask

export function Dashboard() {
  const [controller] = useMaterialTailwindController();
  const { sidenavType } = controller;

  const navigate = useNavigate(); // Initialize navigate function

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav routes={routes} brandImg="/img/logo_footer.png" />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        <Configurator />

        {/* Plus Icon Button */}
        <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => navigate("http://localhost:5173/dashboard/AJOUTER-TACHE")} // Navigate to /add-task when clicked
        >
          <PlusIcon className="h-5 w-5" />
        </IconButton>

        {/* Routes */}
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
              ))
          )}
          {/* AddTask Route */}
          <Route path="http://localhost:5173/dashboard/AJOUTER-TACHE" element={<AddTask />} />
        </Routes>

        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
