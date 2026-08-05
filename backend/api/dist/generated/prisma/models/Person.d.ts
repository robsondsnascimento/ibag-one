import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type PersonModel = runtime.Types.Result.DefaultSelection<Prisma.$PersonPayload>;
export type AggregatePerson = {
    _count: PersonCountAggregateOutputType | null;
    _min: PersonMinAggregateOutputType | null;
    _max: PersonMaxAggregateOutputType | null;
};
export type PersonMinAggregateOutputType = {
    id: string | null;
    nome: string | null;
    sexo: string | null;
    dataNascimento: Date | null;
    cpf: string | null;
    telefone: string | null;
    email: string | null;
    ativo: boolean | null;
    dataDecisao: Date | null;
    dataBatismo: Date | null;
    dataMembresia: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    campusId: string | null;
};
export type PersonMaxAggregateOutputType = {
    id: string | null;
    nome: string | null;
    sexo: string | null;
    dataNascimento: Date | null;
    cpf: string | null;
    telefone: string | null;
    email: string | null;
    ativo: boolean | null;
    dataDecisao: Date | null;
    dataBatismo: Date | null;
    dataMembresia: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    campusId: string | null;
};
export type PersonCountAggregateOutputType = {
    id: number;
    nome: number;
    sexo: number;
    dataNascimento: number;
    cpf: number;
    telefone: number;
    email: number;
    ativo: number;
    dataDecisao: number;
    dataBatismo: number;
    dataMembresia: number;
    createdAt: number;
    updatedAt: number;
    campusId: number;
    _all: number;
};
export type PersonMinAggregateInputType = {
    id?: true;
    nome?: true;
    sexo?: true;
    dataNascimento?: true;
    cpf?: true;
    telefone?: true;
    email?: true;
    ativo?: true;
    dataDecisao?: true;
    dataBatismo?: true;
    dataMembresia?: true;
    createdAt?: true;
    updatedAt?: true;
    campusId?: true;
};
export type PersonMaxAggregateInputType = {
    id?: true;
    nome?: true;
    sexo?: true;
    dataNascimento?: true;
    cpf?: true;
    telefone?: true;
    email?: true;
    ativo?: true;
    dataDecisao?: true;
    dataBatismo?: true;
    dataMembresia?: true;
    createdAt?: true;
    updatedAt?: true;
    campusId?: true;
};
export type PersonCountAggregateInputType = {
    id?: true;
    nome?: true;
    sexo?: true;
    dataNascimento?: true;
    cpf?: true;
    telefone?: true;
    email?: true;
    ativo?: true;
    dataDecisao?: true;
    dataBatismo?: true;
    dataMembresia?: true;
    createdAt?: true;
    updatedAt?: true;
    campusId?: true;
    _all?: true;
};
export type PersonAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonWhereInput;
    orderBy?: Prisma.PersonOrderByWithRelationInput | Prisma.PersonOrderByWithRelationInput[];
    cursor?: Prisma.PersonWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | PersonCountAggregateInputType;
    _min?: PersonMinAggregateInputType;
    _max?: PersonMaxAggregateInputType;
};
export type GetPersonAggregateType<T extends PersonAggregateArgs> = {
    [P in keyof T & keyof AggregatePerson]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePerson[P]> : Prisma.GetScalarType<T[P], AggregatePerson[P]>;
};
export type PersonGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonWhereInput;
    orderBy?: Prisma.PersonOrderByWithAggregationInput | Prisma.PersonOrderByWithAggregationInput[];
    by: Prisma.PersonScalarFieldEnum[] | Prisma.PersonScalarFieldEnum;
    having?: Prisma.PersonScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PersonCountAggregateInputType | true;
    _min?: PersonMinAggregateInputType;
    _max?: PersonMaxAggregateInputType;
};
export type PersonGroupByOutputType = {
    id: string;
    nome: string;
    sexo: string | null;
    dataNascimento: Date | null;
    cpf: string | null;
    telefone: string | null;
    email: string | null;
    ativo: boolean;
    dataDecisao: Date | null;
    dataBatismo: Date | null;
    dataMembresia: Date | null;
    createdAt: Date;
    updatedAt: Date;
    campusId: string;
    _count: PersonCountAggregateOutputType | null;
    _min: PersonMinAggregateOutputType | null;
    _max: PersonMaxAggregateOutputType | null;
};
export type GetPersonGroupByPayload<T extends PersonGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PersonGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PersonGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PersonGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PersonGroupByOutputType[P]>;
}>>;
export type PersonWhereInput = {
    AND?: Prisma.PersonWhereInput | Prisma.PersonWhereInput[];
    OR?: Prisma.PersonWhereInput[];
    NOT?: Prisma.PersonWhereInput | Prisma.PersonWhereInput[];
    id?: Prisma.StringFilter<"Person"> | string;
    nome?: Prisma.StringFilter<"Person"> | string;
    sexo?: Prisma.StringNullableFilter<"Person"> | string | null;
    dataNascimento?: Prisma.DateTimeNullableFilter<"Person"> | Date | string | null;
    cpf?: Prisma.StringNullableFilter<"Person"> | string | null;
    telefone?: Prisma.StringNullableFilter<"Person"> | string | null;
    email?: Prisma.StringNullableFilter<"Person"> | string | null;
    ativo?: Prisma.BoolFilter<"Person"> | boolean;
    dataDecisao?: Prisma.DateTimeNullableFilter<"Person"> | Date | string | null;
    dataBatismo?: Prisma.DateTimeNullableFilter<"Person"> | Date | string | null;
    dataMembresia?: Prisma.DateTimeNullableFilter<"Person"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"Person"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Person"> | Date | string;
    campusId?: Prisma.StringFilter<"Person"> | string;
    campus?: Prisma.XOR<Prisma.CampusScalarRelationFilter, Prisma.CampusWhereInput>;
};
export type PersonOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    sexo?: Prisma.SortOrderInput | Prisma.SortOrder;
    dataNascimento?: Prisma.SortOrderInput | Prisma.SortOrder;
    cpf?: Prisma.SortOrderInput | Prisma.SortOrder;
    telefone?: Prisma.SortOrderInput | Prisma.SortOrder;
    email?: Prisma.SortOrderInput | Prisma.SortOrder;
    ativo?: Prisma.SortOrder;
    dataDecisao?: Prisma.SortOrderInput | Prisma.SortOrder;
    dataBatismo?: Prisma.SortOrderInput | Prisma.SortOrder;
    dataMembresia?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    campusId?: Prisma.SortOrder;
    campus?: Prisma.CampusOrderByWithRelationInput;
};
export type PersonWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    cpf?: string;
    email?: string;
    AND?: Prisma.PersonWhereInput | Prisma.PersonWhereInput[];
    OR?: Prisma.PersonWhereInput[];
    NOT?: Prisma.PersonWhereInput | Prisma.PersonWhereInput[];
    nome?: Prisma.StringFilter<"Person"> | string;
    sexo?: Prisma.StringNullableFilter<"Person"> | string | null;
    dataNascimento?: Prisma.DateTimeNullableFilter<"Person"> | Date | string | null;
    telefone?: Prisma.StringNullableFilter<"Person"> | string | null;
    ativo?: Prisma.BoolFilter<"Person"> | boolean;
    dataDecisao?: Prisma.DateTimeNullableFilter<"Person"> | Date | string | null;
    dataBatismo?: Prisma.DateTimeNullableFilter<"Person"> | Date | string | null;
    dataMembresia?: Prisma.DateTimeNullableFilter<"Person"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"Person"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Person"> | Date | string;
    campusId?: Prisma.StringFilter<"Person"> | string;
    campus?: Prisma.XOR<Prisma.CampusScalarRelationFilter, Prisma.CampusWhereInput>;
}, "id" | "cpf" | "email">;
export type PersonOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    sexo?: Prisma.SortOrderInput | Prisma.SortOrder;
    dataNascimento?: Prisma.SortOrderInput | Prisma.SortOrder;
    cpf?: Prisma.SortOrderInput | Prisma.SortOrder;
    telefone?: Prisma.SortOrderInput | Prisma.SortOrder;
    email?: Prisma.SortOrderInput | Prisma.SortOrder;
    ativo?: Prisma.SortOrder;
    dataDecisao?: Prisma.SortOrderInput | Prisma.SortOrder;
    dataBatismo?: Prisma.SortOrderInput | Prisma.SortOrder;
    dataMembresia?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    campusId?: Prisma.SortOrder;
    _count?: Prisma.PersonCountOrderByAggregateInput;
    _max?: Prisma.PersonMaxOrderByAggregateInput;
    _min?: Prisma.PersonMinOrderByAggregateInput;
};
export type PersonScalarWhereWithAggregatesInput = {
    AND?: Prisma.PersonScalarWhereWithAggregatesInput | Prisma.PersonScalarWhereWithAggregatesInput[];
    OR?: Prisma.PersonScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PersonScalarWhereWithAggregatesInput | Prisma.PersonScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Person"> | string;
    nome?: Prisma.StringWithAggregatesFilter<"Person"> | string;
    sexo?: Prisma.StringNullableWithAggregatesFilter<"Person"> | string | null;
    dataNascimento?: Prisma.DateTimeNullableWithAggregatesFilter<"Person"> | Date | string | null;
    cpf?: Prisma.StringNullableWithAggregatesFilter<"Person"> | string | null;
    telefone?: Prisma.StringNullableWithAggregatesFilter<"Person"> | string | null;
    email?: Prisma.StringNullableWithAggregatesFilter<"Person"> | string | null;
    ativo?: Prisma.BoolWithAggregatesFilter<"Person"> | boolean;
    dataDecisao?: Prisma.DateTimeNullableWithAggregatesFilter<"Person"> | Date | string | null;
    dataBatismo?: Prisma.DateTimeNullableWithAggregatesFilter<"Person"> | Date | string | null;
    dataMembresia?: Prisma.DateTimeNullableWithAggregatesFilter<"Person"> | Date | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Person"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Person"> | Date | string;
    campusId?: Prisma.StringWithAggregatesFilter<"Person"> | string;
};
export type PersonCreateInput = {
    id?: string;
    nome: string;
    sexo?: string | null;
    dataNascimento?: Date | string | null;
    cpf?: string | null;
    telefone?: string | null;
    email?: string | null;
    ativo?: boolean;
    dataDecisao?: Date | string | null;
    dataBatismo?: Date | string | null;
    dataMembresia?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    campus: Prisma.CampusCreateNestedOneWithoutPersonsInput;
};
export type PersonUncheckedCreateInput = {
    id?: string;
    nome: string;
    sexo?: string | null;
    dataNascimento?: Date | string | null;
    cpf?: string | null;
    telefone?: string | null;
    email?: string | null;
    ativo?: boolean;
    dataDecisao?: Date | string | null;
    dataBatismo?: Date | string | null;
    dataMembresia?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    campusId: string;
};
export type PersonUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    sexo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dataNascimento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    cpf?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    telefone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    email?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    ativo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    dataDecisao?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dataBatismo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dataMembresia?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    campus?: Prisma.CampusUpdateOneRequiredWithoutPersonsNestedInput;
};
export type PersonUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    sexo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dataNascimento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    cpf?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    telefone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    email?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    ativo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    dataDecisao?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dataBatismo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dataMembresia?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    campusId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PersonCreateManyInput = {
    id?: string;
    nome: string;
    sexo?: string | null;
    dataNascimento?: Date | string | null;
    cpf?: string | null;
    telefone?: string | null;
    email?: string | null;
    ativo?: boolean;
    dataDecisao?: Date | string | null;
    dataBatismo?: Date | string | null;
    dataMembresia?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    campusId: string;
};
export type PersonUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    sexo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dataNascimento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    cpf?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    telefone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    email?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    ativo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    dataDecisao?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dataBatismo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dataMembresia?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PersonUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    sexo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dataNascimento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    cpf?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    telefone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    email?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    ativo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    dataDecisao?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dataBatismo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dataMembresia?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    campusId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PersonListRelationFilter = {
    every?: Prisma.PersonWhereInput;
    some?: Prisma.PersonWhereInput;
    none?: Prisma.PersonWhereInput;
};
export type PersonOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type PersonCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    sexo?: Prisma.SortOrder;
    dataNascimento?: Prisma.SortOrder;
    cpf?: Prisma.SortOrder;
    telefone?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    ativo?: Prisma.SortOrder;
    dataDecisao?: Prisma.SortOrder;
    dataBatismo?: Prisma.SortOrder;
    dataMembresia?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    campusId?: Prisma.SortOrder;
};
export type PersonMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    sexo?: Prisma.SortOrder;
    dataNascimento?: Prisma.SortOrder;
    cpf?: Prisma.SortOrder;
    telefone?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    ativo?: Prisma.SortOrder;
    dataDecisao?: Prisma.SortOrder;
    dataBatismo?: Prisma.SortOrder;
    dataMembresia?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    campusId?: Prisma.SortOrder;
};
export type PersonMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    sexo?: Prisma.SortOrder;
    dataNascimento?: Prisma.SortOrder;
    cpf?: Prisma.SortOrder;
    telefone?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    ativo?: Prisma.SortOrder;
    dataDecisao?: Prisma.SortOrder;
    dataBatismo?: Prisma.SortOrder;
    dataMembresia?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    campusId?: Prisma.SortOrder;
};
export type PersonCreateNestedManyWithoutCampusInput = {
    create?: Prisma.XOR<Prisma.PersonCreateWithoutCampusInput, Prisma.PersonUncheckedCreateWithoutCampusInput> | Prisma.PersonCreateWithoutCampusInput[] | Prisma.PersonUncheckedCreateWithoutCampusInput[];
    connectOrCreate?: Prisma.PersonCreateOrConnectWithoutCampusInput | Prisma.PersonCreateOrConnectWithoutCampusInput[];
    createMany?: Prisma.PersonCreateManyCampusInputEnvelope;
    connect?: Prisma.PersonWhereUniqueInput | Prisma.PersonWhereUniqueInput[];
};
export type PersonUncheckedCreateNestedManyWithoutCampusInput = {
    create?: Prisma.XOR<Prisma.PersonCreateWithoutCampusInput, Prisma.PersonUncheckedCreateWithoutCampusInput> | Prisma.PersonCreateWithoutCampusInput[] | Prisma.PersonUncheckedCreateWithoutCampusInput[];
    connectOrCreate?: Prisma.PersonCreateOrConnectWithoutCampusInput | Prisma.PersonCreateOrConnectWithoutCampusInput[];
    createMany?: Prisma.PersonCreateManyCampusInputEnvelope;
    connect?: Prisma.PersonWhereUniqueInput | Prisma.PersonWhereUniqueInput[];
};
export type PersonUpdateManyWithoutCampusNestedInput = {
    create?: Prisma.XOR<Prisma.PersonCreateWithoutCampusInput, Prisma.PersonUncheckedCreateWithoutCampusInput> | Prisma.PersonCreateWithoutCampusInput[] | Prisma.PersonUncheckedCreateWithoutCampusInput[];
    connectOrCreate?: Prisma.PersonCreateOrConnectWithoutCampusInput | Prisma.PersonCreateOrConnectWithoutCampusInput[];
    upsert?: Prisma.PersonUpsertWithWhereUniqueWithoutCampusInput | Prisma.PersonUpsertWithWhereUniqueWithoutCampusInput[];
    createMany?: Prisma.PersonCreateManyCampusInputEnvelope;
    set?: Prisma.PersonWhereUniqueInput | Prisma.PersonWhereUniqueInput[];
    disconnect?: Prisma.PersonWhereUniqueInput | Prisma.PersonWhereUniqueInput[];
    delete?: Prisma.PersonWhereUniqueInput | Prisma.PersonWhereUniqueInput[];
    connect?: Prisma.PersonWhereUniqueInput | Prisma.PersonWhereUniqueInput[];
    update?: Prisma.PersonUpdateWithWhereUniqueWithoutCampusInput | Prisma.PersonUpdateWithWhereUniqueWithoutCampusInput[];
    updateMany?: Prisma.PersonUpdateManyWithWhereWithoutCampusInput | Prisma.PersonUpdateManyWithWhereWithoutCampusInput[];
    deleteMany?: Prisma.PersonScalarWhereInput | Prisma.PersonScalarWhereInput[];
};
export type PersonUncheckedUpdateManyWithoutCampusNestedInput = {
    create?: Prisma.XOR<Prisma.PersonCreateWithoutCampusInput, Prisma.PersonUncheckedCreateWithoutCampusInput> | Prisma.PersonCreateWithoutCampusInput[] | Prisma.PersonUncheckedCreateWithoutCampusInput[];
    connectOrCreate?: Prisma.PersonCreateOrConnectWithoutCampusInput | Prisma.PersonCreateOrConnectWithoutCampusInput[];
    upsert?: Prisma.PersonUpsertWithWhereUniqueWithoutCampusInput | Prisma.PersonUpsertWithWhereUniqueWithoutCampusInput[];
    createMany?: Prisma.PersonCreateManyCampusInputEnvelope;
    set?: Prisma.PersonWhereUniqueInput | Prisma.PersonWhereUniqueInput[];
    disconnect?: Prisma.PersonWhereUniqueInput | Prisma.PersonWhereUniqueInput[];
    delete?: Prisma.PersonWhereUniqueInput | Prisma.PersonWhereUniqueInput[];
    connect?: Prisma.PersonWhereUniqueInput | Prisma.PersonWhereUniqueInput[];
    update?: Prisma.PersonUpdateWithWhereUniqueWithoutCampusInput | Prisma.PersonUpdateWithWhereUniqueWithoutCampusInput[];
    updateMany?: Prisma.PersonUpdateManyWithWhereWithoutCampusInput | Prisma.PersonUpdateManyWithWhereWithoutCampusInput[];
    deleteMany?: Prisma.PersonScalarWhereInput | Prisma.PersonScalarWhereInput[];
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type PersonCreateWithoutCampusInput = {
    id?: string;
    nome: string;
    sexo?: string | null;
    dataNascimento?: Date | string | null;
    cpf?: string | null;
    telefone?: string | null;
    email?: string | null;
    ativo?: boolean;
    dataDecisao?: Date | string | null;
    dataBatismo?: Date | string | null;
    dataMembresia?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PersonUncheckedCreateWithoutCampusInput = {
    id?: string;
    nome: string;
    sexo?: string | null;
    dataNascimento?: Date | string | null;
    cpf?: string | null;
    telefone?: string | null;
    email?: string | null;
    ativo?: boolean;
    dataDecisao?: Date | string | null;
    dataBatismo?: Date | string | null;
    dataMembresia?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PersonCreateOrConnectWithoutCampusInput = {
    where: Prisma.PersonWhereUniqueInput;
    create: Prisma.XOR<Prisma.PersonCreateWithoutCampusInput, Prisma.PersonUncheckedCreateWithoutCampusInput>;
};
export type PersonCreateManyCampusInputEnvelope = {
    data: Prisma.PersonCreateManyCampusInput | Prisma.PersonCreateManyCampusInput[];
    skipDuplicates?: boolean;
};
export type PersonUpsertWithWhereUniqueWithoutCampusInput = {
    where: Prisma.PersonWhereUniqueInput;
    update: Prisma.XOR<Prisma.PersonUpdateWithoutCampusInput, Prisma.PersonUncheckedUpdateWithoutCampusInput>;
    create: Prisma.XOR<Prisma.PersonCreateWithoutCampusInput, Prisma.PersonUncheckedCreateWithoutCampusInput>;
};
export type PersonUpdateWithWhereUniqueWithoutCampusInput = {
    where: Prisma.PersonWhereUniqueInput;
    data: Prisma.XOR<Prisma.PersonUpdateWithoutCampusInput, Prisma.PersonUncheckedUpdateWithoutCampusInput>;
};
export type PersonUpdateManyWithWhereWithoutCampusInput = {
    where: Prisma.PersonScalarWhereInput;
    data: Prisma.XOR<Prisma.PersonUpdateManyMutationInput, Prisma.PersonUncheckedUpdateManyWithoutCampusInput>;
};
export type PersonScalarWhereInput = {
    AND?: Prisma.PersonScalarWhereInput | Prisma.PersonScalarWhereInput[];
    OR?: Prisma.PersonScalarWhereInput[];
    NOT?: Prisma.PersonScalarWhereInput | Prisma.PersonScalarWhereInput[];
    id?: Prisma.StringFilter<"Person"> | string;
    nome?: Prisma.StringFilter<"Person"> | string;
    sexo?: Prisma.StringNullableFilter<"Person"> | string | null;
    dataNascimento?: Prisma.DateTimeNullableFilter<"Person"> | Date | string | null;
    cpf?: Prisma.StringNullableFilter<"Person"> | string | null;
    telefone?: Prisma.StringNullableFilter<"Person"> | string | null;
    email?: Prisma.StringNullableFilter<"Person"> | string | null;
    ativo?: Prisma.BoolFilter<"Person"> | boolean;
    dataDecisao?: Prisma.DateTimeNullableFilter<"Person"> | Date | string | null;
    dataBatismo?: Prisma.DateTimeNullableFilter<"Person"> | Date | string | null;
    dataMembresia?: Prisma.DateTimeNullableFilter<"Person"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"Person"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Person"> | Date | string;
    campusId?: Prisma.StringFilter<"Person"> | string;
};
export type PersonCreateManyCampusInput = {
    id?: string;
    nome: string;
    sexo?: string | null;
    dataNascimento?: Date | string | null;
    cpf?: string | null;
    telefone?: string | null;
    email?: string | null;
    ativo?: boolean;
    dataDecisao?: Date | string | null;
    dataBatismo?: Date | string | null;
    dataMembresia?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PersonUpdateWithoutCampusInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    sexo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dataNascimento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    cpf?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    telefone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    email?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    ativo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    dataDecisao?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dataBatismo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dataMembresia?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PersonUncheckedUpdateWithoutCampusInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    sexo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dataNascimento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    cpf?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    telefone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    email?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    ativo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    dataDecisao?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dataBatismo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dataMembresia?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PersonUncheckedUpdateManyWithoutCampusInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    sexo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dataNascimento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    cpf?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    telefone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    email?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    ativo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    dataDecisao?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dataBatismo?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dataMembresia?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PersonSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nome?: boolean;
    sexo?: boolean;
    dataNascimento?: boolean;
    cpf?: boolean;
    telefone?: boolean;
    email?: boolean;
    ativo?: boolean;
    dataDecisao?: boolean;
    dataBatismo?: boolean;
    dataMembresia?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    campusId?: boolean;
    campus?: boolean | Prisma.CampusDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["person"]>;
export type PersonSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nome?: boolean;
    sexo?: boolean;
    dataNascimento?: boolean;
    cpf?: boolean;
    telefone?: boolean;
    email?: boolean;
    ativo?: boolean;
    dataDecisao?: boolean;
    dataBatismo?: boolean;
    dataMembresia?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    campusId?: boolean;
    campus?: boolean | Prisma.CampusDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["person"]>;
export type PersonSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nome?: boolean;
    sexo?: boolean;
    dataNascimento?: boolean;
    cpf?: boolean;
    telefone?: boolean;
    email?: boolean;
    ativo?: boolean;
    dataDecisao?: boolean;
    dataBatismo?: boolean;
    dataMembresia?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    campusId?: boolean;
    campus?: boolean | Prisma.CampusDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["person"]>;
export type PersonSelectScalar = {
    id?: boolean;
    nome?: boolean;
    sexo?: boolean;
    dataNascimento?: boolean;
    cpf?: boolean;
    telefone?: boolean;
    email?: boolean;
    ativo?: boolean;
    dataDecisao?: boolean;
    dataBatismo?: boolean;
    dataMembresia?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    campusId?: boolean;
};
export type PersonOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "nome" | "sexo" | "dataNascimento" | "cpf" | "telefone" | "email" | "ativo" | "dataDecisao" | "dataBatismo" | "dataMembresia" | "createdAt" | "updatedAt" | "campusId", ExtArgs["result"]["person"]>;
export type PersonInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    campus?: boolean | Prisma.CampusDefaultArgs<ExtArgs>;
};
export type PersonIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    campus?: boolean | Prisma.CampusDefaultArgs<ExtArgs>;
};
export type PersonIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    campus?: boolean | Prisma.CampusDefaultArgs<ExtArgs>;
};
export type $PersonPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Person";
    objects: {
        campus: Prisma.$CampusPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        nome: string;
        sexo: string | null;
        dataNascimento: Date | null;
        cpf: string | null;
        telefone: string | null;
        email: string | null;
        ativo: boolean;
        dataDecisao: Date | null;
        dataBatismo: Date | null;
        dataMembresia: Date | null;
        createdAt: Date;
        updatedAt: Date;
        campusId: string;
    }, ExtArgs["result"]["person"]>;
    composites: {};
};
export type PersonGetPayload<S extends boolean | null | undefined | PersonDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PersonPayload, S>;
export type PersonCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PersonFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PersonCountAggregateInputType | true;
};
export interface PersonDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Person'];
        meta: {
            name: 'Person';
        };
    };
    findUnique<T extends PersonFindUniqueArgs>(args: Prisma.SelectSubset<T, PersonFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PersonClient<runtime.Types.Result.GetResult<Prisma.$PersonPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends PersonFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PersonFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PersonClient<runtime.Types.Result.GetResult<Prisma.$PersonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends PersonFindFirstArgs>(args?: Prisma.SelectSubset<T, PersonFindFirstArgs<ExtArgs>>): Prisma.Prisma__PersonClient<runtime.Types.Result.GetResult<Prisma.$PersonPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends PersonFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PersonFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PersonClient<runtime.Types.Result.GetResult<Prisma.$PersonPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends PersonFindManyArgs>(args?: Prisma.SelectSubset<T, PersonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends PersonCreateArgs>(args: Prisma.SelectSubset<T, PersonCreateArgs<ExtArgs>>): Prisma.Prisma__PersonClient<runtime.Types.Result.GetResult<Prisma.$PersonPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends PersonCreateManyArgs>(args?: Prisma.SelectSubset<T, PersonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends PersonCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PersonCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends PersonDeleteArgs>(args: Prisma.SelectSubset<T, PersonDeleteArgs<ExtArgs>>): Prisma.Prisma__PersonClient<runtime.Types.Result.GetResult<Prisma.$PersonPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends PersonUpdateArgs>(args: Prisma.SelectSubset<T, PersonUpdateArgs<ExtArgs>>): Prisma.Prisma__PersonClient<runtime.Types.Result.GetResult<Prisma.$PersonPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends PersonDeleteManyArgs>(args?: Prisma.SelectSubset<T, PersonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends PersonUpdateManyArgs>(args: Prisma.SelectSubset<T, PersonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends PersonUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PersonUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends PersonUpsertArgs>(args: Prisma.SelectSubset<T, PersonUpsertArgs<ExtArgs>>): Prisma.Prisma__PersonClient<runtime.Types.Result.GetResult<Prisma.$PersonPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends PersonCountArgs>(args?: Prisma.Subset<T, PersonCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PersonCountAggregateOutputType> : number>;
    aggregate<T extends PersonAggregateArgs>(args: Prisma.Subset<T, PersonAggregateArgs>): Prisma.PrismaPromise<GetPersonAggregateType<T>>;
    groupBy<T extends PersonGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PersonGroupByArgs['orderBy'];
    } : {
        orderBy?: PersonGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PersonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPersonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: PersonFieldRefs;
}
export interface Prisma__PersonClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    campus<T extends Prisma.CampusDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CampusDefaultArgs<ExtArgs>>): Prisma.Prisma__CampusClient<runtime.Types.Result.GetResult<Prisma.$CampusPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface PersonFieldRefs {
    readonly id: Prisma.FieldRef<"Person", 'String'>;
    readonly nome: Prisma.FieldRef<"Person", 'String'>;
    readonly sexo: Prisma.FieldRef<"Person", 'String'>;
    readonly dataNascimento: Prisma.FieldRef<"Person", 'DateTime'>;
    readonly cpf: Prisma.FieldRef<"Person", 'String'>;
    readonly telefone: Prisma.FieldRef<"Person", 'String'>;
    readonly email: Prisma.FieldRef<"Person", 'String'>;
    readonly ativo: Prisma.FieldRef<"Person", 'Boolean'>;
    readonly dataDecisao: Prisma.FieldRef<"Person", 'DateTime'>;
    readonly dataBatismo: Prisma.FieldRef<"Person", 'DateTime'>;
    readonly dataMembresia: Prisma.FieldRef<"Person", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"Person", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Person", 'DateTime'>;
    readonly campusId: Prisma.FieldRef<"Person", 'String'>;
}
export type PersonFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonSelect<ExtArgs> | null;
    omit?: Prisma.PersonOmit<ExtArgs> | null;
    include?: Prisma.PersonInclude<ExtArgs> | null;
    where: Prisma.PersonWhereUniqueInput;
};
export type PersonFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonSelect<ExtArgs> | null;
    omit?: Prisma.PersonOmit<ExtArgs> | null;
    include?: Prisma.PersonInclude<ExtArgs> | null;
    where: Prisma.PersonWhereUniqueInput;
};
export type PersonFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonSelect<ExtArgs> | null;
    omit?: Prisma.PersonOmit<ExtArgs> | null;
    include?: Prisma.PersonInclude<ExtArgs> | null;
    where?: Prisma.PersonWhereInput;
    orderBy?: Prisma.PersonOrderByWithRelationInput | Prisma.PersonOrderByWithRelationInput[];
    cursor?: Prisma.PersonWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PersonScalarFieldEnum | Prisma.PersonScalarFieldEnum[];
};
export type PersonFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonSelect<ExtArgs> | null;
    omit?: Prisma.PersonOmit<ExtArgs> | null;
    include?: Prisma.PersonInclude<ExtArgs> | null;
    where?: Prisma.PersonWhereInput;
    orderBy?: Prisma.PersonOrderByWithRelationInput | Prisma.PersonOrderByWithRelationInput[];
    cursor?: Prisma.PersonWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PersonScalarFieldEnum | Prisma.PersonScalarFieldEnum[];
};
export type PersonFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonSelect<ExtArgs> | null;
    omit?: Prisma.PersonOmit<ExtArgs> | null;
    include?: Prisma.PersonInclude<ExtArgs> | null;
    where?: Prisma.PersonWhereInput;
    orderBy?: Prisma.PersonOrderByWithRelationInput | Prisma.PersonOrderByWithRelationInput[];
    cursor?: Prisma.PersonWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PersonScalarFieldEnum | Prisma.PersonScalarFieldEnum[];
};
export type PersonCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonSelect<ExtArgs> | null;
    omit?: Prisma.PersonOmit<ExtArgs> | null;
    include?: Prisma.PersonInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PersonCreateInput, Prisma.PersonUncheckedCreateInput>;
};
export type PersonCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.PersonCreateManyInput | Prisma.PersonCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PersonCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PersonOmit<ExtArgs> | null;
    data: Prisma.PersonCreateManyInput | Prisma.PersonCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.PersonIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type PersonUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonSelect<ExtArgs> | null;
    omit?: Prisma.PersonOmit<ExtArgs> | null;
    include?: Prisma.PersonInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PersonUpdateInput, Prisma.PersonUncheckedUpdateInput>;
    where: Prisma.PersonWhereUniqueInput;
};
export type PersonUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.PersonUpdateManyMutationInput, Prisma.PersonUncheckedUpdateManyInput>;
    where?: Prisma.PersonWhereInput;
    limit?: number;
};
export type PersonUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PersonOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PersonUpdateManyMutationInput, Prisma.PersonUncheckedUpdateManyInput>;
    where?: Prisma.PersonWhereInput;
    limit?: number;
    include?: Prisma.PersonIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type PersonUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonSelect<ExtArgs> | null;
    omit?: Prisma.PersonOmit<ExtArgs> | null;
    include?: Prisma.PersonInclude<ExtArgs> | null;
    where: Prisma.PersonWhereUniqueInput;
    create: Prisma.XOR<Prisma.PersonCreateInput, Prisma.PersonUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.PersonUpdateInput, Prisma.PersonUncheckedUpdateInput>;
};
export type PersonDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonSelect<ExtArgs> | null;
    omit?: Prisma.PersonOmit<ExtArgs> | null;
    include?: Prisma.PersonInclude<ExtArgs> | null;
    where: Prisma.PersonWhereUniqueInput;
};
export type PersonDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonWhereInput;
    limit?: number;
};
export type PersonDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonSelect<ExtArgs> | null;
    omit?: Prisma.PersonOmit<ExtArgs> | null;
    include?: Prisma.PersonInclude<ExtArgs> | null;
};
