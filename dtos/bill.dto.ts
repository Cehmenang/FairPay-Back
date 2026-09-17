import { Type } from "class-transformer"

export class CreateBillItemDto {
    name: string
    qty: number
    unitPrice: number
    contactId: string
}

export class CreateParticipantDto {
    contactId: string
    shareAmount: number
}

export class CreateBillDto {
    title: string

    @Type(()=>CreateBillItemDto)
    items: CreateBillItemDto[]

    tax: number

    grossAmount: number

    grandTotal: number

    @Type(()=>CreateParticipantDto)
    participants: CreateParticipantDto[]

    currency: string
}