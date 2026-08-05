import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type CampusModel = runtime.Types.Result.DefaultSelection<Prisma.$CampusPayload>;
export type AggregateCampus = {
    _count: CampusCountAggregateOutputType | null;
    _min: CampusMinAggregateOutputType | null;
    _max: CampusMaxAggregateOutputType | null;
};
export type CampusMinAggregateOutputType = {
    id: string | null;
    nome: string | null;
    cidade: string | null;
    estado: string | null;
    ativo: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type CampusMaxAggregateOutputType = {
    id: string | null;
    nome: string | null;
    cidade: string | null;
    estado: string | null;
    ativo: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type CampusCountAggregateOutputType = {
    id: number;
    nome: number;
    cidade: number;
    estado: number;
    ativo: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type CampusMinAggregateInputType = {
    id?: true;
    nome?: true;
    cidade?: true;
    estado?: true;
    ativo?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type CampusMaxAggregateInputType = {
    id?: true;
    nome?: true;
    cidade?: true;
    estado?: true;
    ativo?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type CampusCountAggregateInputType = {
    id?: true;
    nome?: true;
    cidade?: true;
    estado?: true;
    ativo?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type CampusAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CampusWhereInput;
    orderBy?: Prisma.CampusOrderByWithRelationInput | Prisma.CampusOrderByWithRelationInput[];
    cursor?: Prisma.CampusWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CampusCountAggregateInputType;
    _min?: CampusMinAggregateInputType;
    _max?: CampusMaxAggregateInputType;
};
export type GetCampusAggregateType<T extends CampusAggregateArgs> = {
    [P in keyof T & keyof AggregateCampus]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCampus[P]> : Prisma.GetScalarType<T[P], AggregateCampus[P]>;
};
export type CampusGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CampusWhereInput;
    orderBy?: Prisma.CampusOrderByWithAggregationInput | Prisma.CampusOrderByWithAggregationInput[];
    by: Prisma.CampusScalarFieldEnum[] | Prisma.CampusScalarFieldEnum;
    having?: Prisma.CampusScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CampusCountAggregateInputType | true;
    _min?: CampusMinAggregateInputType;
    _max?: CampusMaxAggregateInputType;
};
export type CampusGroupByOutputType = {
    id: string;
    nome: string;
    cidade: string;
    estado: string;
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: CampusCountAggregateOutputType | null;
    _min: CampusMinAggregateOutputType | null;
    _max: CampusMaxAggregateOutputType | null;
};
export type GetCampusGroupByPayload<T extends CampusGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CampusGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CampusGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CampusGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CampusGroupByOutputType[P]>;
}>>;
export type CampusWhereInput = {
    AND?: Prisma.CampusWhereInput | Prisma.CampusWhereInput[];
    OR?: Prisma.CampusWhereInput[];
    NOT?: Prisma.CampusWhereInput | Prisma.CampusWhereInput[];
    id?: Prisma.StringFilter<"Campus"> | string;
    nome?: Prisma.StringFilter<"Campus"> | string;
    cidade?: Prisma.StringFilter<"Campus"> | string;
    estado?: Prisma.StringFilter<"Campus"> | string;
    ativo?: Prisma.BoolFilter<"Campus"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"Campus"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Campus"> | Date | string;
    persons?: Prisma.PersonListRelationFilter;
};
export type CampusOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    cidade?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    ativo?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    persons?: Prisma.PersonOrderByRelationAggregateInput;
};
export type CampusWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.CampusWhereInput | Prisma.CampusWhereInput[];
    OR?: Prisma.CampusWhereInput[];
    NOT?: Prisma.CampusWhereInput | Prisma.CampusWhereInput[];
    nome?: Prisma.StringFilter<"Campus"> | string;
    cidade?: Prisma.StringFilter<"Campus"> | string;
    estado?: Prisma.StringFilter<"Campus"> | string;
    ativo?: Prisma.BoolFilter<"Campus"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"Campus"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Campus"> | Date | string;
    persons?: Prisma.PersonListRelationFilter;
}, "id">;
export type CampusOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    cidade?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    ativo?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.CampusCountOrderByAggregateInput;
    _max?: Prisma.CampusMaxOrderByAggregateInput;
    _min?: Prisma.CampusMinOrderByAggregateInput;
};
export type CampusScalarWhereWithAggregatesInput = {
    AND?: Prisma.CampusScalarWhereWithAggregatesInput | Prisma.CampusScalarWhereWithAggregatesInput[];
    OR?: Prisma.CampusScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CampusScalarWhereWithAggregatesInput | Prisma.CampusScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Campus"> | string;
    nome?: Prisma.StringWithAggregatesFilter<"Campus"> | string;
    cidade?: Prisma.StringWithAggregatesFilter<"Campus"> | string;
    estado?: Prisma.StringWithAggregatesFilter<"Campus"> | string;
    ativo?: Prisma.BoolWithAggregatesFilter<"Campus"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Campus"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Campus"> | Date | string;
};
export type CampusCreateInput = {
    id?: string;
    nome: string;
    cidade: string;
    estado: string;
    ativo?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    persons?: Prisma.PersonCreateNestedManyWithoutCampusInput;
};
export type CampusUncheckedCreateInput = {
    id?: string;
    nome: string;
    cidade: string;
    estado: string;
    ativo?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    persons?: Prisma.PersonUncheckedCreateNestedManyWithoutCampusInput;
};
export type CampusUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    cidade?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.StringFieldUpdateOperationsInput | string;
    ativo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    persons?: Prisma.PersonUpdateManyWithoutCampusNestedInput;
};
export type CampusUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    cidade?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.StringFieldUpdateOperationsInput | string;
    ativo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    persons?: Prisma.PersonUncheckedUpdateManyWithoutCampusNestedInput;
};
export type CampusCreateManyInput = {
    id?: string;
    nome: string;
    cidade: string;
    estado: string;
    ativo?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type CampusUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    cidade?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.StringFieldUpdateOperationsInput | string;
    ativo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CampusUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    cidade?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.StringFieldUpdateOperationsInput | string;
    ativo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CampusCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    cidade?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    ativo?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CampusMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    cidade?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    ativo?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CampusMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    cidade?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    ativo?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CampusScalarRelationFilter = {
    is?: Prisma.CampusWhereInput;
    isNot?: Prisma.CampusWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type CampusCreateNestedOneWithoutPersonsInput = {
    create?: Prisma.XOR<Prisma.CampusCreateWithoutPersonsInput, Prisma.CampusUncheckedCreateWithoutPersonsInput>;
    connectOrCreate?: Prisma.CampusCreateOrConnectWithoutPersonsInput;
    connect?: Prisma.CampusWhereUniqueInput;
};
export type CampusUpdateOneRequiredWithoutPersonsNestedInput = {
    create?: Prisma.XOR<Prisma.CampusCreateWithoutPersonsInput, Prisma.CampusUncheckedCreateWithoutPersonsInput>;
    connectOrCreate?: Prisma.CampusCreateOrConnectWithoutPersonsInput;
    upsert?: Prisma.CampusUpsertWithoutPersonsInput;
    connect?: Prisma.CampusWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CampusUpdateToOneWithWhereWithoutPersonsInput, Prisma.CampusUpdateWithoutPersonsInput>, Prisma.CampusUncheckedUpdateWithoutPersonsInput>;
};
export type CampusCreateWithoutPersonsInput = {
    id?: string;
    nome: string;
    cidade: string;
    estado: string;
    ativo?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type CampusUncheckedCreateWithoutPersonsInput = {
    id?: string;
    nome: string;
    cidade: string;
    estado: string;
    ativo?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type CampusCreateOrConnectWithoutPersonsInput = {
    where: Prisma.CampusWhereUniqueInput;
    create: Prisma.XOR<Prisma.CampusCreateWithoutPersonsInput, Prisma.CampusUncheckedCreateWithoutPersonsInput>;
};
export type CampusUpsertWithoutPersonsInput = {
    update: Prisma.XOR<Prisma.CampusUpdateWithoutPersonsInput, Prisma.CampusUncheckedUpdateWithoutPersonsInput>;
    create: Prisma.XOR<Prisma.CampusCreateWithoutPersonsInput, Prisma.CampusUncheckedCreateWithoutPersonsInput>;
    where?: Prisma.CampusWhereInput;
};
export type CampusUpdateToOneWithWhereWithoutPersonsInput = {
    where?: Prisma.CampusWhereInput;
    data: Prisma.XOR<Prisma.CampusUpdateWithoutPersonsInput, Prisma.CampusUncheckedUpdateWithoutPersonsInput>;
};
export type CampusUpdateWithoutPersonsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    cidade?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.StringFieldUpdateOperationsInput | string;
    ativo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CampusUncheckedUpdateWithoutPersonsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    cidade?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.StringFieldUpdateOperationsInput | string;
    ativo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CampusCountOutputType = {
    persons: number;
};
export type CampusCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    persons?: boolean | CampusCountOutputTypeCountPersonsArgs;
};
export type CampusCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CampusCountOutputTypeSelect<ExtArgs> | null;
};
export type CampusCountOutputTypeCountPersonsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonWhereInput;
};
export type CampusSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nome?: boolean;
    cidade?: boolean;
    estado?: boolean;
    ativo?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    persons?: boolean | Prisma.Campus$personsArgs<ExtArgs>;
    _count?: boolean | Prisma.CampusCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["campus"]>;
export type CampusSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nome?: boolean;
    cidade?: boolean;
    estado?: boolean;
    ativo?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["campus"]>;
export type CampusSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nome?: boolean;
    cidade?: boolean;
    estado?: boolean;
    ativo?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["campus"]>;
export type CampusSelectScalar = {
    id?: boolean;
    nome?: boolean;
    cidade?: boolean;
    estado?: boolean;
    ativo?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type CampusOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "nome" | "cidade" | "estado" | "ativo" | "createdAt" | "updatedAt", ExtArgs["result"]["campus"]>;
export type CampusInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    persons?: boolean | Prisma.Campus$personsArgs<ExtArgs>;
    _count?: boolean | Prisma.CampusCountOutputTypeDefaultArgs<ExtArgs>;
};
export type CampusIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type CampusIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $CampusPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Campus";
    objects: {
        persons: Prisma.$PersonPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        nome: string;
        cidade: string;
        estado: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["campus"]>;
    composites: {};
};
export type CampusGetPayload<S extends boolean | null | undefined | CampusDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CampusPayload, S>;
export type CampusCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CampusFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CampusCountAggregateInputType | true;
};
export interface CampusDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Campus'];
        meta: {
            name: 'Campus';
        };
    };
    findUnique<T extends CampusFindUniqueArgs>(args: Prisma.SelectSubset<T, CampusFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CampusClient<runtime.Types.Result.GetResult<Prisma.$CampusPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CampusFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CampusFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CampusClient<runtime.Types.Result.GetResult<Prisma.$CampusPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CampusFindFirstArgs>(args?: Prisma.SelectSubset<T, CampusFindFirstArgs<ExtArgs>>): Prisma.Prisma__CampusClient<runtime.Types.Result.GetResult<Prisma.$CampusPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CampusFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CampusFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CampusClient<runtime.Types.Result.GetResult<Prisma.$CampusPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CampusFindManyArgs>(args?: Prisma.SelectSubset<T, CampusFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CampusPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CampusCreateArgs>(args: Prisma.SelectSubset<T, CampusCreateArgs<ExtArgs>>): Prisma.Prisma__CampusClient<runtime.Types.Result.GetResult<Prisma.$CampusPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CampusCreateManyArgs>(args?: Prisma.SelectSubset<T, CampusCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends CampusCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CampusCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CampusPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends CampusDeleteArgs>(args: Prisma.SelectSubset<T, CampusDeleteArgs<ExtArgs>>): Prisma.Prisma__CampusClient<runtime.Types.Result.GetResult<Prisma.$CampusPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CampusUpdateArgs>(args: Prisma.SelectSubset<T, CampusUpdateArgs<ExtArgs>>): Prisma.Prisma__CampusClient<runtime.Types.Result.GetResult<Prisma.$CampusPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CampusDeleteManyArgs>(args?: Prisma.SelectSubset<T, CampusDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CampusUpdateManyArgs>(args: Prisma.SelectSubset<T, CampusUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends CampusUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CampusUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CampusPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends CampusUpsertArgs>(args: Prisma.SelectSubset<T, CampusUpsertArgs<ExtArgs>>): Prisma.Prisma__CampusClient<runtime.Types.Result.GetResult<Prisma.$CampusPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CampusCountArgs>(args?: Prisma.Subset<T, CampusCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CampusCountAggregateOutputType> : number>;
    aggregate<T extends CampusAggregateArgs>(args: Prisma.Subset<T, CampusAggregateArgs>): Prisma.PrismaPromise<GetCampusAggregateType<T>>;
    groupBy<T extends CampusGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CampusGroupByArgs['orderBy'];
    } : {
        orderBy?: CampusGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CampusGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCampusGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CampusFieldRefs;
}
export interface Prisma__CampusClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    persons<T extends Prisma.Campus$personsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Campus$personsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CampusFieldRefs {
    readonly id: Prisma.FieldRef<"Campus", 'String'>;
    readonly nome: Prisma.FieldRef<"Campus", 'String'>;
    readonly cidade: Prisma.FieldRef<"Campus", 'String'>;
    readonly estado: Prisma.FieldRef<"Campus", 'String'>;
    readonly ativo: Prisma.FieldRef<"Campus", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"Campus", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Campus", 'DateTime'>;
}
export type CampusFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CampusSelect<ExtArgs> | null;
    omit?: Prisma.CampusOmit<ExtArgs> | null;
    include?: Prisma.CampusInclude<ExtArgs> | null;
    where: Prisma.CampusWhereUniqueInput;
};
export type CampusFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CampusSelect<ExtArgs> | null;
    omit?: Prisma.CampusOmit<ExtArgs> | null;
    include?: Prisma.CampusInclude<ExtArgs> | null;
    where: Prisma.CampusWhereUniqueInput;
};
export type CampusFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CampusSelect<ExtArgs> | null;
    omit?: Prisma.CampusOmit<ExtArgs> | null;
    include?: Prisma.CampusInclude<ExtArgs> | null;
    where?: Prisma.CampusWhereInput;
    orderBy?: Prisma.CampusOrderByWithRelationInput | Prisma.CampusOrderByWithRelationInput[];
    cursor?: Prisma.CampusWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CampusScalarFieldEnum | Prisma.CampusScalarFieldEnum[];
};
export type CampusFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CampusSelect<ExtArgs> | null;
    omit?: Prisma.CampusOmit<ExtArgs> | null;
    include?: Prisma.CampusInclude<ExtArgs> | null;
    where?: Prisma.CampusWhereInput;
    orderBy?: Prisma.CampusOrderByWithRelationInput | Prisma.CampusOrderByWithRelationInput[];
    cursor?: Prisma.CampusWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CampusScalarFieldEnum | Prisma.CampusScalarFieldEnum[];
};
export type CampusFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CampusSelect<ExtArgs> | null;
    omit?: Prisma.CampusOmit<ExtArgs> | null;
    include?: Prisma.CampusInclude<ExtArgs> | null;
    where?: Prisma.CampusWhereInput;
    orderBy?: Prisma.CampusOrderByWithRelationInput | Prisma.CampusOrderByWithRelationInput[];
    cursor?: Prisma.CampusWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CampusScalarFieldEnum | Prisma.CampusScalarFieldEnum[];
};
export type CampusCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CampusSelect<ExtArgs> | null;
    omit?: Prisma.CampusOmit<ExtArgs> | null;
    include?: Prisma.CampusInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CampusCreateInput, Prisma.CampusUncheckedCreateInput>;
};
export type CampusCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CampusCreateManyInput | Prisma.CampusCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CampusCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CampusSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CampusOmit<ExtArgs> | null;
    data: Prisma.CampusCreateManyInput | Prisma.CampusCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CampusUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CampusSelect<ExtArgs> | null;
    omit?: Prisma.CampusOmit<ExtArgs> | null;
    include?: Prisma.CampusInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CampusUpdateInput, Prisma.CampusUncheckedUpdateInput>;
    where: Prisma.CampusWhereUniqueInput;
};
export type CampusUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CampusUpdateManyMutationInput, Prisma.CampusUncheckedUpdateManyInput>;
    where?: Prisma.CampusWhereInput;
    limit?: number;
};
export type CampusUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CampusSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CampusOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CampusUpdateManyMutationInput, Prisma.CampusUncheckedUpdateManyInput>;
    where?: Prisma.CampusWhereInput;
    limit?: number;
};
export type CampusUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CampusSelect<ExtArgs> | null;
    omit?: Prisma.CampusOmit<ExtArgs> | null;
    include?: Prisma.CampusInclude<ExtArgs> | null;
    where: Prisma.CampusWhereUniqueInput;
    create: Prisma.XOR<Prisma.CampusCreateInput, Prisma.CampusUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CampusUpdateInput, Prisma.CampusUncheckedUpdateInput>;
};
export type CampusDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CampusSelect<ExtArgs> | null;
    omit?: Prisma.CampusOmit<ExtArgs> | null;
    include?: Prisma.CampusInclude<ExtArgs> | null;
    where: Prisma.CampusWhereUniqueInput;
};
export type CampusDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CampusWhereInput;
    limit?: number;
};
export type Campus$personsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type CampusDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CampusSelect<ExtArgs> | null;
    omit?: Prisma.CampusOmit<ExtArgs> | null;
    include?: Prisma.CampusInclude<ExtArgs> | null;
};
