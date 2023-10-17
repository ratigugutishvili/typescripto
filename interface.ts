export interface User{
    name:string,
    surname:string,
    email:string,
    password:string,
    id:number,
    createdAt:Date
}
export interface Expences{
    id:number,
    type:'expence'|'income',
    category: string,
    amount:number,
    date: string,
    userId: number
}