import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Decorative premium gradient background glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-secondary/15 blur-[150px] pointer-events-none" />
      
      {/* Centered card wrapper */}
      <div className="w-full max-w-[450px] glass rounded-2xl p-8 relative z-10 shadow-2xl">
        {children}
      </div>
    </main>
  );
}
