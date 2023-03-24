import {queryPaginationType} from "./query-models";

type UsersQueryPaginationType = queryPaginationType & {
    searchLoginTerm: string | undefined,
    searchEmailTerm: string | undefined
}

type RequestUserType = {
    login: string,
    password: string,
    email: string
}

type UserType = {
    id: string,
    login: string,
    email: string,
    password?: string,
    createdAt: string
}

type InfoAboutUserType = {
    email: string,
    login: string,
    userId: string
}

type UserTypeExtended = {
    id: string,
    accountData: {
        login: string,
        email: string,
        password?: string,
        createdAt: string
    },
    emailConfirmation: {
        confirmationCode: string | null,
        expirationDate: Date,
        isConfirmed: boolean
    },
    passwordRecovery: {
        recoveryCode: string | null
    }
}

type UserTypeExtendedOptionalFields = {
    id?: string,
    accountData?: UserTypeExtended['accountData'],
    emailConfirmation?: UserTypeExtended["emailConfirmation"],
    passwordRecovery?: UserTypeExtended["passwordRecovery"]
}

export {
    UsersQueryPaginationType,
    RequestUserType,
    UserType,
    InfoAboutUserType,
    UserTypeExtended,
    UserTypeExtendedOptionalFields
}