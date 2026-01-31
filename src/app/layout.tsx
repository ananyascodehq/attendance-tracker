import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Attendance Tracker',
  description: 'College Attendance Tracking System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-8">
                <h1 className="text-2xl font-bold text-blue-600">AttendanceTracker</h1>
                <div className="hidden md:flex gap-6">
                  <a href="/" className="text-gray-700 hover:text-blue-600">Dashboard</a>
                  <a href="/attendance" className="text-gray-700 hover:text-blue-600">Log Attendance</a>
                  <a href="/planner" className="text-gray-700 hover:text-blue-600">Planner</a>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
