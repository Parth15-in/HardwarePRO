import { twMerge } from 'tailwind-merge';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'slate';
    size?: 'sm' | 'md';
    className?: string;
}

export const Badge = ({ children, variant = 'slate', size = 'sm', className }: BadgeProps) => {
    const variants = {
        success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        warning: 'bg-amber-100 text-amber-800 border-amber-200',
        danger: 'bg-rose-100 text-rose-800 border-rose-200',
        info: 'bg-slate-900 text-white border-slate-900',
        slate: 'bg-slate-100 text-slate-800 border-slate-200',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
    };

    return (
        <span className={twMerge(`inline-flex items-center font-bold uppercase tracking-wider border rounded-full ${variants[variant]} ${sizes[size]}`, className)}>
            {children}
        </span>
    );
};
