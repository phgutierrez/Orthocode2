import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { OpmeItem } from '@/types/package';

interface OpmeFormProps {
    opmes: OpmeItem[];
    onAdd: (data: { name: string; description: string; value: number }) => void;
    onUpdate: (id: string, data: { name: string; description: string; value: number }) => void;
    onDelete: (id: string) => void;
    formatCurrency: (value: number) => string;
}

export function OpmeForm({
    opmes,
    onAdd,
    onUpdate,
    onDelete,
    formatCurrency,
}: OpmeFormProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [value, setValue] = useState(0);

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setDescription('');
        setValue(0);
    };

    const handleEdit = (id: string) => {
        const opme = opmes.find(item => item.id === id);
        if (!opme) return;
        setEditingId(opme.id);
        setName(opme.name);
        setDescription(opme.description ?? '');
        setValue(opme.value ?? 0);
    };

    const handleSubmit = () => {
        const payload = {
            name: name.trim(),
            description: description.trim(),
            value: value || 0,
        };

        if (editingId) {
            onUpdate(editingId, payload);
        } else {
            onAdd(payload);
        }

        resetForm();
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{editingId ? 'Editar OPME' : 'Novo OPME'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="opme-name" className="text-sm font-medium text-foreground">Nome do OPME</label>
                        <Input
                            id="opme-name"
                            placeholder="Ex.: Parafuso Canulado"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="opme-description" className="text-sm font-medium text-foreground">Descrição (opcional)</label>
                        <Textarea
                            id="opme-description"
                            placeholder="Detalhes adicionais"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="opme-value" className="text-sm font-medium text-foreground">Valor (R$)</label>
                        <Input
                            id="opme-value"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={value}
                            onChange={(event) => setValue(Number(event.target.value) || 0)}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button className="flex-1 gap-2" onClick={handleSubmit}>
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Salvar OPME' : 'Criar OPME'}
                        </Button>
                        {editingId && (
                            <Button variant="outline" onClick={resetForm}>
                                Cancelar
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">OPMEs cadastrados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {opmes.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            Nenhum OPME cadastrado.
                        </p>
                    ) : (
                        opmes.map((item) => (
                            <Card key={item.id} className="border">
                                <CardContent className="p-4 flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-foreground">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(item.value)}</p>
                                        {item.description && (
                                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleEdit(item.id)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => onDelete(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
