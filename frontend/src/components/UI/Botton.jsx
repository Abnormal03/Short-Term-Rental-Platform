export function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
    const base = 'rounded-lg transition-all';
    const variants = {
        primary: 'bg-primary text-button-text',
        outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
        ghost: 'text-gray-500 hover:bg-gray-100 border',
        secondary: 'bg-secondary text-text'
    };
    const sizes = {
        sm: 'px-4 py-1.5',
        md: 'px-5 py-2',
        lg: 'px-7 py-2',
        xl: 'px-10 py-3',
        wide: 'px-20 py-3 w-full'
    };

    return (
        <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
}

export default Button