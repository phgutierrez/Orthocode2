import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProcedureSelector } from './ProcedureSelector';
import { AnatomicRegion, ProcedureType } from '@/types/procedure';

interface Procedure {
    id: string;
    name: string;
    codes: { tuss: string };
    region: AnatomicRegion;
    type: ProcedureType;
    porte?: string;
}

interface PackageFormProps {
    editingId: string | null;
    initialName?: string;
    initialDescription?: string;
    initialSelectedProcedures?: string[];
    procedures: Procedure[];
    favorites: string[];
    onSubmit: (data: { name: string; description: string; procedureIds: string[] }) => void;
    onCancel: () => void;
}

export function PackageForm({
    editingId,
    initialName = '',
    initialDescription = '',
    initialSelectedProcedures = [],
    procedures,
    favorites,
    onSubmit,
    onCancel,
}: PackageFormProps) {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [selectedProcedures, setSelectedProcedures] = useState<string[]>(initialSelectedProcedures);

    const handleToggleProcedure = (id: string) => {
        setSelectedProcedures((current) =>
            current.includes(id) ? current.filter(item => item !== id) : [...current, id]
        );
    };

    const handleSubmit = () => {
        onSubmit({
            name: name.trim(),
            description: description.trim(),
            procedureIds: selectedProcedures,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">
                    {editingId ? 'Editar pacote' : 'Novo pacote'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="package-name" className="text-sm font-medium text-foreground">Nome do pacote</label>
                    <Input
                        id="package-name"
                        placeholder="Ex.: Artroscopia Joelho"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="package-description" className="text-sm font-medium text-foreground">Descrição (opcional)</label>
                    <Textarea
                        id="package-description"
                        placeholder="Detalhes adicionais para este pacote"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />
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
                        {editingId ? 'Salvar alterações' : 'Criar pacote'}
                    </Button>
                    {editingId && (
                        <Button variant="outline" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
