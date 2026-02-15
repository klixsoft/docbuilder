export interface ServiceConfig {
    id: string;
    name: string;
    schemaUrl: string;
    description?: string;
}

export const services: ServiceConfig[] = [

];

export const getServiceById = (id: string) => services.find(s => s.id === id);
