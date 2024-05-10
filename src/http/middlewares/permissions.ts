import { FastifyRequest, FastifyReply } from 'fastify'

import { prisma } from "@/database/prisma.ts";
import { Permission } from "@prisma/client";

export function can(permissionsRoutes: string[]) {
  return async (req: FastifyRequest, res: FastifyReply) => {
    const { sub } = req.user

    const users = await prisma.rolesOnUsers.findFirstOrThrow({
      where: {
        userId: sub
      }
    })

    const permissions = await prisma.permissionsOnRoles.findMany({
      where: {
        roleId: users.roleId
      },
      include: {
        permissions: {
          select: {
            name: true
          }
        }
      }
    })

    const canPass = permissions.some(item => permissionsRoutes.includes(item.permissions.name))
        
    if (!canPass) {
      return res.status(401).send({ message: 'Unauthorized.' })
    }
  } 
}

// import { FastifyRequest, FastifyReply } from 'fastify'

// export function can(permissions: string[]) {
//   return async (req: FastifyRequest, res: FastifyReply) => {
//     const user = {
//       id: 'test',      
//       name: 'Igor',
//       password: 'igor2020',
//       role: 'admin',
//       email: 'igorabreu20@test.com',
//       createdAt: new Date(),
//       permissions: [
//         {
//           id: '1',
//           name: 'list_users',
//         }
//       ]
//     }

//     const canPass = user.permissions.some(item => permissions.includes(item.name))
    
//     if (!canPass) {
//       return res.status(401).send({ message: 'Unauthorized.' })
//     }
//   }
// }