import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatETB(number) {
    return `ETB ${number.toLocaleString()}`
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-ET', { day: 'numeric', month: 'short', year: 'numeric' })
}