import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { prisma } from '../services/prisma.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  name: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const payload = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });

  if (existing) {
    res.status(409).json({ message: 'Email already exists.' });
    return;
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const user = await prisma.user.create({
    data: {
      email: payload.email,
      name: payload.name,
      passwordHash,
      plan: 'FREE'
    }
  });

  const token = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: user.id, email: user.email, plan: user.plan } });
});

authRouter.post('/login', async (req, res) => {
  const payload = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: payload.email } });

  if (!user || !user.passwordHash) {
    res.status(401).json({ message: 'Invalid credentials.' });
    return;
  }

  const valid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: 'Invalid credentials.' });
    return;
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, plan: user.plan } });
});

// OAuth exchange should validate provider token and upsert user.
authRouter.post('/oauth/google', async (_req, res) => {
  res.status(501).json({ message: 'Google OAuth token exchange endpoint is scaffolded for provider SDK integration.' });
});
