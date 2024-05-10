import fastify from "fastify";
import jwt from '@fastify/jwt'
import { usersRoutes } from "./http/controllers/users.ts";

export const app = fastify()
app.register(jwt, {
  secret: 'random-secret'
})
app.register(usersRoutes)