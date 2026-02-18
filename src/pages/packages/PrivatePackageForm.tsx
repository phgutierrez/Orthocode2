import { useState } from 'react';
import { Plus, Clipboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProcedureSelector } from './ProcedureSelector';
import { OpmeSelectModal } from './OpmeSelectModal';
import { AnatomicRegion, ProcedureType } from '@/types/procedure';
import type { OpmeItem } from '@/types/package';

interface Procedure {
    id: string;
    name: string;
    codes: { tuss: string };
    region: AnatomicRegion;
    type: ProcedureType;
    porte?: string;
}

interface PackageItem {
    id: string;
    name: string;
    procedureIds: string[];
}

interface PrivatePackageFormProps {
    editingId: string | null;
    initialName?: string;
    initialDescription?: string;
    initialSelectedProcedures?: string[];
    initialSelectedOpmes?: string[];
    initialOpmeEnabled?: boolean;
    initialSurgeonValue?: number;
    initialAnesthetistValue?: number;
    initialAssistantValue?: number;
    procedures: Procedure[];
    favorites: string[];
    opmes: OpmeItem[];
    standardPackages: PackageItem[];
    onSubmit: (data: {
        name: string;
        description: string;
        procedureIds: string[];
        opmeIds: string[];
        surgeonValue: number;
        anesthetistValue: number;
        assistantValue: number;
    }) => void;
    onCancel: () => void;
    onImportFromPackage: (packageId: string) => void;
    formatCurrency: (value: number) => string;
}

export function PrivatePackageForm({
    editingId,
    initialName = '',
    initialDescription = '',
    initialSelectedProcedures = [],
    initialSelectedOpmes = [],
    initialOpmeEnabled = false,
    initialSurgeonValue = 0,
    initialAnesthetistValue = 0,
    initialAssistantValue = 0,
    procedures,
    favorites,
    opmes,
    standardPackages,
    onSubmit,
    onCancel,
    onImportFromPackage,
    formatCurrency,
}: PrivatePackageFormProps) {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [selectedProcedures, setSelectedProcedures] = useState<string[]>(initialSelectedProcedures);
    const [selectedOpmes, setSelectedOpmes] = useState<string[]>(initialSelectedOpmes);
    const [opmeEnabled, setOpmeEnabled] = useState(initialOpmeEnabled);
    const [surgeonValue, setSurgeonValue] = useState(initialSurgeonValue);
    const [anesthetistValue, setAnesthetistValue] = useState(initialAnesthetistValue);
    const [assistantValue, setAssistantValue] = useState(initialAssistantValue);
    const [showOpmeSelect, setShowOpmeSelect] = useState(false);

    const handleToggleProcedure = (id: string) => {
        setSelectedProcedures((current) =>
            current.includes(id) ? current.filter(item => item !== id) : [...current, id]
        );
    };

    const handleToggleOpme = (id: string) => {
        setSelectedOpmes((current) =>
            current.includes(id) ? current.filter(item => item !== id) : [...current, id]
        );
    };

    const handleImportFromPackage = (packageId: string) => {
        const pkg = standardPackages.find(item => item.id === packageId);
        if (!pkg) return;

        const current = new Set(selectedProcedures);
        const before = current.size;
        pkg.procedureIds.forEach(procId => current.add(procId));
        const added = current.size - before;

        setSelectedProcedures(Array.from(current));

        // Notify parent (for any additional logic)
        onImportFromPackage(packageId);
    };

    const handleSubmit = () => {
        onSubmit({
            name: name.trim(),
            description: description.trim(),
            procedureIds: selectedProcedures,
            opmeIds: opmeEnabled ? selectedOpmes : [],
            surgeonValue: surgeonValue || 0,
            anesthetistValue: anesthetistValue || 0,
            assistantValue: assistantValue || 0,
        });
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        {editingId ? 'Editar pacote particular' : 'Novo pacote particular'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="private-package-name" className="text-sm font-medium text-foreground">Nome do pacote</label>
                        <Input
                            id="private-package-name"
                            placeholder="Ex.: Artroscopia Particular"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="private-package-description" className="text-sm font-medium text-foreground">Descrição (opcional)</label>
                        <Textarea
                            id="private-package-description"
                            placeholder="Detalhes adicionais para este pacote"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-medium text-foreground">Valores do pacote</div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1">
                                <label htmlFor="surgeon-value" className="text-xs text-muted-foreground">Cirurgião principal</label>
                                <Input
                                    id="surgeon-value"
                                    type="number"
                                    step="0.01"
                                    value={surgeonValue}
                                    onChange={(event) => setSurgeonValue(Number(event.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="anesthetist-value" className="text-xs text-muted-foreground">Anestesista</label>
                                <Input
                                    id="anesthetist-value"
                                    type="number"
                                    step="0.01"
                                    value={anesthetistValue}
                                    onChange={(event) => setAnesthetistValue(Number(event.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="assistant-value" className="text-xs text-muted-foreground">Auxiliar</label>
                                <Input
                                    id="assistant-value"
                                    type="number"
                                    step="0.01"
                                    value={assistantValue}
                                    onChange={(event) => setAssistantValue(Number(event.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-medium text-foreground">OPME</div>
                        <RadioGroup
                            className="flex gap-4"
                            value={opmeEnabled ? 'yes' : 'no'}
                            onValueChange={(value) => {
                                const enabled = value === 'yes';
                                setOpmeEnabled(enabled);
                                if (!enabled) {
                                    setSelectedOpmes([]);
                                }
                            }}
                        >
                            <label className="flex items-center gap-2 text-sm">
                                <RadioGroupItem value="yes" />
                                Sim
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <RadioGroupItem value="no" />
                                Não
                            </label>
                        </RadioGroup>

                        {opmeEnabled && (
                            <div className="flex items-center justify-between gap-3 pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => setShowOpmeSelect(true)}
                                >
                                    <Clipboard className="h-4 w-4" />
                                    Selecionar OP ME
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    {selectedOpmes.length} selecionado{selectedOpmes.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-medium text-foreground">Importar códigos</div>
                        {standardPackages.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Nenhum pacote encontrado para importar.
                            </p>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Clipboard className="h-4 w-4" />
                                        Importar de pacote
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
                                    {standardPackages.map((pkg) => (
                                        <DropdownMenuItem
                                            key={pkg.id}
                                            onClick={() => handleImportFromPackage(pkg.id)}
                                        >
                                            {pkg.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <ProcedureSelector
                        procedures={procedures}
                        selectedProcedureIds={selectedProcedures}
                        favorites={favorites}
                        onToggleProcedure={handleToggleProcedure}
                    />

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button className="flex-1 gap-2" onClick={handleSubmit}>
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Salvar alterações' : 'Criar pacote particular'}
                        </Button>
                        {editingId && (
                            <Button variant="outline" onClick={onCancel}>
                                Cancelar
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <OpmeSelectModal
                open={showOpmeSelect}
                opmes={opmes}
                selectedIds={selectedOpmes}
                onToggle={handleToggleOpme}
                onClose={() => setShowOpmeSelect(false)}
                formatCurrency={formatCurrency}
            />
        </>
    );
}
