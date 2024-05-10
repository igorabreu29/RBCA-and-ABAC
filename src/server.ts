import { app } from "@/app.ts";

const host = await app.listen({ port: 3333 })
console.log('Server running on host', host)