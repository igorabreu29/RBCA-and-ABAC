import { FastifyInstance } from "fastify";
import { tuple, z } from 'zod'

import { prisma } from "@/database/prisma.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { can } from "../middlewares/permissions.ts";

export async function usersRoutes(app: FastifyInstance) {
  app.post('/register', async (req, res) => {
    const registerBody = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string()
    })

    const { name, email, password } = registerBody.parse(req.body)

    const userAlreadyExist = await prisma.user.findFirst({
      where: {
        email
      }
    })

    if (userAlreadyExist) {
      return res.status(400).send({ message: 'User Already Exist' })
    }

    await prisma.user.create({
      data: {
        email,
        name,
        password,
        RolesOnUsers: {
          create: {
            roleId: 'db29f35c-43ba-4b57-bb6a-b7f0679a9d7c'
          }
        }
      }
    })

    return res.status(201).send()
  })

  app.post('/authenticate', async (req, res) => {
    const authenticateBody = z.object({
      email: z.string().email(),
      password: z.string()
    })

    const { email, password } = authenticateBody.parse(req.body)
    
    const user = await prisma.user.findFirst({
      where: {
        email
      }
    })

    if (!user) {
      return res.status(401).send({ message: 'Invalid credentials.' })
    }

    const isPasswordValid = user.password === password

    if (!isPasswordValid) {
      return res.status(401).send({ message: 'Invalid credentials.' })
    }

    const token = await res.jwtSign({}, { sign: { sub: user.id } })

    return res.status(201).send({ token, })
  })

  app.get('/session/users', {onRequest: [verifyJWT, can(['list_users'])]}, async (req, res) => {
    const users = await prisma.user.findMany()
    return res.send({ users })
  })
}