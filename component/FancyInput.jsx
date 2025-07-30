import React from 'react';
import { Icon } from '@iconify/react';

const FancyInput = ({
    field,
    label,
    icon,
    type = 'text',
    placeholder = '',
    value,
    onChange,
    error,
    focusedField,
    setFocusedField
}) => {
    const isFocused = focusedField === field;
    const hasValue = value?.length > 0;
    const hasError = !!error;

    return (
        <div className="mb-6 group">
            <label className="text-sm font-semibold text-gray-700 block mb-2 transition-colors duration-200 group-hover:text-orange-600">
                {label}
            </label>
            <div className="relative">
                <div
                    className={`
                        flex items-center rounded-xl px-4 py-3.5 w-full transition-all duration-300
                        ${hasError
                            ? 'border-2 border-red-400 bg-red-50 shadow-sm'
                            : isFocused
                                ? 'border-2 border-orange-500 bg-white shadow-lg shadow-orange-100'
                                : hasValue
                                    ? 'border-2 border-gray-300 bg-white shadow-sm hover:shadow-md'
                                    : 'border-2 border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 hover:shadow-sm'
                        }
                    `}
                >
                    {icon && (
                        <Icon
                            className={`
                                text-xl mr-3 transition-colors duration-300
                                ${hasError
                                    ? 'text-red-500'
                                    : isFocused
                                        ? 'text-orange-600'
                                        : hasValue
                                            ? 'text-gray-600'
                                            : 'text-gray-400'
                                }
                            `}
                            icon={icon}
                        />
                    )}
                    <input
                        type={type}
                        name={field}
                        value={value}
                        onChange={onChange}
                        onFocus={() => setFocusedField(field)}
                        onBlur={() => setFocusedField('')}
                        placeholder={placeholder}
                        className={`
                            bg-transparent w-full outline-none text-base font-medium transition-colors duration-200
                            ${hasError ? 'text-red-700 placeholder-red-400' : 'text-gray-800 placeholder-gray-500'}
                        `}
                        required
                    />
                </div>

                {hasError && (
                    <p className="text-sm text-red-600 font-medium mt-2">{error}</p>
                )}
            </div>
        </div>
    );
};

export default FancyInput;
