import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { InputField } from './InputField';

interface RHFInputFieldProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T, any>;
    label: string;
    placeholder?: string;
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    secureTextEntry?: boolean;
}

export function RHFInputField<T extends FieldValues>({
    name,
    control,
    ...props
}: RHFInputFieldProps<T>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <InputField
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
