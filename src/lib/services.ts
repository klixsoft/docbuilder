export interface ServiceConfig {
    id: string;
    name: string;
    schemaUrl: string;
    description?: string;
}

export const services: ServiceConfig[] = [
    {
        id: 'default',
        name: 'Main API',
        schemaUrl: 'api.yaml',
        description: 'The primary API documentation',
    },
    {
        id: 'dummy',
        name: 'Dummy API',
        schemaUrl: 'dummy.yaml',
        description: 'A test API to verify multiple schema support',
    },
];

export const getServiceById = (id: string) => services.find(s => s.id === id);
