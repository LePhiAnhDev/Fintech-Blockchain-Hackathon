import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({
    value,
    onChange,
    options = [],
    placeholder = "Select option...",
    className = "",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Find selected option based on value
        const option = options.find(opt => opt.value === value);
        setSelectedOption(option);
    }, [value, options]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleOptionClick = (option) => {
        onChange(option.value);
        setSelectedOption(option);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Selected Value Display */}
            <button
                type="button"
                onClick={toggleDropdown}
                disabled={disabled}
                className={`
                    w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white 
                    focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 
                    transition-colors flex items-center justify-between
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600/50 cursor-pointer'}
                    ${isOpen ? 'border-blue-500/50 ring-1 ring-blue-500/25' : ''}
                `}
            >
                <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''
                        }`}
                />
            </button>

            {/* Dropdown Options */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700/50 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {options.map((option, index) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleOptionClick(option)}
                            className={`
                                w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors
                                flex items-center justify-between
                                ${index === 0 ? 'rounded-t-lg' : ''}
                                ${index === options.length - 1 ? 'rounded-b-lg' : ''}
                                ${selectedOption?.value === option.value ? 'bg-blue-500/20 text-blue-300' : 'text-gray-300'}
                            `}
                        >
                            <span>{option.label}</span>
                            {selectedOption?.value === option.value && (
                                <Check className="w-4 h-4 text-blue-400" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect; 