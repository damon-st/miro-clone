import { ReactNode } from "react";
import Sidebar from "./_components/sidebar";
import OrgSidebar from "./_components/org-sidebar";
import NavBar from "./_components/navbar";

type Props = {
  children: ReactNode;
};

export default function LayoutDashbord({ children }: Props) {
  return (
    <main className="h-full">
      <Sidebar />
      <div className="pl-[60px] h-full">
        <div className="flex gap-x-3 h-full">
          <OrgSidebar />
          <div className="h-full flex-1">
            <NavBar />
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
