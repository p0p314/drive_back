export class Item {
    constructor(public name: string, public isFiLe: boolean, public path?: string) { }
}

export class ItemSharedDto {

    constructor(
        public owner_rowid: number,
        public sharedto_rowid: number,
        public owner_file_path: string,
        public login: string
    ) { }
}
export class ItemUserShares {
    constructor(public target: string, public path: string) { }

}
export class ItemUserShared {
    constructor(public owner: string, public path: string) { }

}