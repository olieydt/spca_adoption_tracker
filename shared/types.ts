export type User = {
    name: string
    email: string
    animalTypeSubscriptions: AnimalType[]
}


export type Animal = {
    type: AnimalType
    name: string
    url: string
    ageType: AgeType
    sex: SEX,
    imageUrl: string
}

export enum AgeType {
    Baby = 'baby',
    Young = 'young',
    Adult = 'adult',
    Old = 'old'
}

export enum SEX {
    Male = 'male',
    Female = 'female'
}

export enum AnimalType {
    Dog = 'dog',
    Cat = 'cat'
}