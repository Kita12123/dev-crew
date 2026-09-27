import { IntegrationProvider } from "@gen/prisma"
import { UUID } from "crypto"

export type UserDto = {
    id: UUID,
    email: string,
    name: string,
    credentials: CredentialDto[]
}

export type CredentialDto = {
    id: UUID
    provider: IntegrationProvider
    value: string,
}