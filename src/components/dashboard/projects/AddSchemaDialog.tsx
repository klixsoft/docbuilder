'use client';

import { useState, useRef } from 'react';
import { addSchema } from '@/app/actions/project';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Globe, FileCode, Upload, FileJson, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddSchemaDialogProps {
    projectId: string;
    projectName: string;
}

export function AddSchemaDialog({ projectId, projectName }: AddSchemaDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'url' | 'content' | 'file'>('url');
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setFileContent(content);
                setFileName(file.name);
                toast.success(`File "${file.name}" loaded successfully`);
            };
            reader.readAsText(file);
        }
    };

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        formData.append('projectId', projectId);

        if (activeTab === 'url') {
            formData.append('schemaSource', 'URL');
        } else if (activeTab === 'content') {
            formData.append('schemaSource', 'CONTENT');
        } else if (activeTab === 'file') {
            formData.append('schemaSource', 'CONTENT');
            if (fileContent) {
                formData.append('schemaContent', fileContent);
            } else {
                toast.error('Please select a file first');
                setIsLoading(false);
                return;
            }
        }

        const result = await addSchema(formData);

        setIsLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Schema added successfully');
            setIsOpen(false);
            setFileContent(null);
            setFileName(null);
            router.refresh();
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="shadow-sm">
                    <Plus className="size-4 mr-2" />
                    Add Schema
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Add Schema Version</DialogTitle>
                    <DialogDescription>
                        Integrate a new API specification into <strong>{projectName}</strong>.
                        You can link a remote URL, paste raw content, or upload a local file.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <div className="grid gap-6 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Version / Schema Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Production v1.2, Beta Internal" required className="h-11" />
                        </div>

                        <div className="grid gap-3">
                            <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Import Method</Label>
                            <Tabs defaultValue="url" className="w-full" onValueChange={(v) => setActiveTab(v as 'url' | 'content' | 'file')}>
                                <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50 border border-border/40">
                                    <TabsTrigger value="url" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                        <Globe className="size-4" />
                                        Remote URL
                                    </TabsTrigger>
                                    <TabsTrigger value="content" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                        <FileCode className="size-4" />
                                        Raw Content
                                    </TabsTrigger>
                                    <TabsTrigger value="file" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                        <Upload className="size-4" />
                                        File Upload
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="url" className="mt-6 animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid gap-3 p-6 rounded-xl border-2 border-dashed border-border/60 bg-muted/20">
                                        <div className="flex items-center justify-center size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-2">
                                            <Globe className="size-5 text-blue-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="schemaUrl" className="text-base font-semibold">Schema URL</Label>
                                            <p className="text-xs text-muted-foreground">The system will fetch and store the content from this URL whenever a refresh is triggered.</p>
                                        </div>
                                        <Input id="schemaUrl" name="schemaUrl" placeholder="https://api.example.com/spec/v1.yaml" required={activeTab === 'url'} className="h-11 bg-background" />
                                    </div>
                                </TabsContent>

                                <TabsContent value="content" className="mt-6 animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid gap-3">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="schemaContent" className="text-base font-semibold">Raw Specification (YAML/JSON)</Label>
                                            <span className="text-[10px] font-bold uppercase py-1 px-2 rounded bg-muted text-muted-foreground">OAS 3.0+ Preferred</span>
                                        </div>
                                        <Textarea id="schemaContent" name="schemaContent" className="font-mono h-[350px] bg-muted/10 resize-none text-[13px] leading-relaxed border-border/60" placeholder="openapi: 3.0.0..." required={activeTab === 'content'} />
                                    </div>
                                </TabsContent>

                                <TabsContent value="file" className="mt-6 animate-in slide-in-from-top-2 duration-300">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group"
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".yaml,.yml,.json"
                                            onChange={handleFileChange}
                                        />
                                        {fileName ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                                                    <FileJson className="size-8" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-bold text-foreground">{fileName}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Ready to upload</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase mt-2">
                                                    <CheckCircle2 className="size-3" />
                                                    Validated
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                                                    <Upload className="size-8" />
                                                </div>
                                                <div className="mt-6 text-center">
                                                    <p className="font-bold text-lg">Click to select file</p>
                                                    <p className="text-sm text-muted-foreground mt-1">Supports OpenAPI specs in YAML or JSON format</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                    <DialogFooter className="gap-3 sm:gap-0 border-t border-border/40 pt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="px-8 shadow-md">
                            {isLoading ? 'Processing...' : 'Add Schema Version'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
