import React from 'react';

export const WeatherIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-2.666-5.113 5.25 5.25 0 00-10.512 1.432 4.5 4.5 0 00-1.246 8.418" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75v.008h.008v-.008h-.008z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75v.008h.008v-.008h-.008z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75v.008h.008v-.008h-.008z" />
    </svg>
);
