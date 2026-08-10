import React from 'react'

const Input = ({ placeholder = "some text", type = "text", size = "sm", className, value, ...props }) => {
    const sizes = {
        sm: 'w-50 h-10 px-3',
        md: 'w-70 h-20 px-3 text-md',
        lg: 'h-30 p-2 w-70'
    };

    const base = "text-text bg-bg rounded-lg outline-0 "

    return (
        <>
            {size === "lg" ?
                <textarea placeholder={placeholder} className={`${base} ${sizes[size]} ${className}`} /> :
                <input type={type} placeholder={placeholder} className={`${base} ${sizes[size]} ${className}`} value={value} {...props}/>
            }
        </>
    )
}

export default Input