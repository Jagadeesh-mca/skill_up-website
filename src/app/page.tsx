import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    const role = (session.user as any).role;
    if (role === Role.ADMIN) redirect("/admin");
    if (role === Role.TEACHER) redirect("/teacher");
    redirect("/student");
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-6">
      <div className="max-w-2xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium border border-blue-500/30">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          Hindustan Institute of Technology & Science
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Skill Up Assessment Platform
        </h1>

        <p className="text-slate-300 text-lg sm:text-xl">
          Dynamic question bank, intelligent duplicate detection, server-timed adaptive assessments, and personalized practice for university placement training.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-500/25 text-center"
          >
            Access Portal
          </Link>
        </div>
      </div>
    </main>
  );
}
