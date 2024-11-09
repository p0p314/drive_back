export class User {
    constructor(public login: string, public role: string) { }
}

export class UserDto {
    constructor(public login: string, public password: string) { }
}

export class userAllDataDto {
    constructor(public rowid: number, public login: string, public password: string, public role: string, public quota: number) { }
}