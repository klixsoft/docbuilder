export function jsonToTs(json: unknown, rootName: string = 'Root'): string {
    const interfaces: string[] = [];
    const seenNames = new Set<string>();

    function getInterfaceName(name: string): string {
        let finalName = name.charAt(0).toUpperCase() + name.slice(1);
        // Remove 'S' from end if it looks like a plural for better naming (simple heuristic)
        if (finalName.endsWith('s') && finalName.length > 1) {
            // finalName = finalName.slice(0, -1); 
            // Actually, keep it simple for now to avoid bad singularization
        }

        let counter = 1;
        let uniqueName = finalName;
        while (seenNames.has(uniqueName)) {
            uniqueName = `${finalName}${counter}`;
            counter++;
        }
        seenNames.add(uniqueName);
        return uniqueName;
    }

    function getType(value: unknown, keyName: string): string {
        if (value === null) return 'null';
        if (Array.isArray(value)) {
            if (value.length === 0) return 'any[]';
            const firstType = getType(value[0], keyName);
            // Check if all items are same type? For now assume yes or mix
            // Simplification: just check first item
            return `${firstType}[]`;
        }
        if (typeof value === 'object') {
            const interfaceName = getInterfaceName(keyName);
            generateInterface(value as Record<string, unknown>, interfaceName);
            return interfaceName;
        }
        return typeof value;
    }

    function generateInterface(obj: Record<string, unknown>, name: string) {
        const lines: string[] = [`export interface ${name} {`];

        for (const [key, value] of Object.entries(obj)) {
            const type = getType(value, key);
            // Check if key is a valid identifier, quote if not
            const validKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
            lines.push(`  ${validKey}: ${type};`);
        }

        lines.push('}');
        interfaces.push(lines.join('\n'));
    }

    if (json === null) return 'export type Root = null;';
    if (typeof json !== 'object') return `export type Root = ${typeof json};`;

    if (Array.isArray(json)) {
        if (json.length === 0) return 'export type Root = any[];';
        const type = getType(json[0], rootName.endsWith('s') ? rootName.slice(0, -1) : 'Item');
        return `${interfaces.join('\n\n')}\n\nexport type ${rootName} = ${type}[];`;
    }

    generateInterface(json as Record<string, unknown>, rootName);
    return interfaces.reverse().join('\n\n'); // Reverse to show children before parents? Or after?
    // Actually standard is often dependents first or last. Let's return as is (parents first usually in recursive calls pushed later... wait.
    // My recursion pushes *after* calculating type of children.
    // Example: generateInterface(root) -> calls getType(child) -> calls generateInterface(child) -> push child
    // THEN pushes root.
    // so interfaces array has [child, root].
    // So reverse() gives [root, child]. That's fine.
    // Let's actually NOT reverse, so definitions come before usage? 
    // Typescript doesn't care about order of interfaces.
    // But reading top-down (Root first) is usually nicer for humans.
    // current array: [child, root].
    // reverse: [root, child]. Yes, let's reverse.
}
