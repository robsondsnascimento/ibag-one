import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
export declare class PersonController {
    private readonly personService;
    constructor(personService: PersonService);
    create(createPersonDto: CreatePersonDto): Promise<{
        nome: string;
        sexo: string | null;
        dataNascimento: Date | null;
        cpf: string | null;
        telefone: string | null;
        email: string | null;
        dataDecisao: Date | null;
        dataBatismo: Date | null;
        dataMembresia: Date | null;
        campusId: string;
        ativo: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        campus: {
            nome: string;
            ativo: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            cidade: string;
            estado: string;
        };
    } & {
        nome: string;
        sexo: string | null;
        dataNascimento: Date | null;
        cpf: string | null;
        telefone: string | null;
        email: string | null;
        dataDecisao: Date | null;
        dataBatismo: Date | null;
        dataMembresia: Date | null;
        campusId: string;
        ativo: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<({
        campus: {
            nome: string;
            ativo: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            cidade: string;
            estado: string;
        };
    } & {
        nome: string;
        sexo: string | null;
        dataNascimento: Date | null;
        cpf: string | null;
        telefone: string | null;
        email: string | null;
        dataDecisao: Date | null;
        dataBatismo: Date | null;
        dataMembresia: Date | null;
        campusId: string;
        ativo: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    update(id: string, updatePersonDto: UpdatePersonDto): Promise<{
        nome: string;
        sexo: string | null;
        dataNascimento: Date | null;
        cpf: string | null;
        telefone: string | null;
        email: string | null;
        dataDecisao: Date | null;
        dataBatismo: Date | null;
        dataMembresia: Date | null;
        campusId: string;
        ativo: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        nome: string;
        sexo: string | null;
        dataNascimento: Date | null;
        cpf: string | null;
        telefone: string | null;
        email: string | null;
        dataDecisao: Date | null;
        dataBatismo: Date | null;
        dataMembresia: Date | null;
        campusId: string;
        ativo: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
