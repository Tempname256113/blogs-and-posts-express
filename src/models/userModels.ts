import {queryPaginationType} from "./queryModels";

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