import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.warn('[Auth] WARNING: NEXTAUTH_SECRET is not set. Authentication may fail.')
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log('[Auth] Authorize called with:', {
            hasEmail: !!credentials?.email,
            hasPassword: !!credentials?.password,
            email: credentials?.email,
          })

          if (!credentials?.email || !credentials?.password) {
            console.error('[Auth] Missing credentials')
            return null
          }

          console.log('[Auth] Attempting login for:', credentials.email)
          console.log('[Auth] Environment check:', {
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
          })

          // Проверяем подключение к базе данных
          let user
          try {
            // Use findUnique with email directly (more efficient)
            user = await prisma.user.findUnique({
              where: {
                email: credentials.email,
              },
            })
            
            // Check if user is deleted
            if (user && user.deletedAt) {
              console.error('[Auth] User is deleted:', credentials.email)
              return null
            }
          } catch (dbError: any) {
            console.error('[Auth] Database error:', dbError.message)
            console.error('[Auth] Full error:', JSON.stringify(dbError, null, 2))
            // Если база данных не подключена, возвращаем null
            if (dbError.message?.includes('connect') || dbError.message?.includes('P1001') || dbError.message?.includes('DATABASE_URL')) {
              console.error('[Auth] Database not connected. Please check DATABASE_URL in .env file')
              return null
            }
            throw dbError
          }

          if (!user) {
            console.error('[Auth] User not found:', credentials.email)
            return null
          }

          if (!user.password) {
            console.error('[Auth] User has no password set')
            return null
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isCorrectPassword) {
            console.error('[Auth] Invalid password for:', credentials.email)
            console.error('[Auth] Password provided length:', credentials.password.length)
            console.error('[Auth] Stored password hash length:', user.password.length)
            return null
          }

          console.log('[Auth] Login successful for:', credentials.email)
          
          const userForNextAuth = {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
          
          console.log('[Auth] Returning user object:', userForNextAuth)
          return userForNextAuth
        } catch (error: any) {
          console.error('[Auth] Error:', error.message || error)
          console.error('[Auth] Error stack:', error.stack)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
  // Add error handling
  events: {
    async signIn({ user, account, profile }) {
      console.log('[Auth] Sign in event:', { email: user.email })
    },
    async signInError({ error }) {
      console.error('[Auth] Sign in error:', error)
    },
  },
}

