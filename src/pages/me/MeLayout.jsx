import { Outlet, NavLink } from "react-router-dom";

export default function MeLayout() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">AZTUALIZADO 8</h1>
      
      <Outlet />
    </div>
  );
}
