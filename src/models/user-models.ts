import {queryPaginationType} from "./query-models";

export type usersQueryPaginationType = queryPaginationType & {
    searchLoginTerm: string | undefined,
    searchEmailTerm: string | undefined
}

export type requestUserType = {
    login: string,
    password: string,
    email: string
}

export type userType = {
    id: string,
    login: string,
    email: string,
    password?: string,
    createdAt: string
}

export type infoAboutUserType = {
    email: string,
    login: string,
    userId: string
}

export type userTypeExtended = {
    id: string,
    accountData: {
        login: string,
        email: string,
        password?: string,
        createdAt: string
    },
    emailConfirmation: {
        confirmationCode: string,
        expirationDate: Date,
        isConfirmed: boolean
    }
}