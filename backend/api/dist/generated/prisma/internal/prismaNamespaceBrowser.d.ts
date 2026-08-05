import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models';
export type * from './prismaNamespace';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly Campus: "Campus";
    readonly Person: "Person";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const CampusScalarFieldEnum: {
    readonly id: "id";
    readonly nome: "nome";
    readonly cidade: "cidade";
    readonly estado: "estado";
    readonly ativo: "ativo";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type CampusScalarFieldEnum = (typeof CampusScalarFieldEnum)[keyof typeof CampusScalarFieldEnum];
export declare const PersonScalarFieldEnum: {
    readonly id: "id";
    readonly nome: "nome";
    readonly sexo: "sexo";
    readonly dataNascimento: "dataNascimento";
    readonly cpf: "cpf";
    readonly telefone: "telefone";
    readonly email: "email";
    readonly ativo: "ativo";
    readonly dataDecisao: "dataDecisao";
    readonly dataBatismo: "dataBatismo";
    readonly dataMembresia: "dataMembresia";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly campusId: "campusId";
};
export type PersonScalarFieldEnum = (typeof PersonScalarFieldEnum)[keyof typeof PersonScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
