import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { validateHindustanEmail } from "./email-validator";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/access-denied",
  },
  providers: [
    // 1. Google OAuth Provider with Institutional Domain Enforcement
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          hd: "hindustanuniv.ac.in", // Suggests university domain on Google login prompt
        },
      },
    }),

    // 2. Development & Testing Mock Credentials Provider
    CredentialsProvider({
      id: "mock-login",
      name: "University Dev Login",
      credentials: {
        email: { label: "University Email", type: "email", placeholder: "sp123456@student.hindustanuniv.ac.in" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required.");
        }

        const emailValidation = validateHindustanEmail(credentials.email);
        if (!emailValidation.isValid) {
          throw new Error(emailValidation.error || "Invalid institutional email.");
        }

        const role = (credentials.role as Role) || (emailValidation.role as Role) || Role.STUDENT;

        // Find or auto-provision local user in database
        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: emailValidation.normalizedEmail! },
            include: { studentProfile: true, teacherProfile: true },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: emailValidation.normalizedEmail!,
                name: emailValidation.identifier
                  ? emailValidation.identifier.toUpperCase()
                  : "Hindustan User",
                role: role,
                ...(role === Role.STUDENT
                  ? {
                      studentProfile: {
                        create: {
                          registerNo: emailValidation.identifier?.toUpperCase(),
                        },
                      },
                    }
                  : {}),
                ...(role === Role.TEACHER || role === Role.ADMIN
                  ? {
                      teacherProfile: {
                        create: {
                          designation: role === Role.ADMIN ? "Administrator" : "Assistant Professor",
                        },
                      },
                    }
                  : {}),
              },
              include: { studentProfile: true, teacherProfile: true },
            });
          }
        } catch (dbErr) {
          // Fallback in-memory user when DB is initializing
          return {
            id: "temp-" + Date.now(),
            email: emailValidation.normalizedEmail!,
            name: emailValidation.identifier?.toUpperCase() || "Hindustan User",
            role: role,
          };
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const validation = validateHindustanEmail(user.email);
        if (!validation.isValid) {
          // Reject sign in; NextAuth redirects to pages.error with error query param
          return `/access-denied?reason=${encodeURIComponent(validation.error || "Invalid domain")}`;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || Role.STUDENT;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as Role;
      }
      return session;
    },
  },
};
