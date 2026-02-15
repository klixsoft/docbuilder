import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Play, Loader, Copy, Plus, Trash2, Upload } from 'lucide-react';
import { CopyButton } from "@/components/ui/CopyButton";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import type { ServerObject, AuthCredentials, APIResponse, ParameterObject, SchemaObject } from './types';

SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('typescript', typescript);

interface FormDataField {
    key: string;
    type: 'text' | 'file';
    value: string;
    required?: boolean;
    file?: File;
}

interface CodeExecutionProps {
    servers: ServerObject[];
    method: string;
    path: string;
    paramValues: Record<string, unknown>;
    setParamValues: (values: Record<string, unknown>) => void;
    requestBody: string;
    setRequestBody: (body: string) => void;
    credentials: AuthCredentials | null;
    setCredentials: (creds: AuthCredentials | null) => void;
    hasRequestBody: boolean;
    handleExecute: () => Promise<void>;
    isExecuting: boolean;
    response: APIResponse | null;
    error: string | null;
    requiredSecurity: string[];
    parameters: ParameterObject[]
}

const CodeExecution: React.FC<CodeExecutionProps> = ({
    servers,
    method,
    path,
    paramValues,
    setParamValues,
    requestBody,
    setRequestBody,
    credentials,
    setCredentials,
    hasRequestBody,
    handleExecute,
    isExecuting,
    response,
    error,
    requiredSecurity,
    parameters
}) => {
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [mainTab, setMainTab] = useState<string>('execute');
    const [bodyTab, setBodyTab] = useState<string>('json');
    const [selectedServer, setSelectedServer] = useState<number>(0);
    const [selectedCodeLang, setSelectedCodeLang] = useState<string>('curl');
    const [formData, setFormData] = useState<FormDataField[]>([{ key: '', type: 'text', value: '' }]);

    const pathParams = parameters.filter(p => p.in === 'path');
    const queryParams = parameters.filter(p => p.in === 'query');
    const headerParams = parameters.filter(p => p.in === 'header');

    const syntaxTheme = useMemo(() => {
        return theme === 'dark' ? atomOneDark : atomOneLight;
    }, [theme]);

    const resetState = useCallback(() => {
        setMainTab('execute');
        setBodyTab('json');
        setSelectedServer(0);
        setSelectedCodeLang('curl');

        if (hasRequestBody && requestBody) {
            try {
                const parsed = JSON.parse(requestBody);
                const fields: FormDataField[] = Object.keys(parsed).map(key => ({
                    key,
                    type: 'text' as const,
                    value: typeof parsed[key] === 'object' ? JSON.stringify(parsed[key]) : String(parsed[key]),
                    required: false
                }));
                setFormData(fields.length > 0 ? fields : [{ key: '', type: 'text', value: '' }]);
            } catch {
                setFormData([{ key: '', type: 'text', value: '' }]);
            }
        } else {
            setFormData([{ key: '', type: 'text', value: '' }]);
        }
    }, [hasRequestBody, requestBody]);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                resetState();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen, resetState]);

    const addFormField = useCallback(() => {
        setFormData(prev => [...prev, { key: '', type: 'text', value: '' }]);
    }, []);

    const removeFormField = useCallback((index: number) => {
        setFormData(prev => prev.filter((_, i) => i !== index));
    }, []);

    const updateFormField = useCallback((index: number, field: keyof FormDataField, value: string | 'text' | 'file') => {
        setFormData(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    }, []);

    const handleFileChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => {
                const updated = [...prev];
                updated[index] = { ...updated[index], value: file.name, file };
                return updated;
            });
        }
    }, []);

    const processedPath = useMemo(() => {
        return path.replace(/\{([^}]+)\}/g, (match: string, param: string) => {
            const value = paramValues[param];
            return value !== undefined && value !== null ? String(value) : match;
        });
    }, [path, paramValues]);

    const fullUrl = useMemo(() => {
        let url = `${servers[selectedServer]?.url || ''}${processedPath}`;

        const queryParamsList = queryParams
            .filter(p => paramValues[p.name])
            .map(p => {
                const value = paramValues[p.name];
                return `${encodeURIComponent(p.name)}=${encodeURIComponent(String(value))}`;
            });

        if (queryParamsList.length > 0) {
            url += `?${queryParamsList.join('&')}`;
        }

        return url;
    }, [servers, selectedServer, processedPath, queryParams, paramValues]);

    const generateCurl = useCallback((): string => {
        let cmd = `curl -X ${method.toUpperCase()} "${fullUrl}"`;

        // Add header parameters
        headerParams.forEach(param => {
            if (paramValues[param.name]) {
                cmd += ` \\\n  -H "${param.name}: ${paramValues[param.name]}"`;
            }
        });

        if (credentials?.type === 'bearer') {
            cmd += ` \\\n  -H "Authorization: Bearer ${credentials.value}"`;
        } else if (credentials?.type === 'apiKey' && credentials.name) {
            cmd += ` \\\n  -H "${credentials.name}: ${credentials.value}"`;
        }

        if (bodyTab === 'formdata') {
            formData.forEach(field => {
                if (field.key) {
                    if (field.type === 'file' && field.file) {
                        cmd += ` \\\n  -F "${field.key}=@${field.value}"`;
                    } else {
                        cmd += ` \\\n  -F "${field.key}=${field.value}"`;
                    }
                }
            });
        } else {
            cmd += ` \\\n  -H "Content-Type: application/json"`;
            if (requestBody && method.toLowerCase() !== 'get') {
                cmd += ` \\\n  -d '${requestBody}'`;
            }
        }

        return cmd;
    }, [method, fullUrl, credentials, bodyTab, formData, requestBody, headerParams, paramValues]);

    const generatePython = useCallback((): string => {
        let code = `import requests\n\nurl = "${fullUrl}"\n\n`;
        code += `headers = {\n  "Content-Type": "application/json"`;

        // Add header parameters
        headerParams.forEach(param => {
            if (paramValues[param.name]) {
                code += `,\n  "${param.name}": "${paramValues[param.name]}"`;
            }
        });

        if (credentials?.type === 'bearer') {
            code += `,\n  "Authorization": "Bearer ${credentials.value}"`;
        } else if (credentials?.type === 'apiKey' && credentials.name) {
            code += `,\n  "${credentials.name}": "${credentials.value}"`;
        }

        code += `\n}\n\n`;

        if (bodyTab === 'formdata') {
            code += `files = {\n`;
            formData.forEach((field, i) => {
                if (field.key) {
                    code += `  "${field.key}": `;
                    if (field.type === 'file') {
                        code += `open("${field.value}", "rb")`;
                    } else {
                        code += `"${field.value}"`;
                    }
                    code += i < formData.length - 1 ? ',\n' : '\n';
                }
            });
            code += `}\n\n`;
            code += `response = requests.${method.toLowerCase()}(url, headers=headers, files=files)\n\n`;
        } else if (requestBody && method.toLowerCase() !== 'get') {
            code += `payload = ${requestBody}\n\n`;
            code += `response = requests.${method.toLowerCase()}(url, headers=headers, json=payload)\n\n`;
        } else {
            code += `response = requests.${method.toLowerCase()}(url, headers=headers)\n\n`;
        }

        code += `print(response.json())`;
        return code;
    }, [fullUrl, credentials, bodyTab, formData, requestBody, method, headerParams, paramValues]);

    const generateJavaScript = useCallback((): string => {
        let code = `const url = "${fullUrl}";\n\n`;

        if (bodyTab === 'formdata') {
            code += `const formData = new FormData();\n`;
            formData.forEach(field => {
                if (field.key) {
                    code += `formData.append("${field.key}", `;
                    code += field.type === 'file' ? `fileInput.files[0]` : `"${field.value}"`;
                    code += `);\n`;
                }
            });
            code += `\n`;
        }

        code += `const options = {\n  method: "${method.toUpperCase()}",\n  headers: {\n`;

        if (bodyTab !== 'formdata') {
            code += `    "Content-Type": "application/json"`;
        }

        // Add header parameters
        let hasHeaders = bodyTab !== 'formdata';
        headerParams.forEach(param => {
            if (paramValues[param.name]) {
                code += hasHeaders ? `,\n` : ``;
                code += `    "${param.name}": "${paramValues[param.name]}"`;
                hasHeaders = true;
            }
        });

        if (credentials?.type === 'bearer') {
            code += hasHeaders ? `,\n` : ``;
            code += `    "Authorization": "Bearer ${credentials.value}"`;
            hasHeaders = true;
        } else if (credentials?.type === 'apiKey' && credentials.name) {
            code += hasHeaders ? `,\n` : ``;
            code += `    "${credentials.name}": "${credentials.value}"`;
            hasHeaders = true;
        }

        code += `\n  }`;

        if (bodyTab === 'formdata') {
            code += `,\n  body: formData`;
        } else if (requestBody && method.toLowerCase() !== 'get') {
            code += `,\n  body: JSON.stringify(${requestBody})`;
        }

        code += `\n};\n\n`;
        code += `fetch(url, options)\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));`;
        return code;
    }, [fullUrl, bodyTab, formData, method, credentials, requestBody, headerParams, paramValues]);

    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
    }, []);

    const getRequestHeaders = useCallback((): Record<string, string> => {
        const headers: Record<string, string> = {};

        if (bodyTab !== 'formdata') {
            headers["Content-Type"] = "application/json";
        }

        headerParams.forEach(param => {
            const value = paramValues[param.name];
            if (value !== undefined && value !== null) {
                headers[param.name] = String(value);
            }
        });

        if (credentials?.type === 'bearer') {
            headers["Authorization"] = `Bearer ${credentials.value}`;
        } else if (credentials?.type === 'apiKey' && credentials.name) {
            headers[credentials.name] = credentials.value;
        }

        return headers;
    }, [credentials, bodyTab, headerParams, paramValues]);

    const handleExecuteRequest = useCallback(async () => {
        if (bodyTab === 'formdata') {
            const bodyObj: Record<string, unknown> = {};
            formData.forEach(field => {
                if (field.key) {
                    try {
                        bodyObj[field.key] = field.type === 'text' && field.value.startsWith('{')
                            ? JSON.parse(field.value)
                            : field.value;
                    } catch {
                        bodyObj[field.key] = field.value;
                    }
                }
            });
            setRequestBody(JSON.stringify(bodyObj, null, 2));

            await new Promise(resolve => setTimeout(resolve, 0));
        }

        await handleExecute();
    }, [bodyTab, formData, setRequestBody, handleExecute]);

    const renderParamInput = (param: ParameterObject, paramGroup: 'query' | 'path' | 'header') => {
        const schema = param.schema as SchemaObject | undefined;
        const enumValues = Array.isArray(schema?.enum) ? schema.enum : undefined;

        return (
            <div key={`${paramGroup}-${param.name}`}>
                <Label htmlFor={`${paramGroup}-${param.name}`} className="text-sm">
                    {param.name}
                    {param.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {param.description && (
                    <p className="text-xs text-muted-foreground mt-1">{param.description}</p>
                )}
                {enumValues ? (
                    <Select
                        value={String(paramValues[param.name] || '')}
                        onValueChange={(val) => setParamValues({ ...paramValues, [param.name]: val })}
                    >
                        <SelectTrigger id={`${paramGroup}-${param.name}`} className="mt-1 w-full">
                            <SelectValue placeholder={`Select ${param.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {enumValues.map((val, i) => (
                                <SelectItem key={i} value={String(val)}>
                                    {String(val)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                        id={`${paramGroup}-${param.name}`}
                        value={String(paramValues[param.name] || '')}
                        onChange={(e) => setParamValues({ ...paramValues, [param.name]: e.target.value })}
                        placeholder={param.example ? String(param.example) : `Enter ${param.name}`}
                        className="mt-1"
                    />
                )}
            </div>
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button>Try It Out</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                <div className="space-y-6 p-6">
                    <Tabs value={mainTab} onValueChange={setMainTab}>
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="execute">Code Execute</TabsTrigger>
                            <TabsTrigger value="sample">Code Sample</TabsTrigger>
                        </TabsList>

                        <TabsContent value="execute" className="space-y-4">
                            <div>
                                <Label htmlFor="server" className='mb-1'>Server</Label>
                                <Select value={String(selectedServer)} onValueChange={(val) => setSelectedServer(Number(val))}>
                                    <SelectTrigger id="server" className='w-full'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {servers.map((server, index) => (
                                            <SelectItem key={index} value={String(index)}>
                                                {server.description || server.url}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {pathParams.length > 0 && (
                                <div>
                                    <Label className="mb-1">Path Parameters</Label>
                                    <div className="border rounded-lg p-3 space-y-3 mt-2">
                                        {pathParams.map(p => renderParamInput(p, 'path'))}
                                    </div>
                                </div>
                            )}

                            {queryParams.length > 0 && (
                                <div>
                                    <Label className="mb-1">Query Parameters</Label>
                                    <div className="border rounded-lg p-3 space-y-3 mt-2">
                                        {queryParams.map(p => renderParamInput(p, 'query'))}
                                    </div>
                                </div>
                            )}

                            {headerParams.length > 0 && (
                                <div>
                                    <Label className="mb-1">Headers</Label>
                                    <div className="border rounded-lg p-3 space-y-3 mt-2">
                                        {headerParams.map(p => renderParamInput(p, 'header'))}
                                    </div>
                                </div>
                            )}

                            {hasRequestBody && (
                                <div>
                                    <Label className='mb-1'>Request Body</Label>
                                    <Tabs value={bodyTab} onValueChange={setBodyTab} className="mt-2">
                                        <TabsList>
                                            <TabsTrigger value="json">JSON</TabsTrigger>
                                            <TabsTrigger value="formdata">Form Data</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="json">
                                            <Textarea
                                                value={requestBody}
                                                onChange={(e) => setRequestBody(e.target.value)}
                                                rows={8}
                                                className="font-mono text-xs"
                                            />
                                        </TabsContent>

                                        <TabsContent value="formdata">
                                            <div className="border rounded-lg">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead className="border-b">
                                                            <tr>
                                                                <th className="text-left p-2 font-medium text-sm w-[35%]">Key</th>
                                                                <th className="text-left p-2 font-medium text-sm w-[25%]">Type</th>
                                                                <th className="text-left p-2 font-medium text-sm w-[30%]">Value</th>
                                                                <th className="w-[10%]"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {formData.map((field, index) => (
                                                                <tr key={index} className="border-b last:border-0">
                                                                    <td className="p-2">
                                                                        <Input
                                                                            value={field.key}
                                                                            onChange={(e) => updateFormField(index, 'key', e.target.value)}
                                                                            placeholder="Key"
                                                                            className="h-8"
                                                                            readOnly={field.required}
                                                                            disabled={field.required}
                                                                        />
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <Select
                                                                            value={field.type}
                                                                            onValueChange={(val) => updateFormField(index, 'type', val as 'text' | 'file')}
                                                                        >
                                                                            <SelectTrigger className="h-8 w-full">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="text">Text</SelectItem>
                                                                                <SelectItem value="file">File</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </td>
                                                                    <td className="p-2">
                                                                        {field.type === 'text' ? (
                                                                            <Input
                                                                                value={field.value}
                                                                                onChange={(e) => updateFormField(index, 'value', e.target.value)}
                                                                                placeholder="Value"
                                                                                className="h-8"
                                                                            />
                                                                        ) : (
                                                                            <div className="relative">
                                                                                <Input
                                                                                    type="file"
                                                                                    onChange={(e) => handleFileChange(index, e)}
                                                                                    className="absolute inset-0 opacity-0 cursor-pointer h-8"
                                                                                />
                                                                                <div className="h-8 px-3 py-1 border border-input rounded-md bg-background flex items-center gap-2 text-sm">
                                                                                    <Upload className="w-3 h-3" />
                                                                                    <span className="truncate">{field.value || 'Choose file'}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => removeFormField(index)}
                                                                            className="h-8 w-8"
                                                                            disabled={field.required && formData.filter(f => f.required).length === formData.length}
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="p-2 border-t">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={addFormField}
                                                        className="w-full"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Field
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            )}

                            {requiredSecurity.length > 0 && (
                                <div>
                                    <Label htmlFor="auth" className='mb-1'>Authorization</Label>
                                    <Input
                                        id="auth"
                                        type="text"
                                        value={credentials?.value || ''}
                                        onChange={(e) => setCredentials({ type: 'bearer', value: e.target.value })}
                                        placeholder="Bearer token or API key"
                                    />
                                </div>
                            )}

                            <div>
                                <Label className='mb-1'>Request URL</Label>
                                <div className="bg-muted rounded-lg p-3 mt-2">
                                    <code className="text-xs break-all font-mono text-foreground">
                                        {fullUrl}
                                    </code>
                                </div>
                            </div>

                            <Button
                                onClick={handleExecuteRequest}
                                disabled={isExecuting}
                                className="w-full"
                            >
                                {isExecuting ? (
                                    <>
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Executing...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Send Request
                                    </>
                                )}
                            </Button>

                            {response && (
                                <Tabs defaultValue="response" className="w-full mt-4">
                                    <TabsList className="grid grid-cols-4 w-full">
                                        <TabsTrigger value="response">Response</TabsTrigger>
                                        <TabsTrigger value="typescript">TypeScript</TabsTrigger>
                                        <TabsTrigger value="request">Request Headers</TabsTrigger>
                                        <TabsTrigger value="response-headers">Response Headers</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="request">
                                        <div className="border rounded-lg overflow-hidden">
                                            <div className="bg-muted px-4 py-2 font-semibold text-sm">Request Headers</div>
                                            <SyntaxHighlighter
                                                language="json"
                                                style={syntaxTheme}
                                                customStyle={{
                                                    borderRadius: "0.5rem",
                                                    fontSize: "0.75rem",
                                                    padding: "1rem",
                                                    marginTop: 0,
                                                }}
                                            >
                                                {JSON.stringify(getRequestHeaders(), null, 2)}
                                            </SyntaxHighlighter>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="response-headers">
                                        <div className="border rounded-lg overflow-hidden">
                                            <div className="bg-muted px-4 py-2 font-semibold text-sm">Response Headers</div>
                                            <SyntaxHighlighter
                                                language="json"
                                                style={syntaxTheme}
                                                customStyle={{
                                                    borderRadius: "0.5rem",
                                                    fontSize: "0.75rem",
                                                    padding: "1rem",
                                                    marginTop: 0,
                                                }}
                                            >
                                                {JSON.stringify(response.headers || {}, null, 2)}
                                            </SyntaxHighlighter>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="typescript">
                                        <div className="border rounded-lg overflow-hidden">
                                            <div className="bg-muted px-4 py-3 border-b">
                                                <h4 className="font-semibold">TypeScript Interface</h4>
                                            </div>
                                            {(() => {
                                                const tsContent = response.data ? (
                                                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                                                    require('@/lib/jsonToTs').jsonToTs(response.data, 'Response')
                                                ) : '// No data';

                                                return (
                                                    <div className="relative group">
                                                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <CopyButton text={tsContent} />
                                                        </div>
                                                        <SyntaxHighlighter
                                                            language="typescript"
                                                            style={syntaxTheme}
                                                            customStyle={{
                                                                borderRadius: "0.5rem",
                                                                fontSize: "0.75rem",
                                                                padding: "1rem",
                                                                marginTop: 0,
                                                            }}
                                                        >
                                                            {tsContent}
                                                        </SyntaxHighlighter>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="response">
                                        <div className="border rounded-lg overflow-hidden">
                                            <div className="bg-muted px-4 py-3 border-b">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold">Response</h4>
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <span
                                                            className={`font-semibold ${response.status < 300 ? "text-green-600" : "text-red-600"
                                                                }`}
                                                        >
                                                            {response.status} {response.statusText}
                                                        </span>
                                                        <span className="text-muted-foreground">{response.time}ms</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {(() => {
                                                const contentType = Object.entries(response.headers || {}).find(([k]) => k.toLowerCase() === 'content-type')?.[1] || '';

                                                if (contentType.toLowerCase().includes('text/html')) {
                                                    return (
                                                        <div className="w-full h-96 bg-white border-b-0">
                                                            <iframe
                                                                srcDoc={response.data as string}
                                                                className="w-full h-full border-none"
                                                                sandbox="allow-scripts"
                                                                title="Response Preview"
                                                            />
                                                        </div>
                                                    );
                                                }

                                                const isJson = contentType.includes('application/json') || typeof response.data === 'object';
                                                const content = typeof response.data === 'object'
                                                    ? JSON.stringify(response.data, null, 2)
                                                    : String(response.data);

                                                return (
                                                    <div className="relative group">
                                                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <CopyButton text={content} />
                                                        </div>
                                                        <SyntaxHighlighter
                                                            language={isJson ? "json" : "text"}
                                                            style={syntaxTheme}
                                                            customStyle={{
                                                                borderRadius: "0.5rem",
                                                                fontSize: "0.75rem",
                                                                padding: "1rem",
                                                                marginTop: 0,
                                                            }}
                                                        >
                                                            {content}
                                                        </SyntaxHighlighter>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            )}

                            {error && (
                                <div className="border border-destructive rounded-lg p-4 bg-destructive/10">
                                    <h4 className="font-semibold text-destructive mb-2">Error</h4>
                                    <p className="text-sm text-destructive">{error}</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="sample" className="space-y-4">
                            <div>
                                <Label htmlFor="language" className='mb-2'>Language</Label>
                                <Select value={selectedCodeLang} onValueChange={setSelectedCodeLang}>
                                    <SelectTrigger id="language" className='w-full'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="curl">cURL</SelectItem>
                                        <SelectItem value="python">Python</SelectItem>
                                        <SelectItem value="javascript">JavaScript</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="relative">
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    onClick={() => {
                                        const code = selectedCodeLang === 'curl' ? generateCurl() : selectedCodeLang === 'python' ? generatePython() : generateJavaScript();
                                        copyToClipboard(code);
                                    }}
                                    className="absolute top-2 right-2 z-10"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                                <SyntaxHighlighter
                                    language={selectedCodeLang === 'curl' ? 'bash' : selectedCodeLang === 'python' ? 'python' : 'javascript'}
                                    style={syntaxTheme}
                                    customStyle={{
                                        borderRadius: '0.5rem',
                                        fontSize: '0.75rem',
                                        padding: '1rem',
                                        marginTop: 0,
                                    }}
                                >
                                    {selectedCodeLang === 'curl' ? generateCurl() : selectedCodeLang === 'python' ? generatePython() : generateJavaScript()}
                                </SyntaxHighlighter>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default CodeExecution;