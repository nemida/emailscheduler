import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { eq } from 'drizzle-orm';
import { env } from './env';
import { db } from '../db';
import { users, senders } from '../db/schema';
import type { User } from '../db/schema';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value ?? '';
        const avatar = profile.photos?.[0]?.value ?? null;

        const existing = await db.query.users.findFirst({
          where: eq(users.googleId, profile.id),
        });

        if (existing) {
          await db
            .update(users)
            .set({ name: profile.displayName, avatar, email })
            .where(eq(users.googleId, profile.id));

          return done(null, { ...existing, name: profile.displayName, avatar, email });
        }

        const [newUser] = await db
          .insert(users)
          .values({
            googleId: profile.id,
            email,
            name: profile.displayName,
            avatar,
          })
          .returning();

        await db.insert(senders).values({
          userId: newUser.id,
          email: newUser.email,
          name: newUser.name,
          smtpHost: 'smtp.ethereal.email',
          smtpPort: 587,
          smtpUser: 'ethereal',
          smtpPass: 'ethereal',
        });

        return done(null, newUser);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    done(null, user ?? false);
  } catch (err) {
    done(err);
  }
});

export default passport;
