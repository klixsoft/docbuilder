export interface OpenAPIViewerProps {
    source: string;
    authentication?: ProtectionGateProps
    company: string | React.ReactNode;
    theme: 'light' | 'dark' | 'system';
}

interface AuthField {
    type: string;
    label: string;
    placeholder: string;
}

export interface ProtectionGateProps {
    fields: AuthField[];
    onAuthenticated?: () => void;
}

export interface OpenAPISpec {
    openapi: string;
    info: InfoObject;
    servers?: Server[];
    paths: PathsObject;
    components?: ComponentsObject;
    security?: SecurityRequirement[];
    tags?: TagObject[];
}

export interface InfoObject {
    title: string;
    description?: string;
    version: string;
    contact?: ContactObject;
    license?: LicenseObject;
}

export interface ContactObject {
    name?: string;
    url?: string;
    email?: string;
}

export interface LicenseObject {
    name: string;
    url?: string;
}

export interface Server {
    url: string;
    description?: string;
    variables?: Record<string, ServerVariableObject>;
}

export interface ServerVariableObject {
    enum?: string[];
    default: string;
    description?: string;
}

export interface PathsObject {
    [path: string]: PathItemObject;
}

export interface PathItemObject {
    summary?: string;
    description?: string;
    get?: OperationObject;
    put?: OperationObject;
    post?: OperationObject;
    delete?: OperationObject;
    options?: OperationObject;
    head?: OperationObject;
    patch?: OperationObject;
    trace?: OperationObject;
    servers?: Server[];
    parameters?: (ParameterObject | ReferenceObject)[];
}

export interface OperationObject {
    tags?: string[];
    summary?: string;
    description?: string;
    operationId?: string;
    parameters?: (ParameterObject | ReferenceObject)[];
    requestBody?: RequestBodyObject | ReferenceObject;
    responses: ResponsesObject;
    deprecated?: boolean;
    security?: SecurityRequirement[];
    servers?: Server[];
}

export interface ParameterObject {
    name: string;
    in: 'query' | 'header' | 'path' | 'cookie';
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    schema?: SchemaObject | ReferenceObject;
    example?: unknown;
    examples?: Record<string, ExampleObject | ReferenceObject>;
}

export interface RequestBodyObject {
    description?: string;
    content: Record<string, MediaTypeObject>;
    required?: boolean;
}

export interface MediaTypeObject {
    schema?: SchemaObject | ReferenceObject;
    example?: unknown;
    examples?: Record<string, ExampleObject | ReferenceObject>;
    encoding?: Record<string, EncodingObject>;
}

export interface EncodingObject {
    contentType?: string;
    headers?: Record<string, HeaderObject | ReferenceObject>;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
}

export interface ResponsesObject {
    [statusCode: string]: ResponseObject | ReferenceObject;
}

export interface ResponseObject {
    description: string;
    headers?: Record<string, HeaderObject | ReferenceObject>;
    content?: Record<string, MediaTypeObject>;
    links?: Record<string, LinkObject | ReferenceObject>;
}

export interface HeaderObject extends Omit<ParameterObject, 'in' | 'name'> { }

export interface LinkObject {
    operationRef?: string;
    operationId?: string;
    parameters?: Record<string, unknown>;
    requestBody?: unknown;
    description?: string;
    server?: Server;
}

export interface ComponentsObject {
    schemas?: Record<string, SchemaObject | ReferenceObject>;
    responses?: Record<string, ResponseObject | ReferenceObject>;
    parameters?: Record<string, ParameterObject | ReferenceObject>;
    examples?: Record<string, ExampleObject | ReferenceObject>;
    requestBodies?: Record<string, RequestBodyObject | ReferenceObject>;
    headers?: Record<string, HeaderObject | ReferenceObject>;
    securitySchemes?: Record<string, SecuritySchemeObject>;
    links?: Record<string, LinkObject | ReferenceObject>;
    callbacks?: Record<string, CallbackObject | ReferenceObject>;
}

export interface SchemaObject {
    type?: string;
    format?: string;
    title?: string;
    description?: string;
    default?: unknown;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    enum?: string[];
    properties?: Record<string, SchemaObject | ReferenceObject>;
    additionalProperties?: boolean | SchemaObject | ReferenceObject;
    items?: SchemaObject | ReferenceObject;
    allOf?: (SchemaObject | ReferenceObject)[];
    oneOf?: (SchemaObject | ReferenceObject)[];
    anyOf?: (SchemaObject | ReferenceObject)[];
    not?: SchemaObject | ReferenceObject;
    nullable?: boolean;
    discriminator?: DiscriminatorObject;
    readOnly?: boolean;
    writeOnly?: boolean;
    xml?: XMLObject;
    externalDocs?: ExternalDocumentationObject;
    example?: unknown;
    deprecated?: boolean;
}

export interface DiscriminatorObject {
    propertyName: string;
    mapping?: Record<string, string>;
}

export interface XMLObject {
    name?: string;
    namespace?: string;
    prefix?: string;
    attribute?: boolean;
    wrapped?: boolean;
}

export interface ExternalDocumentationObject {
    description?: string;
    url: string;
}

export interface ReferenceObject {
    $ref: string;
}

export interface ExampleObject {
    summary?: string;
    description?: string;
    value?: unknown;
    externalValue?: string;
}

export interface SecuritySchemeObject {
    type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
    description?: string;
    name?: string;
    in?: 'query' | 'header' | 'cookie';
    scheme?: string;
    bearerFormat?: string;
    flows?: OAuthFlowsObject;
    openIdConnectUrl?: string;
}

export interface OAuthFlowsObject {
    implicit?: OAuthFlowObject;
    password?: OAuthFlowObject;
    clientCredentials?: OAuthFlowObject;
    authorizationCode?: OAuthFlowObject;
}

export interface OAuthFlowObject {
    authorizationUrl?: string;
    tokenUrl?: string;
    refreshUrl?: string;
    scopes: Record<string, string>;
}

export interface SecurityRequirement {
    [name: string]: string[];
}

export interface TagObject {
    name: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
}

export interface CallbackObject {
    [expression: string]: PathItemObject;
}

export interface EndpointGroup {
    tag: string;
    description?: string;
    endpoints: EndpointItem[];
}

export interface EndpointItem {
    path: string;
    method: HttpMethod;
    operation: OperationObject;
    summary?: string;
}

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head' | 'trace';

export interface APIRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: unknown;
}

export interface APIResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: unknown;
    time: number;
    size: number;
}

export interface AuthCredentials {
    type: 'apiKey' | 'bearer';
    value: string;
    name?: string;
    in?: 'header' | 'query';
}

export interface ThemeConfig {
    primaryColor: string;
}

export interface ParsedParameter extends ParameterObject {
    value?: unknown;
}

export interface ParsedRequestBody {
    content: Record<string, MediaTypeObject>;
    required?: boolean;
    value?: unknown;
}

export interface ServerObject {
    url: string;
    description?: string;
}