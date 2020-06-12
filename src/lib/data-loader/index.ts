import { getRepository } from 'typeorm';
import { Service } from './../../entity/manager/Service';
import MysqlLoader from "./MysqlLoader"
import DefaultLoader from "./DefaultLoader"
import { DbType } from "../../entity/manager/Meta";

export async function createLoader(service: Service): Promise<DefaultLoader> {
    let instance: DefaultLoader;

    if (service.meta == undefined || service.meta.columns == undefined || service.application == undefined) {
        const serviceRepo = getRepository(Service);

        service = await serviceRepo.findOne({
            relations: ["meta", "meta.columns", "application"],
            where: { id: service.id }
        });
    }
    instance = createLoaderExceptService(service.meta.dbType, service);

    return instance;
}

export function createLoaderExceptService(dbms: string, service: Service): DefaultLoader {
    let instance: DefaultLoader;

    switch (dbms) {
        case DbType.MYSQL: {
            instance = new MysqlLoader(service);
        }
    }

    return instance;
}