'use client';

import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from './root';

// tRPC React フック
export const trpc = createTRPCReact<AppRouter>();