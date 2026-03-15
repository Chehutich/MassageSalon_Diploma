import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Checkbox } from './Checkbox';

interface RHFCheckboxProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T, any>;
    label: string;
}

export function RHFCheckbox<T extends FieldValues>({
    name,
    control,
    label,
}: RHFCheckboxProps<T>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Checkbox
                    checked={value}
                    onToggle={() => onChange(!value)}
                    label={label}
                />
            )}
        />
    );
}
