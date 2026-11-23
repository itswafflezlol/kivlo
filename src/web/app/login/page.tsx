import { Suspense } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AuthCard from "@/components/AuthCard";

export const metadata = { title: "Log in — Kivlo" };

export default function Page() {
  return (
    <>
      <Nav />
      <main className="flex min-h-[70vh] items-center justify-center px-5 py-16">
        <Suspense>
          <AuthCard mode="login" />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
