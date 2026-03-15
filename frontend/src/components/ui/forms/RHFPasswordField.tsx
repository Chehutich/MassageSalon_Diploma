import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { PasswordField } from './PasswordField';

interface RHFPasswordFieldProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T, any>;
    label: string;
    placeholder?: string;
}

export function RHFPasswordField<T extends FieldValues>({
    name,
    control,
    ...props
}: RHFPasswordFieldProps<T>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <PasswordField
                    {...props}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    errorText={error?.message}
                    isInvalid={!!error}
                />
            )}
        />
    );
}
