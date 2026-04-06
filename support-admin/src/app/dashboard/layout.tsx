import Sidebar from "@/components/Layouts/Sidebar";
import Header from "@/components/Layouts/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-1 dark:bg-dark">
      <Sidebar />
      <div className="ml-64 flex w-full flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
